import { supabase } from '@/lib/supabase';
import { Entypo, Feather, FontAwesome6, Ionicons, Octicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from '@react-native-community/slider';
import { differenceInCalendarDays, isBefore, parseISO, startOfToday } from 'date-fns';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function userStartedDate(userMeta) {
  return parseISO(userMeta.created_at || new Date().toISOString());
}

function calculateDailyLimit(userMeta, puffsUsedToday, currentDate) {
  const { puffsperday, quitVapingTime } = userMeta;
  if (!puffsperday || !quitVapingTime) return 0;

  const totalDays = differenceInCalendarDays(parseISO(quitVapingTime), currentDate);
  if (totalDays <= 0) return 0;

  const totalPuffs = parseFloat(puffsperday);
  const decrementPerDay = totalPuffs / totalDays;

  const daysSinceStart = differenceInCalendarDays(currentDate, userStartedDate(userMeta));
  const rawLimit = totalPuffs - decrementPerDay * daysSinceStart;

  const preciseLimit = Math.max(rawLimit, 0);
  const roundedLimit = Math.floor(preciseLimit) - puffsUsedToday;

  return Math.max(roundedLimit, 0);
}

export async function saveCraving({ strength, emotion, emotionIcon, alternative, altIcon }) {
  if (!emotion || !emotionIcon || !alternative || !altIcon) {
    console.error("Missing data: cannot save craving");
    return;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Unable to get user:", userError?.message);
    return;
  }

  const { error } = await supabase
    .from("cravings")
    .insert([
      {
        user_id: user.id,
        strength,
        emotion,
        emotion_icon: emotionIcon,
        alternative,
        alt_icon: altIcon,
      },
    ]);

  if (error) {
    console.error("Error saving craving:", error.message);
  } else {
    console.log("Craving saved!");
  }
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MOTIVATION_TEXTS = [
  `Close your eyes and take a few minutes to reflect on all of the things in your life that you're grateful for.`,
  `Breathe deeply through the nose, count to 5, then expire slowly through the mouth. Repeat this for 5 minutes.`,
  `Brush your teeth and enjoy that fresh taste.`,
  `You have saved some money. It's time to indulge yourself and buy something that you wanted for a long time.`,
  `It's normal for this to be tough, but it is not impossible! Each time you resist a craving, you get closer to your goal. You get stronger.`,
  `Keep things simple. Curb cravings as they come, one by one and do something different for a few minutes.`,
  `Try to change your habits to resist the psychological cravings. For example, get up and go for a walk.`,
  `Close your eyes and take a mini mental vacation, on a real location or not, wherever you feel good.`,
  `The urge to vape is due to the lack of nicotine, it doesn't last more than 5 minutes. Stand firm and drink a big glass of water.`,
  `Take 5 minutes and mentally review your list of reasons to quit vaping. Remember how you felt when you decided to quit.`,
  `You have within you everything you need to quit vaping once and for all. Believe in yourself and be patient, you'll become the Ultimate quitter.`,
  `When a craving comes, call a friend and take a few minutes to connect with him. Your spirits will be lifted, and chances are you'll perk them up too.`,
  `When blood sugar levels drop, cravings can seem more powerful while you feel less able to manage them. Eat fruit (apple, grapes, kiwi) or a yogurt to feel better.`,
  `Grab some help and support from your friends and on your social networks. Your loved ones are with you.`,
  `Instead of tensing up for a fight when an urge to vape hits, relax and mentally lean into it. Let the craving pass over you while breathing deeply.`,
  `Cravings to vape decrease progressively in intensity and in frequency to disappear in a few weeks.`,
  `The most difficult thing is to resist the first few weeks, and mainly the first days. It will be easier as time passes.`,
  `Know that anger, frustration, anxiety and irritability are normal after quitting and will get better with time.`,
  `The first 3 days are those where cravings are the strongest. Sleep a lot during those days to let your body and your mind rest.`,
  `Have a break and keep your hands and your mind busy. You could work on a crossword puzzle, read a few pages of a novel or play your favorite game.`,
  `Cravings are not commands. The more you overcome them, the easier it will get and you'll feel proud of yourself!`,
];

const COLORS = [
  '#66C5CC',
  '#F6CF71',
  '#F89C74',
  '#DCB0F2',
  '#87C55F',
  '#9EB9F3',
  '#FE88B1',
];

const LIGHT_BLUE = '#66C5CC';
const GREY_TEXT = '#6F7985';

export default function Toolbox() {
  const [strategies, setStrategies] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newStrategy, setNewStrategy] = useState("");

  // Load saved strategies when app starts
  useEffect(() => {
    const loadStrategies = async () => {
      try {
        const saved = await AsyncStorage.getItem("strategies");
        if (saved) {
          setStrategies(JSON.parse(saved));
        } else {
          // default strategies if none saved yet
          setStrategies(["Call a friend", "Go for a run"]);
        }
      } catch (err) {
        console.error("Failed to load strategies:", err);
      }
    };

    loadStrategies();
  }, []);

  // Save strategies whenever they change
  useEffect(() => {
    const saveStrategies = async () => {
      try {
        await AsyncStorage.setItem("strategies", JSON.stringify(strategies));
      } catch (err) {
        console.error("Failed to save strategies:", err);
      }
    };

    if (strategies.length > 0) {
      saveStrategies();
    }
  }, [strategies]);


  const [modalVisibleFrank, setModalVisibleFrank] = useState(false);

  const resetVapeFreeTimer = async () => {
    try {
      const now = new Date();

      // update locally first
      await AsyncStorage.setItem("quitVapingTime", now.toISOString());

      // reset state immediately so UI updates instantly
      setVapeFreeStart(now);
      setTimeElapsed({ days: 0, hours: 0, minutes: 0, secs: 0, totalSeconds: 0 });

      // optional: debounce sync to Supabase, e.g., only once per session
      // setTimeout(() => {
      //   supabase.auth.updateUser({
      //     data: { quitVapingTime: now.toISOString() },
      //   }).catch(err => console.error("Failed to update quitVapingTime:", err.message));
      // }, 5000);
    } catch (err) {
      console.error("Error resetting vape-free timer:", err);
    }
  };


  const [currentPage, setCurrentPage] = useState('intro');

  const [user, setUser] = useState(null);
  const [puffsToday, setPuffsToday] = useState(0);

  const todayStr = new Date().toISOString().split('T')[0];

  const [dailyPuffAllowance, setDailyPuffAllowance] = useState(0);

  useEffect(() => {
    calculateDailyAllowance();
  }, []);

  const calculateDailyAllowance = async () => {
    const user = await supabase.auth.getUser();
    const metadata = user?.data?.user?.user_metadata;

    if (!metadata) return;

    const puffsPerDay = parseInt(metadata.puffsperday);
    const quitDateStr = metadata.quitVapingTime?.split('T')[0]; // "2025-08-11"
    const quitDate = new Date(quitDateStr);
    const today = startOfToday();

    if (isBefore(quitDate, today)) {
      setDailyPuffAllowance(0);
      return;
    }

    const createdAt = new Date(user.data.user.created_at.split('T')[0]);
    const daysBetweenCreationAndQuit = differenceInCalendarDays(quitDate, createdAt);

    // In case the account was created on or after the quit date
    if (daysBetweenCreationAndQuit <= 0) {
      setDailyPuffAllowance(0);
      return;
    }

    const daysSinceCreation = differenceInCalendarDays(today, createdAt);
    
    // If we're still before the quit date
    const decrementPerDay = puffsPerDay / daysBetweenCreationAndQuit;
    const todayAllowance = Math.round(puffsPerDay - decrementPerDay * daysSinceCreation);

    setDailyPuffAllowance(todayAllowance < 0 ? 0 : todayAllowance);
  };

  const addPuff = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      const newPuffCount = puffsToday + 1;

      const { error } = await supabase
        .from('puffs')
        .upsert(
          {
            user_id: userId,
            date: todayStr,
            puff_count: newPuffCount,
            updated_at: now,
          },
          { onConflict: ['user_id', 'date'] }
        );

      if (error) {
        console.error('Failed to update puff count:', error);
        return;
      }

      setPuffsToday(newPuffCount);
      setDailyPuffAllowance((prev) => Math.max(prev - 1, 0));

      resetVapeFreeTimer();
    } catch (err) {
      console.error('Error adding puff:', err);
    }
  };

  const removePuff = async () => {
    if (!userId || puffsToday <= 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    const newPuffCount = puffsToday - 1;

    try {
      const { error } = await supabase
        .from('puffs')
        .upsert(
          {
            user_id: userId,
            date: todayStr,
            puff_count: newPuffCount,
            updated_at: now,
          },
          { onConflict: ['user_id', 'date'] }
        );

      if (error) {
        console.error('Failed to update puff count:', error);
        return;
      }

      setPuffsToday(newPuffCount);
      setDailyPuffAllowance((prev) => prev + 1);

    } catch (err) {
      console.error('Error removing puff:', err);
    }
  };

  const [userId, setUserId] = useState(null);
  const [vapeFreeStart, setVapeFreeStart] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState({ days: 0, hours: 0, minutes: 0, secs: 0, totalSeconds: 0 });

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        console.error('Error fetching user:', error);
        return;
      }

      setUser(data.user);               // for user.user_metadata
      setUserId(data.user.id);          // for RLS insert
    };

    fetchUser();
  }, []);

  const [showVapeModal, setShowVapeModal] = useState(false);

  const [showCravingModal, setShowCravingModal] = useState(false);
  const [cravingScreen, setCravingScreen] = useState(1);
  const [cravingLevel, setCravingLevel] = useState(5);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [selectedAlternative, setSelectedAlternative] = useState(null);

  const [showCravingModal1, setShowCravingModal1] = useState(false);
  const [cravingScreen1, setCravingScreen1] = useState(1);

  const [memoryModalVisible, setMemoryModalVisible] = useState(false);

  // MemoryModal component defined inside Toolbox but outside return()
  const MemoryModal = ({ visible, onClose }) => {
    const [memory, setMemory] = useState('');
    const insets = useSafeAreaInsets();
    const maxChars = 250;
    const isValid = memory.length > 0 && memory.length <= maxChars;

    return (
      <Modal visible={visible} animationType="slide" transparent={false}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{
              flex: 1,
              backgroundColor: '#fff',
              paddingTop: insets.top,
            }}
          >
            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              style={{
                position: 'absolute',
                top: insets.top + 20,
                left: 20,
                zIndex: 1,
              }}
            >
              <Feather name="x" size={28} color="#2E2E2E" />
            </TouchableOpacity>

            {/* Input */}
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-start',
                paddingTop: insets.top + 80,
                paddingHorizontal: 20,
              }}
            >
              <TextInput
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#2E2E2E',
                  textAlignVertical: 'top',
                  height: '100%',
                }}
                autoFocus
                multiline
                placeholder="What was important today?"
                placeholderTextColor={GREY_TEXT}
                value={memory}
                onChangeText={setMemory}
                maxLength={maxChars + 50}
              />
            </View>

            {/* Done Button + Counter */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingBottom: insets.bottom + 20,
              }}
            >
              <Text style={{ color: GREY_TEXT, fontSize: 14 }}>
                {memory.length}/{maxChars}
              </Text>

              <TouchableOpacity
                disabled={!isValid}
                onPress={async () => {
                  const {
                    data: { user },
                    error: userError,
                  } = await supabase.auth.getUser();

                  if (userError || !user) {
                    console.error("Error getting user:", userError?.message);
                    return;
                  }

                  const { data, error } = await supabase.from("memory").insert([
                    {
                      user_id: user.id,
                      text: memory,
                      created_date: new Date().toLocaleDateString("en-GB"), // e.g. 24/07/2025
                    },
                  ]);

                  if (error) {
                    console.error("Error saving memory:", error.message);
                  } else {
                    console.log("Memory saved!", data);
                  }

                  onClose();
                  setMemory("");
                }}
                style={{
                  width: 75,
                  height: 38,
                  borderRadius: 50,
                  backgroundColor: isValid ? LIGHT_BLUE : "#d3d3d3",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>Done</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  const [breathingInstruction, setBreathingInstruction] = useState(''); // initially empty

  const [substituteScreen, setSubstituteScreen] = useState('main'); // add this to manage slide state

  const [modalVisibleSubstitute, setModalVisibleSubstitute] = useState(false);
  const slideAnimSubstitute = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const breathingAnim = useRef(new Animated.Value(20)).current;
  const breathingLoopRef = useRef(null);

  const router = useRouter();

  const [modalVisibleMotive, setModalVisibleMotive] = useState(false);
  const [modalVisibleBreathe, setModalVisibleBreathe] = useState(false);
  const [showBreathingSlide, setShowBreathingSlide] = useState(false);

  const slideAnimBreathe = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [motivationIndex, setMotivationIndex] = useState(0);
  const [bgColor, setBgColor] = useState('#66C5CC');

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const shadowStyle = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  };

  function openModalSubstitute() {
    setModalVisibleSubstitute(true);
    Animated.timing(slideAnimSubstitute, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }

  function closeModalSubstitute() {
    Animated.timing(slideAnimSubstitute, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisibleSubstitute(false);
    });
  }

  function openModalMotive() {
    const randomIndex = Math.floor(Math.random() * MOTIVATION_TEXTS.length);
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setMotivationIndex(randomIndex);
    setBgColor(randomColor);
    setModalVisibleMotive(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }

  function closeModalMotive() {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisibleMotive(false);
    });
  }

  const stopBreathingCycle = () => {
    if (breathingLoopRef.current) {
      clearTimeout(breathingLoopRef.current);
      breathingLoopRef.current = null;
    }
  };

  function openModalBreathe() {
    setModalVisibleBreathe(true);
    Animated.timing(slideAnimBreathe, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }

  const closeModalBreathe = () => {
    stopBreathingCycle(); 
    Animated.timing(slideAnimBreathe, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisibleBreathe(false);
      setShowBreathingSlide(false);
      setBreathingInstruction('');
      setCurrentPage('intro');   // 👈 reset so it opens on the intro page again
      breathingAnim.setValue(20);
    });
  };
  
  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: 'white',
        paddingTop: 10,
        paddingHorizontal: 20,
      }}
      contentContainerStyle={{
        paddingBottom: 120, // to make space at the bottom
      }}
    >
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Top Row: Title */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
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
          Your Toolbox
        </Text>
      </View>

      {/* Subtitle */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 10,
        }}
      >
        <Text
          style={{
            color: "#D3D3D3",
            fontSize: 20,
            fontWeight: "700",
          }}
        >
          Quick tools to help you cope and reflect.
        </Text>
      </View>

      {/* Grid Row 1 */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 30,
          width: '100%',
        }}
      >
        <TouchableOpacity 
          onPress={() => setShowCravingModal1(true)}
          style={{
            borderRadius: 20,
            height: 100,
            flex: 1,
            marginRight: 10,
            backgroundColor: '#FFD700',
            ...shadowStyle,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: '#fff',
              fontSize: 18,
              fontWeight: '800',
            }}
          >
            Log Victory
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setShowCravingModal(true)}
          style={{
            borderRadius: 20,
            height: 100,
            flex: 1,
            marginLeft: 10,
            backgroundColor: '#F05050',
            ...shadowStyle,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 18,
              fontWeight: '800',
            }}
          >
            Log Craving
          </Text>
        </TouchableOpacity>
      </View>

      {/* Grid Row 2 */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 20,
          width: '100%',
        }}
      >
        <Pressable
          onPress={openModalBreathe}
          style={{
            borderRadius: 20,
            height: 100,
            flex: 1,
            marginRight: 10,
            backgroundColor: '#06B4FF',
            ...shadowStyle,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 18,
              fontWeight: '800',
            }}
          >
            Breathing Exercise
          </Text>
        </Pressable>

        <TouchableOpacity 
          onPress={() => setShowVapeModal(true)}
          style={{
            borderRadius: 20,
            height: 100,
            flex: 1,
            marginLeft: 10,
            backgroundColor: '#00D68B',
            ...shadowStyle,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 18,
              fontWeight: '800',
            }}
          >
            I vape
          </Text>
        </TouchableOpacity>
      </View>

      {/* Rectangle Row */}
      <Pressable
        onPress={() => setModalVisibleFrank(true)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 20,
          paddingHorizontal: 20,
          backgroundColor: "#F1F6FA",
          borderRadius: 12,
          marginHorizontal: 20,
          marginTop: 30,
        }}
      >
        {/* Left Text */}
        <Text
          style={{
            color: "#2E2E2E",
            fontSize: 30,
            fontWeight: "700",
          }}
        >
          Talk to Frank
        </Text>

        {/* Right Arrow */}
        <FontAwesome6
          name="chevron-right"
          size={30}
          color="#2E2E2E"
          style={{ marginRight: 0 }}
        />
      </Pressable>

      <View style={{ alignItems: "center", paddingTop: 20 }}>
        <Text
          style={{
            color: "#2E2E2E",
            fontSize: 30,
            fontWeight: "700",
          }}
        >
          Your Strategies
        </Text>
      </View>

      <View style={{ justifyContent: "center", alignItems: "center", paddingTop: 10 }}>
        <Text
          style={{
            color: "#D3D3D3",
            fontSize: 20,
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          Strategies appear in victory logs and craving logs
        </Text>
      </View>

      {strategies.map((strategy, index) => (
        <View
          key={index}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 15,
            marginHorizontal: 0,
          }}
        >
          <TouchableOpacity
            onPress={() =>
              setStrategies(strategies.filter((_, i) => i !== index))
            }
            style={{
              width: 40,
              height: 40,
              borderRadius: 40 / 2,
              backgroundColor: "#F05050",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 10,
            }}
          >
            <Entypo name="minus" size={25} color="white" />
          </TouchableOpacity>
          <Text
            style={{
              color: "#2E2E2E",
              fontSize: 25,
              fontWeight: "600",
            }}
          >
            {strategy}
          </Text>
        </View>
      ))}

      {/* Add a strategy button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          marginTop: 20,
          height: 50,
          borderRadius: 20,
          backgroundColor: "#00D68B",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 10,
        }}
      >
        <Text
          style={{
            marginRight: 10,
            color: "white",
            fontSize: 25,
            fontWeight: "700",
          }}
        >
          Add a strategy
        </Text>
        <FontAwesome6 name="plus" size={25} color="white" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modalVisibleMotive}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeModalMotive}
      >
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        <TouchableWithoutFeedback onPress={closeModalMotive}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'white',
            paddingTop: 60,
            paddingHorizontal: 30,
            transform: [{ translateY: slideAnim }],
            justifyContent: 'flex-start',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10,
          }}
        >
          <Text
            style={{
              fontWeight: '700',
              fontSize: 28,
              textAlign: 'center',
              marginBottom: 30,
            }}
          >
            Motivation
          </Text>

          <View
            style={{
              flex: 1,
              borderRadius: 12,
              padding: 20,
              backgroundColor: bgColor,
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontWeight: '600',
                fontSize: 20,
                color: 'white',
                lineHeight: 30,
                textAlign: 'center',
              }}
            >
              {MOTIVATION_TEXTS[motivationIndex]}
            </Text>
          </View>

          <Pressable
            style={{
              marginTop: 70,
              alignSelf: 'center',
              paddingHorizontal: 40,
              paddingVertical: 14,
              bottom: 45,
            }}
            onPress={closeModalMotive}
          >
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#6F7985' }}>
              Close
            </Text>
          </Pressable>
        </Animated.View>
      </Modal>

      <Modal  
        visible={modalVisibleBreathe}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeModalBreathe}
      >
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: currentPage === 'intro' ? '#06B4FF' : 'white',
            paddingTop: 50,
            paddingHorizontal: 15,
            transform: [{ translateY: slideAnimBreathe }],
            justifyContent: 'flex-start',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10,
          }}
        >
          {/* Top-left Close/Back button */}
          <Pressable
            onPress={() => {
              if (currentPage === 'breathing') {
                stopBreathingCycle();
                setCurrentPage('intro');
                setBreathingInstruction('');
                breathingAnim.setValue(20);
              } else if (currentPage === 'benefits') {
                setCurrentPage('intro');
              } else {
                closeModalBreathe();
              }
            }}
            style={{
              position: 'absolute',
              marginTop: 65,
              marginLeft: 15,
              zIndex: 10,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#6F7985' }}>
              {currentPage === 'intro' ? 'Close' : 'Back'}
            </Text>
          </Pressable>

          {/* Page 1: Intro */}
          {currentPage === 'intro' && (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              {/* Rabbit gif */}
              <Image
                source={require('@/assets/gifs/rabbitgif.gif')}
                style={{ width: 200, height: 200, resizeMode: 'contain', marginBottom: 50 }}
              />

              {/* Start Button */}
              <TouchableOpacity
                onPress={() => {
                  setCurrentPage('breathing');
                  const startCycle = () => {
                    setBreathingInstruction('Breathe in quietly through the nose');
                    Animated.timing(breathingAnim, {
                      toValue: 250,
                      duration: 4000,
                      useNativeDriver: false,
                      easing: Easing.inOut(Easing.ease),
                    }).start(() => {
                      setBreathingInstruction('Hold your breath');
                      breathingLoopRef.current = setTimeout(() => {
                        setBreathingInstruction('Exhale forcefully through the mouth.');
                        Animated.timing(breathingAnim, {
                          toValue: 20,
                          duration: 8000,
                          useNativeDriver: false,
                          easing: Easing.inOut(Easing.ease),
                        }).start(() => {
                          breathingLoopRef.current = setTimeout(startCycle, 1000);
                        });
                      }, 7000);
                    });
                  };
                  startCycle();
                }}
                style={{
                  height: 50,
                  backgroundColor: 'white',
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 200,
                  marginBottom: 20,
                }}
              >
                <Text style={{ color: '#06B4FF', fontSize: 18, fontWeight: '700' }}>Start</Text>
              </TouchableOpacity>

              {/* Benefits Button */}
              <TouchableOpacity
                onPress={() => setCurrentPage('benefits')}
                style={{
                  height: 50,
                  backgroundColor: 'white',
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 200,
                }}
              >
                <Text style={{ color: '#06B4FF', fontSize: 18, fontWeight: '700' }}>Benefits</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Page 2: Benefits */}
          {currentPage === 'benefits' && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text
                style={{
                  fontSize: 36,
                  color: '#9AD76D',
                  fontWeight: '700',
                  marginBottom: 20,
                  marginTop: 50,
                }}
              >
                I breathe
              </Text>

              {/* Illustration */}
              <View style={{ alignItems: 'center', marginBottom: 0 }}>
                <Image
                  source={require('@/assets/illustrations/calmbreathingpic.png')}
                  style={{ width: 250, height: 250, resizeMode: 'contain' }}
                />
              </View>

              {/* Benefits Section */}
              <Text style={{ fontWeight: '800', fontSize: 19, color: '#2E2E2E' }}>
                Benefits
              </Text>
              <Text style={{ fontSize: 19, fontWeight: '400', color: '#2E2E2E', marginTop: 20 }}>
                This exercise helps you reduce your anxiety, improve your sleep, manage your cravings and control or reduce anger.
              </Text>

              {/* Technique */}
              <Text style={{ fontWeight: '800', fontSize: 18, color: '#2E2E2E', marginTop: 30 }}>
                Breathing technique
              </Text>

              {/* Steps */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginLeft: 5 }}>
                <View style={{ width: 25, height: 25, borderRadius: 19, backgroundColor: '#99DDF1' }} />
                <Text style={{ fontSize: 19, marginLeft: 15 }}>
                  Breathe in quietly through the nose during 4 seconds.
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 25, marginLeft: 5 }}>
                <View style={{ width: 25, height: 6, backgroundColor: '#99DDF1', borderRadius: 3 }} />
                <Text style={{ fontSize: 19, marginLeft: 15 }}>
                  For 7 seconds hold your breath.
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 25, marginLeft: 5 }}>
                <View style={{ width: 25, height: 25, borderRadius: 19, borderWidth: 3, borderColor: '#99DDF1' }} />
                <Text style={{ fontSize: 19, marginLeft: 15 }}>
                  During 8 seconds, exhale forcefully through the nose.
                </Text>
              </View>
            </ScrollView>
          )}

          {/* Page 3: Breathing Animation */}
          {currentPage === 'breathing' && (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {/* Outer Circle - Fixed Size */}
              <View
                style={{
                  position: 'absolute',
                  width: 253,
                  height: 253,
                  borderRadius: 125,
                  backgroundColor: '#99DDF1',
                  top: '50%',
                  borderWidth: 3,
                  borderColor: '#DEDEDE',
                  marginTop: -145,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {/* Animated Inner Circle */}
                <Animated.View
                  style={{
                    width: breathingAnim,
                    height: breathingAnim,
                    borderRadius: Animated.divide(breathingAnim, 2),
                    backgroundColor: 'white',
                  }}
                />
              </View>

              {/* Instruction Text */}
              <Text
                style={{
                  color: '#2E2E2E',
                  fontSize: 27,
                  fontWeight: 800,
                  marginTop: 400,
                  textAlign: 'center',
                  paddingHorizontal: 20,
                }}
              >
                {breathingInstruction}
              </Text>
            </View>
          )}
        </Animated.View>
      </Modal>

      <Modal
        visible={modalVisibleSubstitute}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeModalSubstitute}
      >
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'white',
            paddingTop: 50,
            paddingHorizontal: 15,
            transform: [{ translateY: slideAnimSubstitute }],
            justifyContent: 'flex-start',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10,
          }}
        >
          {substituteScreen === 'main' ? (
            <>
              {/* Close Button */}
              <Pressable
                onPress={closeModalSubstitute}
                style={{
                  position: 'absolute',
                  marginTop: 65,
                  marginLeft: 15,
                  zIndex: 10,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#6F7985' }}>Close</Text>
              </Pressable>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Heading */}
                <Text
                  style={{
                    fontSize: 36,
                    fontWeight: '800',
                    marginTop: 65,
                    color: '#2E2E2E',
                  }}
                >
                  I configure my substitutes
                </Text>

                {/* Subtitle */}
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '400',
                    marginTop: 30,
                    color: '#2E2E2E',
                  }}
                >
                  Select a substitute and learn of some information about it.
                </Text>

                {/* Top Row */}
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 20,
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Gums */}
                  <Pressable
                    onPress={() => setSubstituteScreen('gums')}
                    style={{
                      flex: 1,
                      height: 135,
                      backgroundColor: 'white',
                      borderRadius: 8,
                      marginRight: 10,
                      padding: 15,
                      justifyContent: 'space-between',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 3,
                      elevation: 2,
                    }}
                  >
                    <Octicons name="smiley" size={48} color="#FFA2C1" />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: '#FFA2C1',
                        alignSelf: 'flex-start',
                      }}
                    >
                      Gums
                    </Text>
                  </Pressable>

                  {/* Lozenges */}
                  <Pressable
                    onPress={() => setSubstituteScreen('lozenges')}
                    style={{
                      flex: 1,
                      height: 135,
                      backgroundColor: 'white',
                      borderRadius: 8,
                      marginLeft: 10,
                      padding: 15,
                      justifyContent: 'space-between',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 3,
                      elevation: 2,
                    }}
                  >
                    <Octicons name="dot-fill" size={48} color="#FCD34D" />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: '#FCD34D',
                        alignSelf: 'flex-start',
                      }}
                    >
                      Lozenges
                    </Text>
                  </Pressable>
                </View>

                {/* Bottom Row */}
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 20,
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Patches */}
                  <Pressable
                    onPress={() => setSubstituteScreen('patches')}
                    style={{
                      flex: 1,
                      height: 135,
                      backgroundColor: 'white',
                      borderRadius: 8,
                      marginRight: 10,
                      padding: 15,
                      justifyContent: 'space-between',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 3,
                      elevation: 2,
                    }}
                  >
                    <Octicons name="shield" size={48} color="#A0CED9" />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: '#A0CED9',
                        alignSelf: 'flex-start',
                      }}
                    >
                      Patches
                    </Text>
                  </Pressable>

                  {/* E-cigarettes */}
                  <View
                    style={{
                      flex: 1,
                      height: 135,
                      backgroundColor: 'white',
                      borderRadius: 8,
                      marginLeft: 10,
                      padding: 15,
                      justifyContent: 'space-between',
                    }}
                  >
                  </View>
                </View>
              </ScrollView>
            </>
          ) : substituteScreen === 'gums' ? (
            <>
              {/* Gums Screen */}
              <Pressable
                onPress={() => setSubstituteScreen('main')}
                style={{
                  position: 'absolute',
                  marginTop: 65,
                  marginLeft: 15,
                  zIndex: 10,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#6F7985' }}>Back</Text>
              </Pressable>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text
                  style={{
                    fontSize: 36,
                    fontWeight: '800',
                    marginTop: 85,
                    color: '#FFA2C1',
                    textAlign: 'center',
                  }}
                >
                  Why use a gum?
                </Text>

                <Text style={{ fontSize: 18, fontWeight: '400', marginTop: 30, color: '#2E2E2E' }}>
                  Nicotine gums help to relieve cravings in difficult situations by replacing the nicotine intake of vapes.
                </Text>

                <Text style={{ fontSize: 18, fontWeight: '400', marginTop: 20, color: '#2E2E2E' }}>
                  The gum also helps to relieve your sensory needs in your mouth. It diffuses nicotine in 3 minutes, reducing the feeling of craving after 5 minutes.
                </Text>

                <Text
                  style={{
                    fontSize: 36,
                    fontWeight: '800',
                    marginTop: 30,
                    color: '#FFA2C1',
                    textAlign: 'center',
                  }}
                >
                  Stages of withdrawal
                </Text>

                {/* Stages of withdrawal */}
                <Text style={{ fontSize: 18, fontWeight: '800', marginTop: 30, color: '#2E2E2E' }}>
                  Have the right dose of nicotine
                </Text>
                <Text style={{ fontSize: 18, fontWeight: '400', marginTop: 5, color: '#2E2E2E' }}>
                  Not too much, not too little, to reduce your withdrawal symptoms and your addiction.
                </Text>

                <Text style={{ fontSize: 18, fontWeight: '800', marginTop: 30, color: '#2E2E2E' }}>
                  Take the necessary time
                </Text>
                <Text style={{ fontSize: 18, fontWeight: '400', marginTop: 5, color: '#2E2E2E' }}>
                  It is important to create new habits and to stabilise your nicotine consumption over several months.
                </Text>

                <Text style={{ fontSize: 18, fontWeight: '800', marginTop: 30, color: '#2E2E2E' }}>
                  Don't stop using substitutes too quickly
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '400',
                    marginTop: 5,
                    marginBottom: 50,
                    color: '#2E2E2E',
                  }}
                >
                  The reduction is done gradually, step by step, when the support of substitutes is no longer essential.
                </Text>

                {/* Shared withdrawal steps */}
                {/* ... (same as other screens) */}
              </ScrollView>
            </>
          ) : substituteScreen === 'lozenges' ? (
            <>
              {/* Lozenges Screen */}
              <Pressable
                onPress={() => setSubstituteScreen('main')}
                style={{
                  position: 'absolute',
                  marginTop: 65,
                  marginLeft: 15,
                  zIndex: 10,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#6F7985' }}>Back</Text>
              </Pressable>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text
                  style={{
                    fontSize: 36,
                    fontWeight: '800',
                    marginTop: 85,
                    color: '#FCD34D',
                    textAlign: 'center',
                  }}
                >
                  Why use a lozenge?
                </Text>

                <Text style={{ fontSize: 18, fontWeight: '400', marginTop: 30, color: '#2E2E2E' }}>
                  Nicotine lozenges help relieve cravings under challenging situations by replacing the nicotine provided by vapes.
                </Text>

                <Text style={{ fontSize: 18, fontWeight: '400', marginTop: 20, color: '#2E2E2E' }}>
                  The lozenge will dissolve in around 30 minutes, providing you with a gradual dose of nicotine to help you overcome your cravings.
                </Text>

                <Text
                  style={{
                    fontSize: 36,
                    fontWeight: '800',
                    marginTop: 30,
                    color: '#FCD34D',
                    textAlign: 'center',
                  }}
                >
                  Stages of withdrawal
                </Text>

                {/* Stages of withdrawal */}
                <Text style={{ fontSize: 18, fontWeight: '800', marginTop: 30, color: '#2E2E2E' }}>
                  Have the right dose of nicotine
                </Text>
                <Text style={{ fontSize: 18, fontWeight: '400', marginTop: 5, color: '#2E2E2E' }}>
                  Not too much, not too little, to reduce your withdrawal symptoms and your addiction.
                </Text>

                <Text style={{ fontSize: 18, fontWeight: '800', marginTop: 30, color: '#2E2E2E' }}>
                  Take the necessary time
                </Text>
                <Text style={{ fontSize: 18, fontWeight: '400', marginTop: 5, color: '#2E2E2E' }}>
                  It is important to create new habits and to stabilise your nicotine consumption over several months.
                </Text>

                <Text style={{ fontSize: 18, fontWeight: '800', marginTop: 30, color: '#2E2E2E' }}>
                  Don't stop using substitutes too quickly
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '400',
                    marginTop: 5,
                    marginBottom: 50,
                    color: '#2E2E2E',
                  }}
                >
                  The reduction is done gradually, step by step, when the support of substitutes is no longer essential.
                </Text>

                {/* Shared withdrawal steps */}
                {/* ... */}
              </ScrollView>
            </>
          ) : substituteScreen === 'patches' ? (
            <>
              {/* Patches Screen */}
              <Pressable
                onPress={() => setSubstituteScreen('main')}
                style={{
                  position: 'absolute',
                  marginTop: 65,
                  marginLeft: 15,
                  zIndex: 10,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#6F7985' }}>Back</Text>
              </Pressable>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text
                  style={{
                    fontSize: 36,
                    fontWeight: '800',
                    marginTop: 85,
                    color: '#A0CED9',
                    textAlign: 'center',
                  }}
                >
                  Why use a patch?
                </Text>

                <Text style={{ fontSize: 18, fontWeight: '400', marginTop: 30, color: '#2E2E2E' }}>
                  Nicotine patches are very helpful in reducing withdrawal symptoms and cravings.
                </Text>

                <Text style={{ fontSize: 18, fontWeight: '400', marginTop: 20, color: '#2E2E2E' }}>
                  They provide a stable concentration of nicotine needed by your body. This will protect you from cravings by nourishing your brain's nicotine receptors.
                </Text>

                <Text style={{ fontSize: 18, fontWeight: '400', marginTop: 20, color: '#2E2E2E' }}>
                  The nicotine contained in a patch is gradually administered through the skin and then diffuses into the bloodstream to the brain.
                </Text>

                <Text
                  style={{
                    fontSize: 36,
                    fontWeight: '800',
                    marginTop: 30,
                    color: '#A0CED9',
                    textAlign: 'center',
                  }}
                >
                  Stages of withdrawal
                </Text>

                {/* Stages of withdrawal */}
                <Text style={{ fontSize: 18, fontWeight: '800', marginTop: 30, color: '#2E2E2E' }}>
                  Have the right dose of nicotine
                </Text>
                <Text style={{ fontSize: 18, fontWeight: '400', marginTop: 5, color: '#2E2E2E' }}>
                  Not too much, not too little, to reduce your withdrawal symptoms and your addiction.
                </Text>

                <Text style={{ fontSize: 18, fontWeight: '800', marginTop: 30, color: '#2E2E2E' }}>
                  Take the necessary time
                </Text>
                <Text style={{ fontSize: 18, fontWeight: '400', marginTop: 5, color: '#2E2E2E' }}>
                  It is important to create new habits and to stabilise your nicotine consumption over several months.
                </Text>

                <Text style={{ fontSize: 18, fontWeight: '800', marginTop: 30, color: '#2E2E2E' }}>
                  Don't stop using substitutes too quickly
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '400',
                    marginTop: 5,
                    marginBottom: 50,
                    color: '#2E2E2E',
                  }}
                >
                  The reduction is done gradually, step by step, when the support of substitutes is no longer essential.
                </Text>
              </ScrollView>
            </>
          ) : null}
        </Animated.View>
      </Modal>
      <Modal
        visible={showCravingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCravingModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 60 }}>
          {cravingScreen === 1 ? (
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
              {/* Close Button */}
              <Pressable
                onPress={() => setShowCravingModal(false)}
                style={{
                  position: 'absolute',
                  marginTop: 24,
                  marginLeft: 24,
                  zIndex: 10,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#6F7985' }}>Close</Text>
              </Pressable>

              {/* Title */}
              <Text style={{ fontSize: 40, fontFamily: 'Inter_600SemiBold', color: '#00D68B', marginTop: 35, marginBottom: 30 }}>
                I feel like vaping
              </Text>

              {/* Slider Label */}
              <Text style={{ fontSize: 18, color: '#2E2E2E' }}>How strong is your craving?</Text>

              {/* Slider */}
              <View style={{ paddingHorizontal: 16 }}>
                <View style={{ marginTop: 80, alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, color: '#2E2E2E', marginBottom: 12 }}>{cravingLevel}</Text>
                  <Slider
                    style={{ width: '100%', height: 40 }}
                    minimumValue={0}
                    maximumValue={10}
                    step={1}
                    value={cravingLevel}
                    onValueChange={setCravingLevel}
                    minimumTrackTintColor="#00D68B"
                    maximumTrackTintColor="#ccc"
                    thumbTintColor="#00D68B"
                  />
                </View>
              </View>

              {/* Emotions Title */}
              <Text style={{ fontSize: 18, color: '#555', marginTop: 35 }}>How do you feel?</Text>

              {/* Emotion Grid */}
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  marginTop: 20,
                }}
              >
                {[
                  { label: 'Stressed', icon: 'alert-circle' },
                  { label: 'Lonely', icon: 'person' },
                  { label: 'Happy', icon: 'happy' },
                  { label: 'Bored', icon: 'time' },
                  { label: 'Excited', icon: 'rocket' },
                  { label: 'Down', icon: 'cloudy-night' },
                  { label: 'Angry', icon: 'flame' },
                  { label: 'Anxious', icon: 'pulse' },
                ].map((item, index) => {
                  const isSelected = selectedEmotion?.label === item.label;
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedEmotion(item)}
                      style={{
                        width: '22%',
                        aspectRatio: 0.55,
                        borderWidth: isSelected ? 3 : 1,
                        borderColor: isSelected ? '#00D68B' : '#ccc',
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                      }}
                    >
                      <Ionicons name={item.icon} size={28} color="#00D68B" style={{ marginBottom: 8 }} />
                      <Text style={{ fontSize: 14, color: '#2E2E2E', fontWeight: '800', textAlign: 'center' }}>{item.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Next Button */}
              <TouchableOpacity
                onPress={() => setCravingScreen(2)}
                disabled={!selectedEmotion}
                style={{
                  backgroundColor: selectedEmotion ? '#00D68B' : '#ccc',
                  paddingVertical: 20,
                  borderRadius: 12,
                  alignItems: 'center',
                  marginTop: -35,
                }}
              >
                <Text style={{ color: 'white', fontSize: 20, fontFamily: 'Inter_600SemiBold' }}>Next</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
              {/* Close Button */}
              <Pressable
                onPress={() => setCravingScreen(1)}
                style={{
                  position: 'absolute',
                  marginTop: 24,
                  marginLeft: 24,
                  zIndex: 10,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#6F7985' }}>Close</Text>
              </Pressable>

              {/* Alternative Screen Title */}
              <Text style={{ fontSize: 40, fontFamily: 'Inter_600SemiBold', color: '#00D68B', marginTop: 30 }}>
                I choose an alternative
              </Text>
              <Text style={{ fontSize: 18, color: '#2E2E2E', marginTop: 30, marginBottom: 30 }}>
                What coping strategy do you want to adopt to deal with your craving?
              </Text>

              {/* Alternatives Grid */}
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  marginTop: 10,
                }}
              >
                {[
                  {
                    label: 'I let the craving go',
                    icon: 'shield-outline',
                    backgroundColor: '#cce4ff',
                  },
                  {
                    label: 'I exercise for 15–30 mins',
                    icon: 'barbell-outline',
                    backgroundColor: '#ffe5b4',
                  },
                  {
                    label: 'I meditate or relax',
                    icon: 'heart-outline',
                    backgroundColor: '#d9f7be',
                  },
                  {
                    label: 'I stay hydrated',
                    icon: 'water-outline',
                    backgroundColor: '#d0f0f6',
                  },
                  {
                    label: 'I replace oral fixations',
                    icon: 'restaurant-outline',
                    backgroundColor: '#fff4b3',
                  },
                  {
                    label: 'I smoke with awareness',
                    icon: 'eye-outline',
                    backgroundColor: '#f0e4ff',
                  },
                ].map((item, index) => {
                  const isSelected = selectedAlternative?.label === item.label;
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedAlternative(item)}
                      style={{
                        width: '48%',
                        aspectRatio: 1.2,
                        backgroundColor: item.backgroundColor,
                        borderRadius: 16,
                        marginBottom: 16,
                        padding: 16,
                        borderWidth: isSelected ? 3 : 0,
                        borderColor: isSelected ? '#00D68B' : 'transparent',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Ionicons name={item.icon} size={26} color="black" />
                      <Text style={{ fontSize: 25, fontWeight: '500', color: '#333' }}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Finish Button */}
              <TouchableOpacity
                onPress={async () => {
                  if (!selectedEmotion?.label || !selectedAlternative?.label) {
                    alert("Please select both an emotion and an alternative.");
                    return;
                  }

                  try {
                    await saveCraving({
                      strength: cravingLevel,
                      emotion: selectedEmotion.label,
                      emotionIcon: selectedEmotion.icon,
                      alternative: selectedAlternative.label,
                      altIcon: selectedAlternative.icon,
                    });

                    // Reset state after successful save
                    setSelectedEmotion(null);
                    setSelectedAlternative(null);
                    setCravingLevel(5);
                    setShowCravingModal(false);
                    setCravingScreen(1);
                  } catch (error) {
                    console.error('Error saving craving:', error);
                    alert("Something went wrong saving your craving. Please try again.");
                  }
                }}
                disabled={!selectedEmotion?.label || !selectedAlternative?.label}
                style={{
                  backgroundColor: selectedEmotion?.label && selectedAlternative?.label ? '#00D68B' : '#ccc',
                  paddingVertical: 20,
                  borderRadius: 12,
                  alignItems: 'center',
                  marginTop: 60,
                }}
              >
                <Text style={{ color: 'white', fontSize: 20, fontFamily: 'Inter_600SemiBold' }}>
                  Finish
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>

      <Modal
        visible={showCravingModal1}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCravingModal1(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 60 }}>
          {cravingScreen1 === 1 ? (
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
              {/* Close Button */}
              <Pressable
                onPress={() => setShowCravingModal1(false)}
                style={{
                  position: 'absolute',
                  marginTop: 24,
                  marginLeft: 24,
                  zIndex: 10,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#6F7985' }}>Close</Text>
              </Pressable>

              {/* Title */}
              <Text style={{ fontSize: 40, fontFamily: 'Inter_600SemiBold', color: '#A9C1F9', marginTop: 35, marginBottom: 30 }}>
                I overcame a craving
              </Text>

              {/* Slider Label */}
              <Text style={{ fontSize: 18, color: '#2E2E2E' }}>How strong was your craving?</Text>

              {/* Slider */}
              <View style={{ paddingHorizontal: 16 }}>
                <View style={{ marginTop: 80, alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, color: '#2E2E2E', marginBottom: 12 }}>{cravingLevel}</Text>
                  <Slider
                    style={{ width: '100%', height: 40 }}
                    minimumValue={0}
                    maximumValue={10}
                    step={1}
                    value={cravingLevel}
                    onValueChange={setCravingLevel}
                    minimumTrackTintColor="#A9C1F9"
                    maximumTrackTintColor="#ccc"
                    thumbTintColor="#A9C1F9"
                  />
                </View>
              </View>

              {/* Emotions Title */}
              <Text style={{ fontSize: 18, color: '#555', marginTop: 35 }}>How did you feel?</Text>

              {/* Emotion Grid */}
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  marginTop: 20,
                }}
              >
                {[
                  { label: 'Stressed', icon: 'alert-circle' },
                  { label: 'Lonely', icon: 'person' },
                  { label: 'Happy', icon: 'happy' },
                  { label: 'Bored', icon: 'time' },
                  { label: 'Excited', icon: 'rocket' },
                  { label: 'Down', icon: 'cloudy-night' },
                  { label: 'Angry', icon: 'flame' },
                  { label: 'Anxious', icon: 'pulse' },
                ].map((item, index) => {
                  const isSelected = selectedEmotion?.label === item.label;
                  return (
                    <TouchableOpacity
                      key={item.label}
                      onPress={() => setSelectedEmotion(item)}
                      style={{
                        width: '22%',
                        aspectRatio: 0.55,
                        borderWidth: isSelected ? 3 : 1,
                        borderColor: isSelected ? '#A9C1F9' : '#ccc',
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                      }}
                    >
                      <Ionicons name={item.icon} size={28} color="#A9C1F9" style={{ marginBottom: 8 }} />
                      <Text style={{ fontSize: 14, color: '#2E2E2E', fontWeight: '800', textAlign: 'center' }}>{item.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Next Button */}
              <TouchableOpacity
                onPress={() => setCravingScreen1(2)}
                disabled={!selectedEmotion}
                style={{
                  backgroundColor: selectedEmotion ? '#A9C1F9' : '#ccc',
                  paddingVertical: 20,
                  borderRadius: 12,
                  alignItems: 'center',
                  marginTop: -10,
                }}
              >
                <Text style={{ color: 'white', fontSize: 20, fontFamily: 'Inter_600SemiBold' }}>Next</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
              {/* Close Button */}
              <Pressable
                onPress={() => setCravingScreen1(1)}
                style={{
                  position: 'absolute',
                  marginTop: 24,
                  marginLeft: 24,
                  zIndex: 10,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#6F7985' }}>Close</Text>
              </Pressable>

              {/* Alternative Screen Title */}
              <Text style={{ fontSize: 40, fontFamily: 'Inter_600SemiBold', color: '#A9C1F9', marginTop: 30 }}>
                I overcame a craving
              </Text>
              <Text style={{ fontSize: 18, color: '#2E2E2E', marginTop: 30, marginBottom: 30 }}>
                What coping strategy did you adopt to deal with your craving?
              </Text>

              {/* Alternatives Grid */}
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  marginTop: 10,
                }}
              >
                {[
                  {
                    label: 'I let the craving go',
                    icon: 'shield-outline',
                    backgroundColor: '#cce4ff',
                  },
                  {
                    label: 'I exercise for 15–30 mins',
                    icon: 'barbell-outline',
                    backgroundColor: '#ffe5b4',
                  },
                  {
                    label: 'I meditate or relax',
                    icon: 'heart-outline',
                    backgroundColor: '#d9f7be',
                  },
                  {
                    label: 'I stay hydrated',
                    icon: 'water-outline',
                    backgroundColor: '#d0f0f6',
                  },
                  {
                    label: 'I replace oral fixations',
                    icon: 'restaurant-outline',
                    backgroundColor: '#fff4b3',
                  },
                  {
                    label: 'I smoke with awareness',
                    icon: 'eye-outline',
                    backgroundColor: '#f0e4ff',
                  },
                ].map((item) => {
                  const isSelected = selectedAlternative?.label === item.label;
                  return (
                    <TouchableOpacity
                      key={item.label}
                      onPress={() => setSelectedAlternative(item)}
                      style={{
                        width: '48%',
                        aspectRatio: 1.2,
                        backgroundColor: item.backgroundColor,
                        borderRadius: 16,
                        marginBottom: 16,
                        padding: 16,
                        borderWidth: isSelected ? 3 : 0,
                        borderColor: isSelected ? '#A9C1F9' : 'transparent',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Ionicons name={item.icon} size={26} color="black" />
                      <Text style={{ fontSize: 25, fontWeight: '500', color: '#333' }}>{item.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Finish Button */}
              <TouchableOpacity
                onPress={async () => {
                  if (!selectedEmotion?.label || !selectedAlternative?.label) {
                    alert("Please select both an emotion and an alternative.");
                    return;
                  }

                  try {
                    await saveCraving({
                      strength: cravingLevel,
                      emotion: selectedEmotion.label,
                      emotionIcon: selectedEmotion.icon,
                      alternative: selectedAlternative.label,
                      altIcon: selectedAlternative.icon,
                    });

                    setSelectedEmotion(null);
                    setSelectedAlternative(null);
                    setCravingLevel(5);
                    setShowCravingModal1(false);
                    setCravingScreen1(1);
                  } catch (error) {
                    console.error('Error saving craving:', error);
                    alert("Something went wrong saving your craving. Please try again.");
                  }
                }}
                disabled={!selectedEmotion?.label || !selectedAlternative?.label}
                style={{
                  backgroundColor:
                    selectedEmotion?.label && selectedAlternative?.label ? '#A9C1F9' : '#ccc',
                  paddingVertical: 20,
                  borderRadius: 12,
                  alignItems: 'center',
                  marginTop: 60,
                }}
              >
                <Text style={{ color: 'white', fontSize: 20, fontFamily: 'Inter_600SemiBold' }}>
                  Finish
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>

      <Modal
        visible={showVapeModal}
        animationType="slide"
        transparent={true}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'white',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingHorizontal: 24,
            paddingVertical: 40,
          }}
        >
          {/* Vape Session Title */}
          <View style={{ alignItems: 'center', marginTop: 65 }}>
            <Text style={{ fontSize: 40, fontWeight: '800', color: '#D1B7E9' }}>
              Vape Session
            </Text>
          </View>

          {/* Puff Controls */}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {/* Minus Button */}
              <TouchableOpacity
                onPress={removePuff}
                activeOpacity={0.6}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#E0E0E0',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 30,
                }}
              >
                <FontAwesome6 name="minus" size={28} color="#909DA5" />
              </TouchableOpacity>

              {/* Puff Count */}
              <View
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 60,
                  backgroundColor: '#F0FCF8',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    color: '#28AE5F',
                    fontSize: 36,
                    fontFamily: 'Inter_600SemiBold',
                  }}
                >
                  {puffsToday}
                </Text>
              </View>

              {/* Plus Button */}
              <TouchableOpacity
                onPress={() => {
                  addPuff();
                  resetVapeFreeTimer();
                }}
                
                activeOpacity={0.6}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#E0E0E0',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 30,
                }}
              >
                <Octicons name="plus" size={28} color="#909DA5" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Finish Button */}
          <TouchableOpacity
            onPress={async () => {
              try {
                const now = new Date();
                const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

                const { error } = await supabase.from('vapesession').insert([
                  {
                    user_id: userId,
                    date: formattedDate,
                    puff_count: puffsToday,
                  },
                ]);

                if (error) {
                  console.error('Failed to save vape session:', error);
                } else {
                  console.log('Vape session saved!');
                }
              } catch (err) {
                console.error('Error saving vape session:', err);
              }

              setShowVapeModal(false);
            }}
            style={{
              backgroundColor: '#D1B7E9',
              paddingVertical: 20,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 20,
                fontFamily: 'Inter_600SemiBold',
              }}
            >
              Finish
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Fullscreen Modal */}
      <Modal
        visible={modalVisibleFrank}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisibleFrank(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#FEFEFE",
            paddingTop: 60,
            paddingHorizontal: 20,
          }}
        >
          {/* Top-left Close */}
          <Pressable
            onPress={() => setModalVisibleFrank(false)}
            style={{
              position: "absolute",
              top: 60,
              left: 20,
              zIndex: 10,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#6F7985" }}>
              Close
            </Text>
          </Pressable>

          {/* Robot gif */}
          <View style={{ alignItems: "center", marginTop: 90 }}>
            <Image
              source={require("@/assets/gifs/robotseeker.gif")}
              style={{ width: 200, height: 200, resizeMode: "contain" }}
            />
          </View>

          {/* Quitline text */}
          <View style={{ marginTop: 20, alignItems: "center" }}>
            <Text
              style={{
                color: "#2E2E2E",
                fontSize: 22,
                fontWeight: "700",
                textAlign: "center",
                paddingHorizontal: 20,
              }}
            >
              Frank Quitline: 0300 123 6600
            </Text>

            {/* Caption */}
            <Text
              style={{
                color: "#D3D3D3",
                fontSize: 16,
                fontWeight: "500",
                textAlign: "center",
                marginTop: 10,
                paddingHorizontal: 20,
              }}
            >
              Call or message to get confidential help and advice from trained
              drug and alcohol support workers. Free and available 24/7 for
              under-18s and adults.
            </Text>
          </View>

          {/* Buttons */}
          <View style={{ marginTop: 40 }}>
            <Pressable
              onPress={() => Linking.openURL("tel:03001236600")}
              style={{
                height: 65,
                borderRadius: 50,
                backgroundColor: "#28A745", // Green for Call
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>
                Call
              </Text>
            </Pressable>

            <Pressable
              onPress={() => Linking.openURL("sms:03001236600")}
              style={{
                height: 65,
                borderRadius: 50,
                backgroundColor: "#007BFF", // Blue for Message
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>
                Message
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

        <Modal visible={modalVisible} animationType="slide">
          <View style={{ flex: 1, backgroundColor: "white", padding: 20, marginTop: 30 }}>
            {/* Close button */}
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Feather name="chevron-left" size={30} color="#2E2E2E" />
            </TouchableOpacity>

            {/* Title */}
            <View style={{ alignItems: "center", marginTop: 15 }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  color: "#2E2E2E",
                }}
              >
                Add a Strategy
              </Text>
            </View>

            {/* Enter button */}
            <TouchableOpacity
              onPress={() => {
                if (newStrategy.trim() !== "") {
                  setStrategies([newStrategy, ...strategies]); // add to top
                  setNewStrategy("");
                  setModalVisible(false);
                }
              }}
              style={{
                marginTop: 30,
                backgroundColor: "#00D68B",
                padding: 15,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>
                Enter
              </Text>
            </TouchableOpacity>

            {/* Input */}
            <TextInput
              placeholder="Type your strategy..."
              value={newStrategy}
              onChangeText={setNewStrategy}
              style={{
                marginTop: 20,
                borderWidth: 1,
                borderColor: "#D3D3D3",
                borderRadius: 10,
                padding: 15,
                fontSize: 18,
              }}
            />
          </View>
        </Modal>
    </ScrollView>
  );
}