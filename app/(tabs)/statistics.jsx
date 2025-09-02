import { supabase } from "@/lib/supabase";
import { Octicons } from "@expo/vector-icons";
import { eachDayOfInterval, format, subDays } from "date-fns";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // ✅ added

const { width } = Dimensions.get("window");
const WEEK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function Statistics() {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // ✅ added
  const [period, setPeriod] = useState("week");
  const [data, setData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [maxY, setMaxY] = useState(100);
  const [puffsToday, setPuffsToday] = useState(0);
  const [totalPeriod, setTotalPeriod] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        setUserData({
          name: data.user.user_metadata?.full_name || "",
        });
      }
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchData();
  }, [period, userId]);

  async function fetchData() {
    const now = new Date();
    const startDate = period === "week" ? subDays(now, 6) : subDays(now, 29);
    const startISO = startDate.toISOString().split("T")[0];
    const todayISO = now.toISOString().split("T")[0];

    const { data: puffsData, error } = await supabase
      .from("puffs")
      .select("date, puff_count")
      .eq("user_id", userId)
      .gte("date", startISO)
      .lte("date", todayISO)
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching puffs:", error);
      return;
    }

    const countsByDate = {};
    puffsData.forEach((entry) => {
      countsByDate[entry.date] = entry.puff_count;
    });

    const allDays = eachDayOfInterval({ start: startDate, end: now });
    const barArr = allDays.map((d) => {
      const dayKey = format(d, "yyyy-MM-dd");
      const dayLabel =
        period === "week" ? WEEK_DAYS[d.getDay()] : String(d.getDate());
      return {
        value: countsByDate[dayKey] || 0,
        label: dayLabel,
        frontColor: "#66C5CC",
      };
    });

    const maxPuff = Math.max(...barArr.map((item) => item.value), 0);
    setMaxY(Math.ceil(maxPuff * 1.3) || 100);
    setData(barArr);

    setPuffsToday(countsByDate[todayISO] || 0);
    setTotalPeriod(barArr.reduce((sum, b) => sum + b.value, 0));
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#ffffff", paddingTop: 10 }}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Top Row: Profile Icon */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          marginBottom: 10,
          marginTop: insets.top + 10, // ✅ added for safe area
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("/(auth)/profile")}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            borderWidth: 2,
            borderColor: "#E0E0E0",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#ffffff",
          }}
        >
          <Octicons name="person" size={26} color="#00D688" />
        </TouchableOpacity>
      </View>

      {/* Heading */}
      <Text
        style={{
          color: "#2E2E2E",
          fontSize: 25,
          fontWeight: "700",
          paddingHorizontal: 20,
          marginBottom: 20,
        }}
      >
        Statistics
      </Text>

      {/* Period Toggle */}
      <View
        style={{
          flexDirection: "row",
          alignSelf: "flex-start",
          backgroundColor: "#ffffff",
          borderRadius: 32,
          overflow: "hidden",
          marginLeft: 20,
          marginBottom: 20,
        }}
      >
        {["week", "month"].map((option) => {
          const isActive = period === option;
          return (
            <TouchableOpacity
              key={option}
              onPress={() => setPeriod(option)}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 24,
                backgroundColor: isActive ? "#66C5CC" : "#ffffff",
                borderRadius: 32,
              }}
            >
              <Text
                style={{
                  color: isActive ? "#ffffff" : "#2E2E2E",
                  fontSize: 18,
                  fontWeight: "700",
                }}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Summary Row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          borderRadius: 16,
          paddingVertical: 16,
          paddingHorizontal: 24,
          marginHorizontal: 20,
          marginBottom: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "700",
              color: "#2E2E2E",
              marginBottom: 4,
            }}
          >
            {puffsToday}
          </Text>
          <Text style={{ fontSize: 14, color: "gray", fontWeight: "600" }}>
            Puffs Today
          </Text>
        </View>
        <View>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "700",
              color: "#2E2E2E",
              marginBottom: 4,
            }}
          >
            {totalPeriod}
          </Text>
          <Text style={{ fontSize: 14, color: "gray", fontWeight: "600" }}>
            {period === "week" ? "By Week" : "By Month"}
          </Text>
        </View>
      </View>

      {/* Bar Chart */}
      <View
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 16,
          paddingVertical: 24,
          paddingHorizontal: 16,
          marginHorizontal: 20,
          marginBottom: 40,
          borderWidth: 5,
          borderColor: "#E0E0E0",
          alignSelf: "center",
          overflow: "hidden",
        }}
      >
        <BarChart
          data={data}
          width={width - 64}
          height={330}
          barWidth={35}
          spacing={7}
          initialSpacing={16}
          noOfSections={10}
          maxValue={maxY}
          yAxisThickness={3}
          xAxisThickness={2}
          yAxisStep={Math.ceil(maxY / 10)}
          yAxisLabelWidth={30}
          barBorderRadius={6}
          verticalLabelRotation={period === "month" ? 45 : 0}
          showLine={false}
          showSeparator={false}
          yAxisLabelStyle={{
            color: "#2E2E2E",
            fontSize: 14,
            fontWeight: "600",
            marginRight: 8,
          }}
          xAxisLabelTextStyle={{
            color: "#2E2E2E",
            fontSize: 16,
            fontWeight: "500",
          }}
          formatYLabel={(val) => parseInt(val).toString()}
        />
      </View>
    </ScrollView>
  );
}
