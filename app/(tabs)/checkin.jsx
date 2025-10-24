import { Entypo, FontAwesome6, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // <-- NEW
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

const circleSize = 42;  // bigger circles
const emojiSize = circleSize * 0.9;  // proportional emoji size

// Store all 75 fun facts in an array
const funFacts = [
  "Your lungs start to heal 2 weeks after quitting",
  "Your heart rate drops 20 minutes after quitting",
  "Oxygen levels improve within 12 hours",
  "Circulation improves after 2 weeks",
  "Taste and smell improve after quitting",
  "Risk of heart disease lowers within a year",
  "Risk of stroke drops in 5 years",
  "Energy levels rise after quitting",
  "Skin gets clearer after quitting",
  "You breathe easier within 1 month",
  "Coughing reduces after quitting",
  "Immune system strengthens",
  "Blood pressure lowers within 2 weeks",
  "Carbon monoxide leaves your body in 12 hours",
  "You save money every day you stay quit",
  "Sleep improves after quitting",
  "You reduce secondhand smoke risks for others",
  "Hair becomes healthier after quitting",
  "Quitting reduces risk of cancer",
  "Stress levels drop with quitting support",
  "You feel more energetic",
  "Fitness improves",
  "Food tastes better",
  "Breathing feels lighter",
  "You live longer",
  "Your family benefits too",
  "Confidence grows after quitting",
  "Skin ages slower after quitting",
  "Your body detoxes itself",
  "Risk of lung disease lowers",
  "Brain fog decreases",
  "Blood circulation improves",
  "Less coughing fits",
  "More money in your pocket",
  "More energy to exercise",
  "Better focus",
  "Better memory",
  "Improved mood",
  "Less fatigue",
  "Better hydration in skin",
  "Your voice gets stronger",
  "Clothes smell fresher",
  "Car smells fresher",
  "Home smells fresher",
  "Risk of diabetes lowers",
  "Your bones get stronger",
  "Less headaches",
  "Better breathing during sleep",
  "Less anxiety",
  "Better fertility",
  "Lower risk of heart attack",
  "Better mental clarity",
  "Lower stress chemicals",
  "Risk of gum disease drops",
  "Stronger teeth",
  "Fresher breath",
  "Better workouts",
  "Less wheezing",
  "Healthier pregnancy outcomes",
  "Lower risk of stroke",
  "Your pets are healthier too",
  "You inspire others",
  "Sense of smell sharpens",
  "Less chest tightness",
  "Better circulation to hands and feet",
  "Your skin glows",
  "Healthier eyes",
  "Improved digestion",
  "Your blood becomes cleaner",
  "More oxygen for your brain",
  "Longer life expectancy",
  "Your risk of sudden death drops",
  "You cough less",
  "You protect your loved ones",
  "You feel proud",
  "You are in control",
  "Every day you heal more",
];


const CHECKIN_MESSAGES = [
  "You just checked in!",
  "Great job taking care of yourself!",
  "Another mindful moment logged!",
  "Way to stay consistent!",
  "You’re doing amazing!",
  "Small steps, big progress!",
  "Your well-being matters!",
  "One check-in at a time!",
  "Proud of you!",
  "Keep going strong!",
  "Mindfulness in action!",
  "A little progress every day!",
  "Consistency is key!",
  "You're building a habit!",
  "Your future self thanks you!",
  "Stay present, stay strong!",
  "Healthy mind, healthy life!",
  "Celebrating your effort!",
  "Look at you go!",
  "Keep the momentum alive!",
  "You're prioritizing YOU!",
  "Growth happens daily!",
  "This is self-love!",
  "Check-in complete!",
  "On the right track!",
  "Your journey matters!",
  "Wellness is winning!",
  "Strong mind, strong life!",
  "Another step forward!",
  "Celebrate this moment!",
  "You're unstoppable!",
  "This matters!",
  "You're showing up for you!",
  "Little wins matter!",
  "Another day, another check-in!",
  "Keep caring for your mind!",
  "Stay mindful, stay you!",
  "You're growing every day!",
  "Well done!",
  "Self-awareness is power!",
  "Keep it up!",
  "You're in control!",
  "Consistency builds success!",
  "Proud moment!",
  "Investing in yourself!",
  "You're doing the work!",
  "That’s dedication!",
  "Keep shining!",
  "You're building resilience!",
];

let messageIndex = 0; // keep track globally



const SCREEN_WIDTH = Dimensions.get("window").width;
const BOX_WIDTH = (SCREEN_WIDTH - 20 * 2 - 20) / 2;

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getLast7DaysLabels() {
  const today = new Date();
  const labels = [];
  for (let i = 6; i >= 0; i--) {
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - i);
    labels.push(dayLabels[pastDate.getDay()]);
  }
  return labels;
}

export default function Checkin() {
  const router = useRouter();

  const [journalPage, setJournalPage] = useState(1);

  const [entries, setEntries] = useState([]);
  const [text, setText] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("journalEntries");
        if (saved) setEntries(JSON.parse(saved));
      } catch (e) {
        console.log("Error loading entries:", e);
      }
    })();
  }, []);

  const saveEntries = async (newEntries) => {
    try {
      await AsyncStorage.setItem("journalEntries", JSON.stringify(newEntries));
    } catch (e) {
      console.log("Error saving entries:", e);
    }
  };

  const handleJournalFinish = () => {
    if (!text.trim()) {
      setJournalPage(1);
      return;
    }

    const now = new Date();
    const dateOptions = { day: "numeric", month: "long" };
    const formattedDate = now.toLocaleDateString("en-US", dateOptions);

    let updatedEntries = [...entries];
    if (editingIndex !== null) {
      // Update existing entry
      updatedEntries[editingIndex] = { text, date: formattedDate };
    } else {
      // Add new entry at the top
      updatedEntries.unshift({ text, date: formattedDate });
    }

    setEntries(updatedEntries);
    saveEntries(updatedEntries);

    // Reset state
    setText("");
    setEditingIndex(null);
    setJournalPage(1);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setText(entries[index].text);
    setCurrentPage(2);
  };

  // Worries state
  const [pastWorries, setPastWorries] = useState([]); // saved worries
  // Format date like "5th of August"
  const formatDate = (dateObj) => {
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString("default", { month: "long" });

    // Handle ordinal suffix
    const suffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
        ? "rd"
        : "th";

    return `${day}${suffix} of ${month}`;
  };

  // Save new worry
  const handleSaveWorry = async (selectedWorryIndex) => {
    try {
      const worryText = worries[selectedWorryIndex];
      const now = new Date();
      const formattedDate = formatDate(now);

      const newWorry = {
        text: worryText,
        date: formattedDate,
      };

      const updatedWorries = [newWorry, ...pastWorries];
      setPastWorries(updatedWorries);

      await AsyncStorage.setItem("pastWorries", JSON.stringify(updatedWorries));
    } catch (err) {
      console.error("Error saving worry:", err);
    }
  };

  // Load worries on mount
  useEffect(() => {
    const loadWorries = async () => {
      try {
        const stored = await AsyncStorage.getItem("pastWorries");
        if (stored) {
          setPastWorries(JSON.parse(stored));
        }
      } catch (err) {
        console.error("Error loading worries:", err);
      }
    };
    loadWorries();
  }, []);



  const [currentFact, setCurrentFact] = useState("");

  useEffect(() => {
    // Get today's date in user's local timezone
    const today = new Date();

    // Get "day number" since Jan 1, 1970
    const dayNumber = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));

    // Cycle through 75 facts
    const factIndex = dayNumber % funFacts.length;

    // Set the fact of the day
    setCurrentFact(funFacts[factIndex]);
  }, []);

  const worries = [
    "I want to smoke",
    "My mouth hurts",
    "I feel stressed",
    "I can’t focus",
    "I feel anxious",
    "I miss old habits",
    "I had a bad day",
    "I feel lonely",
    "I’m nervous about work",
    "I’m tired",
    "I feel restless",
    "I want distraction",
    "I’m frustrated",
    "I’m bored",
    "I had a fight with someone",
    "I’m overthinking",
    "I feel sad",
    "I feel stuck",
    "I don’t know what to do",
    "I can’t sleep",
    "I feel pressured",
    "I want relief",
    "I’m uncomfortable",
    "I feel overwhelmed",
    "I need comfort",
    "I feel disappointed",
    "I’m nervous about tomorrow",
    "I feel tense",
    "I feel upset",
    "I feel trapped",
    "I feel shaky",
    "I feel guilty",
    "I’m worried about money",
    "I feel empty",
    "I feel homesick",
    "I’m worried about health",
    "I feel like giving up",
    "I feel hopeless",
    "I feel impatient",
    "I feel ignored",
    "I feel angry",
    "I feel jealous",
    "I feel ashamed",
    "I feel insecure",
    "I feel nervous",
    "I feel unsettled",
    "I feel drained",
    "I feel pressured by friends",
    "I’m scared",
    "I feel uncertain",
  ];

  const [currentPage, setCurrentPage] = useState(1); // 1 = main page, 2 = add worry page
  const [selectedWorry, setSelectedWorry] = useState(null);

  const [goalModalVisible, setGoalModalVisible] = useState(false);

  const [journalModalVisible, setJournalModalVisible] = useState(false);
  const [worriesModalVisible, setWorriesModalVisible] = useState(false);
  const [moods, setMoods] = useState({}); // { "2025-08-29": {emoji, indifferent}, ... }

  const [selectedEmoji, setSelectedEmoji] = useState(null);

  const [loadingGif, setLoadingGif] = useState(true);

  const circleCount = 7;
  const circleSize = 42; // slightly larger circles for better fit
  const emojiSize = circleSize * 0.9; // keep emoji proportional
  const sidePadding = 10;

  const labels = getLast7DaysLabels();

  const [modalVisible, setModalVisible] = useState(false); // default off
  const [page, setPage] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [checkinMessage, setCheckinMessage] = useState("");

  // Add this state at the top with your other states
  const [indifferentSelected, setIndifferentSelected] = useState(false);

  // Update handleFinish
  const handleFinish = async () => {
    try {
      const todayKey = new Date().toISOString().split("T")[0];
      const moodData = {
        emoji: selectedEmoji,
        indifferent: indifferentSelected,
        date: todayKey,
      };
      await AsyncStorage.setItem("mood_" + todayKey, JSON.stringify(moodData));
      await AsyncStorage.setItem("lastCheckinDate", todayKey);

      // 👉 Go to Page 3
      setPage(2);
    } catch (err) {
      console.error("Error saving checkin data:", err);
    }
  };

  // Helper: return YYYY-MM-DD for local timezone
  const getTodayKey = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (page === 2) {
      // cycle through messages
      setCheckinMessage(CHECKIN_MESSAGES[messageIndex]);
      messageIndex = (messageIndex + 1) % CHECKIN_MESSAGES.length;

      // close modal after 3 seconds
      const timer = setTimeout(() => {
        setModalVisible(false);
        setPage(0); // reset to start
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [page]);


  useEffect(() => {
    const loadMoods = async () => {
      try {
        const today = new Date();
        const temp = {};
        for (let i = 6; i >= 0; i--) {
          const pastDate = new Date();
          pastDate.setDate(today.getDate() - i);
          const key = pastDate.toISOString().split("T")[0];
          const data = await AsyncStorage.getItem("mood_" + key);
          if (data) temp[key] = JSON.parse(data);
        }
        setMoods(temp);
      } catch (err) {
        console.error("Error loading moods:", err);
      }
    };
    loadMoods();
  }, [modalVisible]); // reload when modal closes

  // Check on mount whether to show modal
  useEffect(() => {
    const checkModalStatus = async () => {
      try {
        const todayKey = getTodayKey();
        const lastCheckin = await AsyncStorage.getItem("lastCheckinDate");

        if (lastCheckin !== todayKey) {
          // new day → show modal
          setModalVisible(true);
        }
      } catch (err) {
        console.error("Error reading checkin date:", err);
      }
    };
    checkModalStatus();
  }, []);

  // Slide animation for page transition
  useEffect(() => {
    if (modalVisible) {
      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -Dimensions.get("window").width,
          duration: 600,
          useNativeDriver: true,
        }).start(() => setPage(1));
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [modalVisible]);

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <Modal visible={modalVisible} transparent={false} animationType="none">
        <View style={{ flex: 1, backgroundColor: "#FDFDFD" }}>
          {page < 2 ? (
            <Animated.View
              style={{
                flexDirection: "row",
                width: Dimensions.get("window").width * 2, // two pages side by side
                height: "100%",
                transform: [{ translateX: slideAnim }],
              }}
            >
              {/* -------- Page 1 -------- */}
              <View
                style={{
                  width: Dimensions.get("window").width,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Brain Gif with Loader */}
                <View style={{ alignItems: "center", justifyContent: "center" }}>
                  {loadingGif && (
                    <ActivityIndicator
                      size="large"
                      color="#2E2E2E"
                      style={{ position: "absolute" }}
                    />
                  )}
                  <Image
                    source={require("@/assets/gifs/braingif.gif")}
                    style={{ width: 300, height: 300, marginBottom: 20 }}
                    resizeMode="contain"
                    onLoadStart={() => setLoadingGif(true)}
                    onLoadEnd={() => setLoadingGif(false)}
                  />
                </View>

                {/* Question */}
                <Text
                  style={{
                    fontSize: 40,
                    fontWeight: "700",
                    color: "#2E2E2E",
                    textAlign: "center",
                    paddingHorizontal: 20,
                  }}
                >
                  How are you today?
                </Text>
              </View>

              {/* -------- Page 2 -------- */}
              <View
                style={{
                  width: Dimensions.get("window").width,
                  flex: 1,
                }}
              >
                {/* Today I'm feeling text */}
                <Text
                  style={{
                    marginTop: 80,
                    textAlign: "center",
                    color: "#228B22",
                    fontSize: 40,
                    fontWeight: "700",
                    paddingHorizontal: 20,
                  }}
                >
                  Today I'm feeling...
                </Text>

                {/* Emojis */}
                <View style={{ alignItems: "center", marginTop: 30 }}>
                  {/* Angry emoji */}
                  <TouchableOpacity
                    onPress={() => setSelectedEmoji("angry")}
                    style={{ marginBottom: 10, alignItems: "center" }}
                  >
                    <Text
                      style={{
                        fontSize: selectedEmoji === "angry" ? 110 : 100,
                      }}
                    >
                      😡
                    </Text>
                    <Text
                      style={{
                        marginTop: 10,
                        fontSize: selectedEmoji === "angry" ? 15 * 1.1 : 15,
                        fontWeight: "700",
                        color: "#2E2E2E",
                      }}
                    >
                      Anger
                    </Text>
                  </TouchableOpacity>

                  {/* Sadness & Disgust */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                      paddingHorizontal: 20,
                      marginBottom: 10,
                    }}
                  >
                    <View style={{ alignItems: "center" }}>
                      <TouchableOpacity onPress={() => setSelectedEmoji("sad")}>
                        <Text
                          style={{
                            fontSize: selectedEmoji === "sad" ? 110 : 100,
                          }}
                        >
                          😢
                        </Text>
                      </TouchableOpacity>
                      <Text
                        style={{
                          marginTop: 10,
                          fontSize: selectedEmoji === "sad" ? 15 * 1.1 : 15,
                          fontWeight: "700",
                          color: "#2E2E2E",
                        }}
                      >
                        Sadness
                      </Text>
                    </View>

                    <View style={{ alignItems: "center" }}>
                      <TouchableOpacity onPress={() => setSelectedEmoji("disgust")}>
                        <Text
                          style={{
                            fontSize: selectedEmoji === "disgust" ? 110 : 100,
                          }}
                        >
                          🤢
                        </Text>
                      </TouchableOpacity>
                      <Text
                        style={{
                          marginTop: 10,
                          fontSize: selectedEmoji === "disgust" ? 15 * 1.1 : 15,
                          fontWeight: "700",
                          color: "#2E2E2E",
                        }}
                      >
                        Disgust
                      </Text>
                    </View>
                  </View>

                  {/* Fear & Enjoyment */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                      paddingHorizontal: 20,
                      marginBottom: 10,
                    }}
                  >
                    <View style={{ alignItems: "center" }}>
                      <TouchableOpacity onPress={() => setSelectedEmoji("fear")}>
                        <Text
                          style={{
                            fontSize: selectedEmoji === "fear" ? 110 : 100,
                          }}
                        >
                          😱
                        </Text>
                      </TouchableOpacity>
                      <Text
                        style={{
                          marginTop: 10,
                          fontSize: selectedEmoji === "fear" ? 15 * 1.1 : 15,
                          fontWeight: "700",
                          color: "#2E2E2E",
                        }}
                      >
                        Fear
                      </Text>
                    </View>

                    <View style={{ alignItems: "center" }}>
                      <TouchableOpacity onPress={() => setSelectedEmoji("enjoyment")}>
                        <Text
                          style={{
                            fontSize: selectedEmoji === "enjoyment" ? 110 : 100,
                          }}
                        >
                          😁
                        </Text>
                      </TouchableOpacity>
                      <Text
                        style={{
                          marginTop: 10,
                          fontSize: selectedEmoji === "enjoyment" ? 15 * 1.1 : 15,
                          fontWeight: "700",
                          color: "#2E2E2E",
                        }}
                      >
                        Enjoyment
                      </Text>
                    </View>
                  </View>

                  {/* Calm emoji */}
                  <View style={{ alignItems: "center", marginTop: 10 }}>
                    <TouchableOpacity onPress={() => setSelectedEmoji("calm")}>
                      <Text
                        style={{
                          fontSize: selectedEmoji === "calm" ? 110 : 100,
                        }}
                      >
                        😌
                      </Text>
                    </TouchableOpacity>
                    <Text
                      style={{
                        marginTop: 10,
                        fontSize: selectedEmoji === "calm" ? 15 * 1.1 : 15,
                        fontWeight: "700",
                        color: "#2E2E2E",
                      }}
                    >
                      Calm
                    </Text>
                  </View>
                </View>


                {/* Indifferent option */}
                <TouchableOpacity
                  onPress={() => {
                    setSelectedEmoji(null);
                    setIndifferentSelected(!indifferentSelected);
                  }}
                  style={{
                    position: "absolute",
                    bottom: 140,
                    width: "100%",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "800",
                      fontSize: indifferentSelected ? 28 : 23,
                      color: "#2E2E2E",
                      textAlign: "center",
                    }}
                  >
                    I'm feeling indifferent today
                  </Text>
                </TouchableOpacity>

                {/* Continue button */}
                <TouchableOpacity
                  onPress={handleFinish}
                  style={{
                    backgroundColor: "#228B22",
                    width: Dimensions.get("window").width - 40,
                    height: 50,
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    position: "absolute",
                    bottom: 60,
                    left: 20,
                  }}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 20,
                      fontWeight: "700",
                    }}
                  >
                    Continue
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ) : (
            // -------- Page 3 --------
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(46,46,46,0.5)", // 50% dark grey overlay
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 40,
                  fontWeight: "700",
                  textAlign: "center",
                  paddingHorizontal: 20,
                }}
              >
                {checkinMessage}
              </Text>

              {/* 🎉 One burst of stars from center */}
              <ConfettiCannon
                count={50}
                origin={{
                  x: Dimensions.get("window").width / 2,
                  y: Dimensions.get("window").height / 2,
                }}
                autoStart={true}
                fadeOut={true}
                explosionSpeed={350}
                fallSpeed={2000}
              />
            </View>
          )}
        </View>
      </Modal>

      {/* --- Rest of your Checkin UI unchanged --- */}
      <ScrollView contentContainerStyle={{ paddingTop: 10, paddingBottom: 30 }}>
        {/* Top Row: Title */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            marginTop: 10,
          }}
        >
          <Text
            style={{
              color: "#2E2E2E",
              fontSize: 30,
              fontWeight: "700",
            }}
          >
            Check in
          </Text>
        </View>

        {/* White Rectangle - My Week */}
        <View
          style={{
            marginTop: 10,
            marginHorizontal: 20,
            borderRadius: 10,
            backgroundColor: "#ffffff",
            padding: 10,
          }}
        >
          {/* "My week" Label */}
          <Text
            style={{
              color: "#2E2E2E",
              fontSize: 23,
              fontWeight: "700",
            }}
          >
            My week
          </Text>

          {/* Circles + Labels */}
          <View
            style={{
              marginTop: 15,
              marginBottom: 15,
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: sidePadding,
            }}
          >
            {Array.from({ length: circleCount }).map((_, index) => {
              const pastDate = new Date();
              pastDate.setDate(new Date().getDate() - (circleCount - 1 - index));
              const key = pastDate.toISOString().split("T")[0];
              const mood = moods[key];

              return (
                <View key={index} style={{ alignItems: "center" }}>
                  <View
                    style={{
                      width: circleSize,
                      height: circleSize,
                      borderRadius: circleSize / 2,
                      backgroundColor: "#F3F3F3",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {mood?.emoji && (
                      <Text
                        style={{
                          fontSize: emojiSize,              // dynamic font size
                          textAlign: "center",              // center horizontally
                          textAlignVertical: "center",      // center vertically (Android)
                        }}
                      >
                        {mood.emoji === "angry" && "😡"}
                        {mood.emoji === "sad" && "😢"}
                        {mood.emoji === "disgust" && "🤢"}
                        {mood.emoji === "fear" && "😱"}
                        {mood.emoji === "enjoyment" && "😁"}
                        {mood.emoji === "calm" && "😌"}
                      </Text>
                    )}
                    {mood?.indifferent && (
                      <Text
                        style={{
                          fontSize: emojiSize * 0.3,
                          textAlign: "center",
                          textAlignVertical: "center",
                        }}
                      >
                        😐
                      </Text>
                    )}
                  </View>

                  <Text
                    style={{
                      marginTop: 0,
                      color: "#2E2E2E",
                      fontWeight: "700",
                      fontSize: 15,
                    }}
                  >
                    {labels[index]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
        
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 5,
            paddingHorizontal: 20, // 20 padding on both edges
          }}
        >
          <Text
            style={{
              color: "#2E2E2E",
              fontSize: 30,
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            "{currentFact}"
          </Text>
        </View>

        {/* Resources Title */}
        <View style={{ alignItems: "center", paddingTop: 20 }}>
          <Text
            style={{
              color: "#2E2E2E",
              fontSize: 30,
              fontWeight: "700",
            }}
          >
            Care Tools
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setWorriesModalVisible(true)}
          activeOpacity={0.7}
          style={{
            marginTop: 20,
            paddingHorizontal: 20,
          }}

        >
          <View
            style={{
              backgroundColor: "#228B22",
              borderRadius: 10,
              padding: 15,
              elevation: 2,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Left Section: Icon + Texts */}
            <View style={{ width: "70%" }}>
              {/* Top Row: Icon + Title */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <FontAwesome6
                  name="triangle-exclamation"
                  size={30}
                  color="#F05050"
                />

                <Text
                  style={{
                    color: "#FFF",
                    fontSize: 25,
                    fontWeight: "700",
                    marginLeft: 15,
                  }}
                >
                  Worries Log
                </Text>
              </View>

              {/* Subtitle */}
              <Text
                style={{
                  marginTop: 5,
                  fontSize: 19,
                  color: "#FFF",
                  width: "100%", // ensure it fits left side
                }}
                numberOfLines={2}
              >
                Have you got something on your mind?
              </Text>
            </View>

            {/* Right Arrow */}
            <FontAwesome6
              name="chevron-right"
              size={30}
              color="#F3F3F3"
              style={{ marginRight: 15 }}
            />
          </View>
        </TouchableOpacity>


        {/* Full-width Set a Goal Card */}
        <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => router.navigate("/(more)/achievements")}>

            <View
              style={{
                backgroundColor: "#228B22",
                borderRadius: 10,
                padding: 15,
                elevation: 2,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* Left Section: Icon + Texts */}
              <View style={{ width: "70%" }}>
                {/* Top Row: Icon + Title */}
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="sunny-sharp" size={30} color="#FFD742" />

                  <Text
                    style={{
                      color: "#FFF",
                      fontSize: 25,
                      fontWeight: "700",
                      marginLeft: 15,
                    }}
                  >
                    Goals
                  </Text>
                </View>

                {/* Subtitle */}
                <Text
                  style={{
                    marginTop: 5,
                    fontSize: 19,
                    color: "#FFF",
                    width: "100%",
                  }}
                  numberOfLines={2}
                >
                  Try and cut down through small steps
                </Text>
              </View>

              {/* Right Arrow */}
              <FontAwesome6
                name="chevron-right"
                size={30}
                color="#F3F3F3"
                style={{ marginRight: 15 }}
              />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setJournalModalVisible(true)} style={{ marginTop: 20, paddingHorizontal: 20}}>
          <View
            style={{
              backgroundColor: "#228B22",
              borderRadius: 10,
              padding: 15,
              elevation: 2,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Left Section: Icon + Texts */}
            <View style={{ width: "70%" }}>
              {/* Top Row: Icon + Title */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="person"
                  size={30}
                  color="#07C0C4"
                />

                <Text
                  style={{
                    color: "#FFF",
                    fontSize: 25,
                    fontWeight: "700",
                    marginLeft: 15,
                  }}
                >
                  Journal
                </Text>
              </View>

              {/* Subtitle */}
              <Text
                style={{
                  marginTop: 5,
                  fontSize: 19,
                  color: "#FFF",
                  width: "100%", // ensure it fits left side
                }}
                numberOfLines={2}
              >
                Journal memories, victories, loses and lessons learnt.
              </Text>
            </View>

            {/* Right Arrow */}
            <FontAwesome6
              name="chevron-right"
              size={30}
              color="#F3F3F3"
              style={{ marginRight: 15 }}
            />
          </View>
        </TouchableOpacity>

        <Modal visible={worriesModalVisible} animationType="slide" transparent={false}>
          <View style={{ flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 20 }}>
            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setWorriesModalVisible(false)}
              style={{
                position: "absolute",
                top: 60,
                right: 20,
                zIndex: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: "#F05050",
                  fontWeight: "700",
                }}
              >
                Close
              </Text>
            </TouchableOpacity>

            {currentPage === 1 ? (
              <>
                {/* Header */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 60,
                  }}
                >
                  <Text
                    style={{
                      color: "#2E2E2E",
                      fontSize: 30,
                      fontWeight: "700",
                    }}
                  >
                    Worries Log
                  </Text>
                </View>

                {/* Question Text */}
                <Text
                  style={{
                    marginTop: 25,
                    fontSize: 40,
                    fontWeight: "700",
                    color: "#F05050",
                    textAlign: "center",
                    paddingHorizontal: 20,
                  }}
                >
                  Have you got something on your mind?
                </Text>

                {/* Rectangle with Plus Icon */}
                <TouchableOpacity
                  onPress={() => setCurrentPage(2)}
                  style={{
                    marginTop: 20,
                    width: "100%",
                    height: 120,
                    borderRadius: 20,
                    borderWidth: 10,
                    borderColor: "#F3F3F3",
                    backgroundColor: "#FFFFFF",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FontAwesome6 name="plus" size={50} color="#F3F3F3" />
                </TouchableOpacity>

                {/* Past Worries Title */}
                <View style={{ alignItems: "center", paddingTop: 20 }}>
                  <Text
                    style={{
                      color: "#2E2E2E",
                      fontSize: 30,
                      fontWeight: "700",
                    }}
                  >
                    Past Worries
                  </Text>
                </View>

                {/* Past Worries List */}
                <ScrollView
                  style={{ marginTop: 20 }}
                  contentContainerStyle={{ paddingBottom: 40 }}
                >
                  {pastWorries.map((w, i) => (
                    <View key={i} style={{ marginBottom: 20, alignItems: "center" }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#A0A0A0",
                          marginBottom: 5,
                        }}
                      >
                        {w.date}
                      </Text>
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "700",
                          color: "#2E2E2E",
                        }}
                      >
                        {w.text}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            ) : (
              <>
                {/* Back Button */}
                <TouchableOpacity
                  onPress={() => setCurrentPage(1)}
                  style={{
                    position: "absolute",
                    top: 60,
                    left: 10,
                    zIndex: 10,
                  }}
                >
                  <Entypo name="chevron-left" size={30} color="#2E2E2E" />
                </TouchableOpacity>

                {/* Page Header */}
                <Text
                  style={{
                    marginTop: 110,
                    fontSize: 40,
                    fontWeight: "700",
                    color: "#F05050",
                  }}
                >
                  I have a worry
                </Text>

                {/* Subtitle */}
                <Text
                  style={{
                    marginTop: 20,
                    fontSize: 23,
                    fontWeight: "600",
                    color: "#2E2E2E",
                  }}
                >
                  What is the context?
                </Text>

                {/* Continue Button (appears under "What is the context?" text) */}
                {selectedWorry !== null && (
                  <TouchableOpacity
                    onPress={async () => {
                      await handleSaveWorry(selectedWorry);
                      setSelectedWorry(null);
                      setCurrentPage(1);
                      setWorriesModalVisible(false);
                    }}
                    style={{
                      marginTop: 15,
                      width: "100%",
                      height: 65,
                      borderRadius: 20,
                      backgroundColor: "#F05050",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "700",
                        color: "#FFFFFF",
                      }}
                    >
                      Continue
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Scrollable list of worries */}
                <ScrollView
                  style={{ marginTop: 25 }}
                  contentContainerStyle={{ paddingBottom: 40 }}
                >
                  {worries.map((worry, index) => {
                    const isSelected = selectedWorry === index;
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setSelectedWorry(index)}
                        style={{
                          width: "100%",
                          height: 50,
                          borderRadius: 13,
                          borderWidth: 3,
                          borderColor: isSelected ? "#F05050" : "#F3F3F3",
                          backgroundColor: "#FFFFFF",
                          justifyContent: "center",
                          paddingLeft: 10,
                          marginBottom: 15,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: isSelected ? "800" : "700",
                            color: isSelected ? "#F05050" : "#2E2E2E",
                          }}
                        >
                          {worry}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            )}
          </View>
        </Modal>
        
        <Modal visible={journalModalVisible} animationType="slide" transparent={false}>
          <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            {journalPage === 1 ? (
              <>
                {/* Top Section with Colored Header */}
                <View style={{ backgroundColor: "#E97601", paddingTop: 60, paddingHorizontal: 20 }}>
                  {/* Close Button */}
                  <TouchableOpacity
                    onPress={() => setJournalModalVisible(false)}
                    style={{
                      position: "absolute",
                      top: 60,
                      right: 20,
                      zIndex: 10,
                    }}
                  >
                    <Text style={{ fontSize: 18, color: "#FFFFFF", fontWeight: "700" }}>
                      Close
                    </Text>
                  </TouchableOpacity>

                  {/* Journal Title (top left) */}
                  <Text
                    style={{
                      marginTop: 0,
                      fontSize: 30,
                      fontWeight: "700",
                      color: "#FFFFFF",
                    }}
                  >
                    Journal
                  </Text>

                  {/* GIF */}
                  <View style={{ alignItems: "center" }}>
                    <Image
                      source={require("@/assets/gifs/pengif.gif")}
                      style={{ width: 180, height: 180, marginTop: 15 }}
                      resizeMode="contain"
                    />
                  </View>
                </View>

                {/* White Card Section */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 30,
                    marginTop: 0,
                    paddingTop: 30,
                    paddingHorizontal: 20,
                  }}
                >
                  {/* Instruction Text */}
                  <Text
                    style={{
                      marginTop: 15,
                      fontSize: 27,
                      fontWeight: "700",
                      color: "#2E2E2E",
                      textAlign: "center",
                    }}
                  >
                    This is your journal. Write about your day or use it to keep
                    track of your triggers and cravings!
                  </Text>

                  {/* Add New Entry Button */}
                  <TouchableOpacity
                    onPress={() => {
                      setJournalPage(2);
                      setEditingIndex(null);
                      setText("");
                    }}
                    style={{
                      marginTop: 15, // 15px under instruction text
                      width: "100%",
                      height: 120,
                      borderRadius: 20,
                      borderWidth: 10,
                      borderColor: "#F3F3F3",
                      backgroundColor: "#FFFFFF",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <FontAwesome6 name="plus" size={50} color="#F3F3F3" />
                  </TouchableOpacity>

                  {/* Past Entries */}
                  <ScrollView
                    style={{ marginTop: 15 }} // 15px under the plus rectangle
                    contentContainerStyle={{ paddingBottom: 40 }}
                  >
                    {entries.map((entry, index) => (
                      <View key={index} style={{ marginBottom: 30, alignItems: "center" }}>
                        {/* Date with Pen Icon */}
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Text
                            style={{
                              fontSize: 18,
                              fontWeight: "700",
                              color: "#2E2E2E",
                              textAlign: "center",
                            }}
                          >
                            {entry.date}
                          </Text>
                          <TouchableOpacity
                            onPress={() => handleEdit(index)}
                            style={{ marginLeft: 5 }}
                          >
                            <FontAwesome6 name="pen" size={14} color="#D3D3D3" />
                          </TouchableOpacity>
                        </View>

                        {/* Entry Text */}
                        <Text
                          style={{
                            marginTop: 10,
                            fontSize: 20,
                            fontWeight: "500",
                            color: "#2E2E2E",
                            textAlign: "center",
                          }}
                        >
                          {entry.text}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </>
            ) : (
              <>
                {/* Back Button */}
                <TouchableOpacity
                  onPress={() => setJournalPage(1)}
                  style={{
                    position: "absolute",
                    top: 60,
                    left: 20,
                    zIndex: 10,
                  }}
                >
                  <Entypo name="chevron-left" size={30} color="#2E2E2E" />
                </TouchableOpacity>

                {/* Finish Button */}
                <TouchableOpacity
                  onPress={handleJournalFinish}
                  style={{
                    position: "absolute",
                    top: 60,
                    right: 20,
                    zIndex: 10,
                  }}
                >
                  <Text style={{ fontSize: 18, color: "#07C0C4", fontWeight: "700" }}>
                    Finish
                  </Text>
                </TouchableOpacity>

                {/* Text Input Section */}
                <View
                  style={{
                    flex: 1,
                    marginTop: 120,
                    paddingHorizontal: 20,
                  }}
                >
                  <TextInput
                    value={text}
                    onChangeText={setText}
                    placeholder="Write your journal entry..."
                    multiline
                    style={{
                      width: "100%",
                      minHeight: 200,
                      borderRadius: 20,
                      backgroundColor: "#F3F3F3",
                      paddingHorizontal: 20,
                      paddingVertical: 15,
                      fontSize: 16,
                      textAlignVertical: "top",
                    }}
                  />
                </View>
              </>
            )}
          </View>
        </Modal>

        <Modal
          visible={goalModalVisible}
          animationType="slide"
          transparent={false}
        >
          <View style={{ flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 20 }}>
            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setGoalModalVisible(false)}
              style={{
                position: "absolute",
                top: 60,
                right: 20,
                zIndex: 10,
              }}
            >
              <Text style={{ fontSize: 18, color: "#228B22", fontWeight: "700" }}>
                Close
              </Text>
            </TouchableOpacity>

            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 60,
              }}
            >
              <Text
                style={{
                  color: "#2E2E2E",
                  fontSize: 30,
                  fontWeight: "700",
                }}
              >
                Set a Goal
              </Text>
            </View>

            {/* Centered Activity Indicator */}
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color="#228B22" />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}