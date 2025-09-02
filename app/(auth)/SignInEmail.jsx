import { Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { supabase } from '@/lib/supabase';

export default function SignInEmail() {
  const router = useRouter();
  const emailRef = useRef('');
  const passwordRef = useRef('');

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
  });

  const { width: screenWidth } = Dimensions.get('window');

  if (!fontsLoaded) return null;

  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert('Login', 'Please fill out all the fields');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailRef.current.trim(),
        password: passwordRef.current.trim(),
      });

      if (error) throw new Error(error.message);

      console.log('Signed in user:', data.user);
      router.push('/(tabs)');
    } catch (error) {
      Alert.alert('Login Error', error.message);
      console.error(error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: 'white' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ flex: 1, padding: 20 }}>
              {/* Back Arrow and Title */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => router.back()}>
                  <Ionicons name="arrow-back" size={28} color="#02C7FC" />
                </TouchableOpacity>
                <Text
                  style={{
                    marginLeft: 20,
                    fontSize: 20,
                    color: '#2E2E2E',
                    fontFamily: 'Inter_600SemiBold',
                  }}
                >
                  Sign in with email
                </Text>
              </View>

              {/* Illustration */}
              <Image
                source={require('@/assets/illustrations/101-unlock.png')}
                style={{
                  width: screenWidth * 0.8,
                  height: screenWidth * 0.6,
                  resizeMode: 'contain',
                  alignSelf: 'center',
                  marginTop: 110,
                }}
              />

              {/* Input Fields */}
              <View style={{ marginTop: 40 }}>
                <TextInput
                  placeholder="Email address"
                  placeholderTextColor="#888"
                  onChangeText={(val) => (emailRef.current = val)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{
                    height: 52,
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: '#DEDEDE',
                    paddingHorizontal: 16,
                    fontSize: 16,
                    color: '#000',
                  }}
                />

                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#888"
                  onChangeText={(val) => (passwordRef.current = val)}
                  secureTextEntry
                  style={{
                    marginTop: 10,
                    height: 52,
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: '#DEDEDE',
                    paddingHorizontal: 16,
                    fontSize: 16,
                    color: '#000',
                  }}
                />
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                onPress={onSubmit}
                style={{
                  marginTop: 25,
                  backgroundColor: '#02C7FC',
                  height: 52,
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 18,
                    fontFamily: 'Inter_600SemiBold',
                  }}
                >
                  Sign in
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
