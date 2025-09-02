import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

const BreathingAnimation = () => {
  const scale = useRef(new Animated.Value(0.3)).current;
  const [isBreathingIn, setIsBreathingIn] = useState(true);

  useEffect(() => {
    const breatheIn = () => {
      Animated.timing(scale, {
        toValue: 1.2,
        duration: 3000,
        useNativeDriver: true,
      }).start(() => {
        setIsBreathingIn(false);
        breatheOut();
      });
    };

    const breatheOut = () => {
      Animated.timing(scale, {
        toValue: 0.3,
        duration: 3000,
        useNativeDriver: true,
      }).start(() => {
        setIsBreathingIn(true);
        breatheIn();
      });
    };

    breatheIn();
  }, [scale]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.circle, { transform: [{ scale }] }]} />
      <Text style={styles.text}>{isBreathingIn ? "Breathe In" : "Breathe Out"}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "30%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    position: "absolute",
  },
  text: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 200,
  },
});

export default BreathingAnimation;
