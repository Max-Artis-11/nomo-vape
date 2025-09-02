import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";

// Time goals in seconds
const GOALS = [
  { label: "20 Minutes", seconds: 20 * 60 },
  { label: "1 Hour", seconds: 60 * 60 },
  { label: "12 Hours", seconds: 12 * 60 * 60 },
  { label: "1 Day", seconds: 24 * 60 * 60 },
  { label: "2 Days", seconds: 2 * 24 * 60 * 60 },
  { label: "3 Days", seconds: 3 * 24 * 60 * 60 },
  { label: "4 Days", seconds: 4 * 24 * 60 * 60 },
  { label: "5 Days", seconds: 5 * 24 * 60 * 60 },
  { label: "6 Days", seconds: 6 * 24 * 60 * 60 },
  { label: "1 Week", seconds: 7 * 24 * 60 * 60 },
  { label: "2 Weeks", seconds: 14 * 24 * 60 * 60 },
  { label: "3 Weeks", seconds: 21 * 24 * 60 * 60 },
  { label: "4 Weeks", seconds: 28 * 24 * 60 * 60 },
  { label: "1 Month", seconds: 30 * 24 * 60 * 60 },
  { label: "2 Months", seconds: 60 * 24 * 60 * 60 },
  { label: "3 Months", seconds: 90 * 24 * 60 * 60 },
  { label: "4 Months", seconds: 120 * 24 * 60 * 60 },
  { label: "5 Months", seconds: 150 * 24 * 60 * 60 },
  { label: "6 Months", seconds: 180 * 24 * 60 * 60 },
  { label: "7 Months", seconds: 210 * 24 * 60 * 60 },
  { label: "8 Months", seconds: 240 * 24 * 60 * 60 },
  { label: "9 Months", seconds: 270 * 24 * 60 * 60 },
  { label: "10 Months", seconds: 300 * 24 * 60 * 60 },
  { label: "11 Months", seconds: 330 * 24 * 60 * 60 },
  { label: "1 Year", seconds: 365 * 24 * 60 * 60 },
  { label: "2 Years", seconds: 2 * 365 * 24 * 60 * 60 },
  { label: "3 Years", seconds: 3 * 365 * 24 * 60 * 60 },
  { label: "5 Years", seconds: 5 * 365 * 24 * 60 * 60 },
];

export default function Achievements() {
  const [achieved, setAchieved] = useState({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Load previous achievements
  useEffect(() => {
    const load = async () => {
      const saved = await AsyncStorage.getItem("achievements");
      if (saved) setAchieved(JSON.parse(saved));
    };
    load();
  }, []);

  // Poll AsyncStorage for live elapsed time
  useEffect(() => {
    const updateElapsed = async () => {
      const stored = await AsyncStorage.getItem("timeElapsedSeconds");
      if (stored) setElapsedSeconds(parseInt(stored, 10));
    };
    updateElapsed();

    const interval = setInterval(updateElapsed, 2000);
    return () => clearInterval(interval);
  }, []);

  // Update achievements based on elapsedSeconds
  useEffect(() => {
    const updateAchievements = async () => {
      let newAchieved = { ...achieved };
      let changed = false;

      GOALS.forEach(goal => {
        if (elapsedSeconds >= goal.seconds && !newAchieved[goal.label]) {
          newAchieved[goal.label] = true;
          changed = true;
        }
      });

      if (changed) {
        setAchieved(newAchieved);
        await AsyncStorage.setItem("achievements", JSON.stringify(newAchieved));
      }
    };

    if (elapsedSeconds > 0) updateAchievements();
  }, [elapsedSeconds]);

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <ScrollView contentContainerStyle={{ paddingTop: 10, paddingBottom: 30 }}>
        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", paddingHorizontal: 20, marginTop: 10, marginBottom: 20 }}>
          <Text style={{ color: "#2E2E2E", fontSize: 30, fontWeight: "700" }}>
            Achievements & Badges
          </Text>
        </View>

        {Array.from({ length: Math.ceil(GOALS.length / 2) }).map((_, rowIndex) => (
          <View key={rowIndex} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
            {GOALS.slice(rowIndex * 2, rowIndex * 2 + 2).map((goal, i) => {
              const unlocked = achieved[goal.label];

              return (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: 210,
                    marginHorizontal: 5,
                    marginLeft: i === 0 ? 10 : 5,
                    marginRight: i === 1 ? 10 : 5,
                    backgroundColor: unlocked ? "#228B22" : "#A9A9A9",
                    borderRadius: 20,
                    alignItems: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 25,
                      color: "#FFF",
                      marginTop: unlocked ? 30 : 20, // push down if unlocked
                      textAlign: "center",
                      fontWeight: 700,
                    }}
                  >
                    {goal.label}
                  </Text>

                  {unlocked && (
                    <View style={{ position: "absolute", top: "50%", left: "50%", transform: [{ translateX: -25 }, { translateY: -25 }] }}>
                      <FontAwesome name="trophy" size={50} color="gold" />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
