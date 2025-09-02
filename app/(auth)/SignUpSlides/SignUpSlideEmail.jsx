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

export default function SignUpSlideEmail() {
  const router = useRouter();
  const nameRef = useRef('');
  const emailRef = useRef('');
  const passwordRef = useRef('');
  const [fontsLoaded] = useFonts({ Inter_600SemiBold });

  const { width: screenWidth } = Dimensions.get('window');

  if (!fontsLoaded) return null;

  const onSubmit = async () => {
    const name = nameRef.current.trim();
    const email = emailRef.current.trim();
    const password = passwordRef.current.trim();

    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }

    try {
      // Directly sign up and push metadata to Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            signup_source: 'email', // optional extra metadata
            created_at: new Date().toISOString(),
          },
        },
      });

      if (error) throw new Error(error.message);

      console.log('User signed up successfully:', data.user);

      // Ensure session metadata is available after sign-up
      // Supabase should already include this metadata in the session
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Current session with metadata:', sessionData);

      router.push('/(tabs)');
    } catch (err) {
      Alert.alert('Sign Up Error', err.message);
      console.error('Supabase Sign Up Error:', err);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: 'white' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={{ flex: 1, padding: 20 }}>
              {/* Back Button & Title */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => router.back()}>
                  <Ionicons name="arrow-back" size={28} color="#02C7FC" />
                </TouchableOpacity>
                <Text style={{ marginLeft: 20, fontSize: 20, color: '#2E2E2E', fontFamily: 'Inter_600SemiBold' }}>
                  Sign up with email
                </Text>
              </View>

              {/* Illustration */}
              <Image
                source={require('@/assets/illustrations/signuppick.png')}
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
                  placeholder="User Name"
                  placeholderTextColor="#888"
                  onChangeText={(val) => (nameRef.current = val)}
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
                  placeholder="Email address"
                  placeholderTextColor="#888"
                  onChangeText={(val) => (emailRef.current = val)}
                  keyboardType="email-address"
                  autoCapitalize="none"
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

              {/* Submit Button */}
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
                <Text style={{ color: 'white', fontSize: 18, fontFamily: 'Inter_600SemiBold' }}>
                  Sign up
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
