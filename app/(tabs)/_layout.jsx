import { FontAwesome, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { CircleEllipsis } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const activeColor = '#01A362';
  const inactiveColor = '#949494';
  const [showMore, setShowMore] = useState(false);

  const tabBarHeight = 55 + (Platform.OS === 'android' ? insets.bottom : 5);
  const modalHeight = 200;
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: showMore ? modalHeight : 0,
      duration: showMore ? 300 : 250,
      useNativeDriver: false,
    }).start();
  }, [showMore]);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: 'white',
            height: tabBarHeight,
            paddingBottom: Platform.OS === 'android' ? insets.bottom : 5, 
            paddingTop: 7,
            borderTopWidth: 2,
            borderTopColor: activeColor,
          },
        }}
      >
        {/* index.jsx -> Today */}
        <Tabs.Screen name="index" options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', minWidth: 70 }}>
              <FontAwesome name="square-o" size={25} color={focused ? activeColor : inactiveColor} />
              <Text style={{ fontSize: 13, color: focused ? activeColor : inactiveColor, marginTop: 4 }}>Dashboard</Text>
            </View>
          ),
        }} />

        {/* checkin.jsx */}
        <Tabs.Screen name="checkin" options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', minWidth: 60 }}>
              <MaterialCommunityIcons name="clipboard-edit-outline" size={25} color={focused ? activeColor : inactiveColor} />
              <Text style={{ fontSize: 13, color: focused ? activeColor : inactiveColor, marginTop: 4 }}>Check In</Text>
            </View>
          ),
        }} />

        {/* toolbox.jsx */}
        <Tabs.Screen name="toolbox" options={{
          tabBarIcon: ({ focused }) => (
            <FontAwesome6 name="circle-plus" size={27} color={focused ? activeColor : inactiveColor} />
          ),
        }} />

        {/* statistics.jsx */}
        <Tabs.Screen name="statistics" options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', minWidth: 60 }}>
              <FontAwesome6 name="chart-simple" size={25} color={focused ? activeColor : inactiveColor} />
              <Text style={{ fontSize: 13, color: focused ? activeColor : inactiveColor, marginTop: 4 }}>Stats</Text>
            </View>
          ),
        }} />

        {/* fake placeholder for More menu */}
        <Tabs.Screen
          name="more-placeholder"
          listeners={{ tabPress: e => { e.preventDefault(); setShowMore(true); } }}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: 'center', minWidth: 60 }}>
                <CircleEllipsis size={24} color={focused ? activeColor : inactiveColor} />
                <Text style={{ fontSize: 13, color: focused ? activeColor : inactiveColor, marginTop: 4 }}>More</Text>
              </View>
            ),
          }}
        />
      </Tabs>

      {/* More Modal */}
      <Modal
        visible={showMore}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMore(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
          onPress={() => setShowMore(false)}
        >
          <Animated.View
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              height: heightAnim,
              backgroundColor: 'white',
            }}
          >
            {/* Top grey separator line */}
            <View
              style={{
                height: 3,
                backgroundColor: '#F3F3F3',
                width: '100%',
              }}
            />

            {/* Section 1 (Achievements & Badges) */}
            <Pressable
              onPress={() => {
                setShowMore(false);
                router.push('/(more)/achievements');
              }}
              style={{
                height: 100,
                backgroundColor: 'white',
                borderBottomWidth: 3,
                borderBottomColor: '#F3F3F3',
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: 20,
              }}
            >
              <FontAwesome6 name="medal" size={27} color="gold" />
              <Text
                style={{
                  marginLeft: 20,
                  fontSize: 27,
                  fontWeight: '700',
                  color: '#2E2E2E',
                }}
              >
                Achievements & Badges
              </Text>
            </Pressable>

            {/* Section 3 (Profile) */}
            <Pressable
              onPress={() => {
                setShowMore(false);
                router.push('/(auth)/profile');
              }}
              style={{
                height: 100,
                borderBottomWidth: 3,
                borderBottomColor: '#F3F3F3',
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: 20,
              }}
            >
              <FontAwesome name="user-circle" size={30} color="blue" />
              <Text
                style={{
                  marginLeft: 20,
                  fontSize: 27,
                  fontWeight: '700',
                  color: '#2E2E2E',
                }}
              >
                Profile
              </Text>
            </Pressable>

          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}
