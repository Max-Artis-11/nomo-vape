import Colors from '@/shared/Colors';
import { Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

const Button = ({ title, onPress = () => {} }) => {
  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
  });

  if (!fontsLoaded) return null;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        padding: 20,
        backgroundColor: Colors.WHITE,
        width: '100%',
        borderRadius: 15,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          color: Colors.BLACK,
          fontFamily: 'Inter_600SemiBold',
          letterSpacing: -0.5,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
