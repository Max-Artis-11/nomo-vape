import { Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SignIn() {
  const router = useRouter();
  const { width: screenWidth } = Dimensions.get('window');

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, padding: 20 }}>
          {/* Back Arrow */}
          <TouchableOpacity onPress={() => router.push('/')} style={{ marginBottom: 10 }}>
            <Ionicons name="arrow-back" size={28} color="#02C7FC" />
          </TouchableOpacity>

          {/* Title */}
          <Text style={{ fontSize: 32, color: '#2E2E2E', fontFamily: 'Inter_600SemiBold' }}>
            Sign in
          </Text>

          {/* Image */}
          <Image
            source={require('@/assets/illustrations/signinpic.png')}
            style={{
              width: screenWidth * 0.8,
              height: screenWidth * 0.6,
              resizeMode: 'contain',
              alignSelf: 'center',
              marginTop: 20,
            }}
          />

          {/* Sign in with email */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/SignInEmail')}
            style={{
              backgroundColor: 'white',
              height: 57,
              borderRadius: 10,
              marginTop: 20,
              width: screenWidth - 26,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: '#dedede',
              alignSelf: 'center',
            }}
          >
            <Text style={{ color: '#02C7FC', fontSize: 18, fontFamily: 'Inter_600SemiBold' }}>
              Sign in with email
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
