// app/_layout.jsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Slot, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";

const POSITIVE_MESSAGES = [
  "You are stronger than you think",
  "Great things are coming your way",
  "Believe in yourself always",
  "Your energy inspires others",
  "You are capable of amazing things",
  "Happiness is within your reach",
  "Every step forward counts",
  "Your smile lights up the room",
  "You are full of potential",
  "Good things are happening for you",
  "Keep shining your light",
  "You are loved and appreciated",
  "Your kindness makes a difference",
  "The future is bright for you",
  "Your courage is inspiring",
  "Today is your day to shine",
  "You are worthy of success",
  "Your hard work is paying off",
  "You bring joy to others",
  "Every day is a fresh start",
  "You are unstoppable",
  "Your dreams are valid",
  "You are making progress",
  "Your voice matters",
  "You radiate positivity",
  "You are a gift to this world",
  "Good energy surrounds you",
  "Your ideas are valuable",
  "You inspire those around you",
  "Your future is full of promise",
  "You are capable of great love",
  "Your presence brings peace",
  "You are always growing",
  "Your journey is beautiful",
  "You bring hope to others",
  "You are worthy of happiness",
  "Your efforts are not unnoticed",
  "You are destined for greatness",
  "You are brave and resilient",
  "Your dreams are achievable",
  "You are an inspiration to many",
  "You spread light wherever you go",
  "Your determination is powerful",
  "You are full of creativity",
  "You are cherished deeply",
  "Your path is full of blessings",
  "You have the power to succeed",
  "You are enough just as you are",
  "Your life is filled with purpose",
  "You are making a positive impact",
  "Welcome to a brand new day full of opportunities",
  "You are glowing with positive energy",
  "Keep moving forward with courage",
  "Your presence brings light to others",
  "You are growing stronger every day",
  "Believe in your inner power",
  "Welcome peace into your heart today",
  "Every small step creates big change",
  "You are filled with unstoppable strength",
  "Joy is already on its way to you",
  "Your kindness changes the world",
  "You are worthy of love and success",
  "Trust the journey you are on",
  "You are a source of inspiration",
  "Keep shining brighter each day",
  "You are a beacon of hope",
  "Your path is filled with blessings",
  "You radiate happiness and calm",
  "Welcome strength into your life today",
  "You are more than capable of greatness",
  "Your courage guides you forward",
  "You make the world a better place",
  "You are becoming your best self",
  "Every moment brings new possibilities",
  "You are worthy of peace and joy",
  "Keep believing in your dreams",
  "You are capable of wonderful things",
  "Your heart is full of kindness",
  "You inspire with your resilience",
  "You are enough just as you are",
  "Great opportunities are waiting for you",
  "You are filled with creative energy",
  "Your future is bright and open",
  "You spread love everywhere you go",
  "Welcome happiness into your life now",
  "Your strength is limitless",
  "You have the power to overcome challenges",
  "You are growing wiser each day",
  "Your presence makes others smile",
  "You are moving closer to success",
  "You radiate positive energy",
  "Your dreams are within reach",
  "You bring joy to those around you",
  "You are loved more than you know",
  "Every day is a fresh chance",
  "You are filled with endless potential",
  "Welcome hope and gratitude today",
  "Your journey is worth celebrating",
  "You are creating a beautiful life",
  "You are unstoppable in your progress"
];

export default function RootLayout() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // --- Splash state & animation ---
  const [showSplash, setShowSplash] = useState(true);
  const splashAnim = useRef(new Animated.Value(0)).current;
  const [messageIndex, setMessageIndex] = useState(0);

  // Cycle messages
  useEffect(() => {
    const loadMessageIndex = async () => {
      try {
        const savedIndex = await AsyncStorage.getItem("splashMessageIndex");
        let nextIndex = savedIndex
          ? (parseInt(savedIndex, 10) + 1) % POSITIVE_MESSAGES.length
          : 0;

        setMessageIndex(nextIndex);
        await AsyncStorage.setItem("splashMessageIndex", String(nextIndex));
      } catch (err) {
        console.error("Error handling message index:", err);
      }
    };

    if (showSplash) loadMessageIndex();
  }, [showSplash]);

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        Animated.timing(splashAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start(() => setShowSplash(false));
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  // --- Auth/session logic ---
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.error("Error getting session:", error.message);

        if (data?.session) {
          console.log("Initial session found:", data.session.user?.id);
          setSession(data.session);
        } else {
          setSession(null);
        }
      } catch (err) {
        console.error("Unexpected error getting session:", err);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log("Auth state change:", _event);
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !showSplash) {
      if (session?.user) {
        router.replace("/(tabs)/checkin");
      } else {
        router.replace("/(auth)/SignIn");
      }
    }
  }, [loading, session, showSplash]);

  // --- Splash screen ---
  if (showSplash) {
    return (
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: "white",
            justifyContent: "center",
            alignItems: "center",
            transform: [
              {
                translateY: splashAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Dimensions.get("window").height],
                }),
              },
            ],
          },
        ]}
      >
        <Text
          style={{
            color: "#228B22",
            fontWeight: "700",
            fontSize: 40,
            textAlign: "center",
            paddingHorizontal: 20,
          }}
        >
          {POSITIVE_MESSAGES[messageIndex]}
        </Text>

        <ConfettiCannon
          count={80}
          origin={{
            x: Dimensions.get("window").width / 2,
            y: Dimensions.get("window").height / 2,
          }}
          autoStart={true}
          fadeOut={true}
          explosionSpeed={200}
          fallSpeed={1800}
        />
      </Animated.View>
    );
  }

  // --- Loading state (while checking session) ---
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <ActivityIndicator size="large" color="#228B22" />
        <Text style={{ marginTop: 12, fontSize: 16, color: "#228B22" }}>
          Loading...
        </Text>
      </View>
    );
  }

  // --- Normal app render ---
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <Slot />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
