import { supabase } from '@/lib/supabase';
import { Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import { SimpleLineIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// =============================================================
// CONSTANTS AND HELPERS
// =============================================================
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Utility: scale fonts depending on screen width
const scaleFont = (size) => {
  const baseWidth = 375; // iPhone 11 baseline
  return (SCREEN_WIDTH / baseWidth) * size;
};

// Adjust padding for Android status bar
const topPadding = Platform.OS === 'android' ? StatusBar.currentHeight + 15 || 30 : 15;

// =============================================================
// MAIN COMPONENT: Index
// =============================================================
export default function Index() {
  // -------------------------------------------------------------
  // FORMATTER FUNCTION
  // -------------------------------------------------------------
  const formatTimeElapsed = (time) => {
    const parts = [];

    if (time.years > 0) parts.push(`${time.years}y`);
    if (time.days > 0 && time.years === 0) parts.push(`${time.days}d`);
    if (time.hours > 0) parts.push(`${time.hours}h`);
    if (time.minutes > 0) parts.push(`${time.minutes}min`);
    if (time.secs >= 0) parts.push(`${time.secs}s`);

    return parts.join(' ');
  };

  // -------------------------------------------------------------
  // STATE VARIABLES
  // -------------------------------------------------------------
  const [moneySaved, setMoneySaved] = useState(0);
  const [totalAnnualSavings, setTotalAnnualSavings] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    secs: 0,
    totalSeconds: 0,
  });
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [streak, setStreak] = useState(0);
  const [vapeFreeStart, setVapeFreeStart] = useState(null);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalAccumulatedSeconds, setTotalAccumulatedSeconds] = useState(0);

  // Fonts
  const [fontsLoaded] = useFonts({ Inter_600SemiBold });

  // Animations & utilities
  const fillAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // =============================================================
  // EFFECT 1: FETCH USER
  // =============================================================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Failed to fetch user:', error);
        } else {
          setUser(data.user);
        }
      } catch (err) {
        console.error('Unexpected error fetching user:', err);
      }
      setLoadingUser(false);
    };

    fetchUser();
  }, []);

  // =============================================================
  // EFFECT 2: TRACK STREAK
  // =============================================================
  useEffect(() => {
    const checkStreak = async () => {
      const today = new Date();
      const todayStr = today.toDateString();

      try {
        const lastOpened = await AsyncStorage.getItem('lastOpenedDate');
        const storedStreak = parseInt((await AsyncStorage.getItem('streak')) || '0', 10);

        if (lastOpened) {
          const lastDate = new Date(lastOpened);
          const dayDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

          if (dayDiff === 1) {
            const newStreak = storedStreak + 1;
            await AsyncStorage.setItem('streak', newStreak.toString());
            setStreak(newStreak);
          } else if (dayDiff > 1) {
            await AsyncStorage.setItem('streak', '0');
            setStreak(0);
          } else {
            setStreak(storedStreak);
          }
        } else {
          await AsyncStorage.setItem('streak', '0');
          setStreak(0);
        }

        await AsyncStorage.setItem('lastOpenedDate', todayStr);
      } catch (err) {
        console.error('Error checking streak:', err);
      }
    };

    checkStreak();
  }, []);

  // =============================================================
  // EFFECT 3: INITIALIZE VAPE-FREE TIMER AND SAVINGS
  // =============================================================
  useEffect(() => {
    let interval;

    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
          console.error('Failed to get user:', error);
          return;
        }

        const user = data.user;
        let startTime;

        // First: check AsyncStorage
        const localQuitTime = await AsyncStorage.getItem('quitVapingTime');

        if (localQuitTime) {
          startTime = new Date(localQuitTime);
        } else if (user.user_metadata?.quitVapingTime) {
          // Use Supabase metadata, but store locally to avoid repeated calls
          startTime = new Date(user.user_metadata.quitVapingTime);
          await AsyncStorage.setItem('quitVapingTime', startTime.toISOString());
        } else {
          // Nothing anywhere → set ONCE (avoid hammering Supabase)
          startTime = new Date();

          try {
            await supabase.auth.updateUser({
              data: { quitVapingTime: startTime.toISOString() },
            });
          } catch (err) {
            console.error('Failed to update quitVapingTime:', err.message);
          }

          await AsyncStorage.setItem('quitVapingTime', startTime.toISOString());
        }

        setVapeFreeStart(startTime);

        // Fetch streaks data from Supabase
        const { data: streakRows } = await supabase
          .from('streaks')
          .select('seconds')
          .eq('user_id', user.id);

        if (streakRows && streakRows.length > 0) {
          const allSeconds = streakRows.map((r) => r.seconds || 0);
          setLongestStreak(Math.max(...allSeconds));
          setTotalAccumulatedSeconds(allSeconds.reduce((a, b) => a + b, 0));
        }

        // Interval: update every second
        interval = setInterval(async () => {
          const now = new Date();
          let seconds = Math.floor((now - startTime) / 1000);
          if (seconds < 0) seconds = 0;

          const elapsedDays = Math.floor(seconds / (3600 * 24));

          // Update state
          setTimeElapsed({
            days: elapsedDays,
            hours: Math.floor((seconds % (3600 * 24)) / 3600),
            minutes: Math.floor((seconds % 3600) / 60),
            secs: seconds % 60,
            totalSeconds: seconds,
          });

          try {
            await AsyncStorage.setItem('timeElapsedSeconds', seconds.toString());
          } catch (err) {
            console.error('Failed to save elapsed seconds:', err);
          }

          // Money saved
          if (seconds > 0) {
            const minutes = seconds / 60;
            const savedMoney = minutes * 0.08; // £0.08/minute
            setMoneySaved(parseFloat(savedMoney.toFixed(2)));

            // Annual savings projection
            const annualSavings = 525600 * 0.08; // minutes/year * rate
            setTotalAnnualSavings(parseFloat(annualSavings.toFixed(2)));
          } else {
            setMoneySaved(0.0);
            setTotalAnnualSavings(0.0);
          }
        }, 1000);
      } catch (err) {
        console.error('Init error:', err);
      }
    };

    init();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // =============================================================
  // CALCULATED VALUES
  // =============================================================
  const lifeRegainedHours = ((totalAccumulatedSeconds + timeElapsed.totalSeconds) / 3600).toFixed(2);

  // =============================================================
  // EARLY RETURNS
  // =============================================================
  if (loadingUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Unable to load user</Text>
      </View>
    );
  }

  if (!fontsLoaded || vapeFreeStart === null) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}
      >
        <Text style={{ color: 'white', fontSize: 18 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  // =============================================================
  // MAIN RENDER
  // =============================================================
  return (
    <LinearGradient
      colors={['#FFFFFF', '#01A362']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1, paddingTop: 0 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 85 }}
      >
        {/* HEADER */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: topPadding,
            marginBottom: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <Text style={{ color: '#2E2E2E', fontSize: 30, fontWeight: '700' }}>Check in</Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FFF4D6',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
            }}
          >
            <SimpleLineIcons
              name="trophy"
              size={scaleFont(12)}
              color="#FDC854"
              style={{ marginRight: 6 }}
            />
            <Text
              style={{ color: '#FDC854', fontSize: Math.min(scaleFont(16), 18), fontWeight: '800' }}
            >
              {streak}
            </Text>
          </View>
        </View>

        {/* PROGRESS HEADER */}
        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20, marginHorizontal: 20 }}>
          <Text style={{ fontSize: 40, fontWeight: '700', color: '#2E2E2E' }}>
            "Hey {user?.user_metadata?.full_name ?? ''} 👋, here’s your progress today.”
          </Text>
        </View>

        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Text style={{ fontSize: 40, fontWeight: '700', color: '#2E2E2E' }}>Your Progress 💪</Text>
          <Text style={{ fontSize: 30, fontWeight: '400', color: '#2E2E2E', marginTop: 15 }}>
            Make Every Day a Victory
          </Text>
        </View>

        {/* SECTION: TIME */}
        <Text style={{ marginTop: 20, marginLeft: 20, fontSize: 27, marginBottom: 25, fontWeight: '700', color: '#2E2E2E' }}>
          So far you've done 👏:
        </Text>

        <Text style={{ marginTop: 0, marginLeft: 20, fontSize: 27, marginBottom: 0, fontWeight: '700', color: '#2E2E2E' }}>
          You haven't vaped for 🤩:
        </Text>

        <View
          style={{
            backgroundColor: '#F1F6FA',
            marginTop: 25,
            marginHorizontal: 20,
            height: 75,
            marginBottom: 25,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 29, fontWeight: '700', color: '#2E2E2E' }}>
            {formatTimeElapsed(timeElapsed)}
          </Text>
        </View>

        {/* SECTION: MONEY SAVED */}
        <Text style={{ marginTop: 0, marginLeft: 20, fontSize: 27, marginBottom: 25, fontWeight: '700', color: '#2E2E2E' }}>
          You saved 🤑:
        </Text>

        <View
          style={{
            backgroundColor: '#F1F6FA',
            marginHorizontal: 20,
            height: 75,
            marginBottom: 25,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 29, fontWeight: '700', color: '#2E2E2E' }}>£{moneySaved}</Text>
        </View>

        {/* SECTION: ANNUAL SAVINGS */}
        <Text style={{ marginTop: 0, marginLeft: 20, fontSize: 27, marginBottom: 25, fontWeight: '700', color: '#2E2E2E' }}>
          For a total of 😱:
        </Text>

        <View
          style={{
            backgroundColor: '#F1F6FA',
            marginHorizontal: 20,
            height: 110,
            marginBottom: 25,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 29, fontWeight: '700', color: '#2E2E2E' }}>£{totalAnnualSavings}</Text>
          <Text style={{ fontSize: 29, color: '#2E2E2E', marginTop: 4, fontWeight: 700 }}>
            in annual savings
          </Text>
        </View>

        {/* SECTION: LIFE REGAINED */}
        <Text style={{ marginTop: 0, marginLeft: 20, fontSize: 27, marginBottom: 25, fontWeight: '700', color: '#2E2E2E' }}>
          Life Regained ❤️:
        </Text>

        <View
          style={{
            backgroundColor: '#F1F6FA',
            marginHorizontal: 20,
            height: 75,
            marginBottom: 25,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 29, fontWeight: '700', color: '#2E2E2E' }}>
            {lifeRegainedHours}H
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
