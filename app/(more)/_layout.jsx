import { FontAwesome, FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { CircleEllipsis } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Modal, Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MoreLayout({ children }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const activeColor = "#01A362";
  const inactiveColor = "#949494";
  const [showMore, setShowMore] = useState(false);

  const tabBarHeight = 55 + (Platform.OS === "android" ? insets.bottom : 5);
  const modalHeight = 200;
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: showMore ? modalHeight : 0,
      duration: showMore ? 300 : 250,
      useNativeDriver: false,
    }).start();
  }, [showMore]);

  const Button = ({ icon, label, onPress }) => (
    <Pressable
      onPress={onPress}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      {icon}
      {label && <Text style={{ fontSize: 13, color: "#2E2E2E", marginTop: 4 }}>{label}</Text>}
    </Pressable>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Stack for rendering the actual screens like explore.jsx */}
      <Stack screenOptions={{ headerShown: false }} style={{ flex: 1 }}>
        {children}
      </Stack>

      {/* Bottom synthetic nav bar */}
      <View
        style={{
          flexDirection: "row",
          height: tabBarHeight,
          borderTopWidth: 2,
          borderTopColor: activeColor,
          backgroundColor: "white",
          paddingBottom: Platform.OS === "android" ? insets.bottom : 5,
        }}
      >
        <Button
          label="Dashboard"
          icon={<FontAwesome name="square-o" size={25} color={inactiveColor} />}
          onPress={() => router.push("/(tabs)/")}
        />
        <Button
          label="Check In"
          icon={<MaterialCommunityIcons name="clipboard-edit-outline" size={25} color={inactiveColor} />}
          onPress={() => router.push("/(tabs)/checkin")}
        />
        <Button
          icon={<FontAwesome6 name="circle-plus" size={27} color={inactiveColor} />}
          onPress={() => router.push("/(tabs)/toolbox")}
        />
        <Button
          label="Stats"
          icon={<FontAwesome6 name="chart-simple" size={25} color={inactiveColor} />}
          onPress={() => router.push("/(tabs)/statistics")}
        />
        <Button
          label="More"
          icon={<CircleEllipsis size={24} color={inactiveColor} />}
          onPress={() => setShowMore(true)}
        />
      </View>

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

            <Pressable
              onPress={() => {
                setShowMore(false);
                router.push('/(more)/achievements'); // <-- adjust this route if you have a page
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
    </View>
  );
}
