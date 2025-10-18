import { supabase } from '@/lib/supabase';
import { FontAwesome6, MaterialIcons, Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [settingsScreen, setSettingsScreen] = useState('main');
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error('Failed to get user:', error?.message);
        return;
      }

      setUserData({
        id: user.id,
        name: user.user_metadata?.full_name || 'No name found',
        email: user.email,
        gender: user.user_metadata?.gender || 'N/A',
        birthday: user.user_metadata?.birthday || 'N/A',
        mainReason: user.user_metadata?.mainReason || 'N/A',
        whenStartVaping: user.user_metadata?.whenstartvaping || 'N/A',
        timesQuit: user.user_metadata?.timesquit || 'N/A',
        avatarUrl: user.user_metadata?.avatar_url || null,
        createdAt: user.created_at || null,
      });

      setProfileImage(user.user_metadata?.avatar_url || null);
    };

    getUser();
  }, []);

  const formatDate = (isoDate) => {
    if (!isoDate) return 'N/A';
    const d = new Date(isoDate);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  if (!userData) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', padding: 20 }}>
        <Text style={{ color: '#6F7985', fontSize: 18, textAlign: 'center' }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Close Button */}
      <Pressable
        onPress={() => router.replace('/(tabs)')}
        style={{
          position: 'absolute',
          top: 25,
          left: 20,
          zIndex: 10,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#6F7985' }}>Close</Text>
      </Pressable>

      {/* Gear Icon */}
      <Pressable
        onPress={() => {
          setSettingsScreen('main');
          setSettingsVisible(true);
        }}
        style={{
          position: 'absolute',
          top: 25,
          right: 20,
          zIndex: 10,
        }}
      >
        <Octicons name="gear" size={24} color="#6F7985" />
      </Pressable>

      <ScrollView contentContainerStyle={{ paddingTop: 80, paddingBottom: 40 }}>
        {/* Profile Info */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(0,0,0,0.05)',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 10,
            }}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={{ width: 80, height: 80, borderRadius: 40 }} />
            ) : (
              <MaterialIcons name="person" size={48} color="#6F7985" />
            )}
          </View>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#2E2E2E' }}>
            Hello, {userData.name}!
          </Text>
        </View>

        {/* Journey */}
        <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#2E2E2E', marginBottom: 8 }}>My journey</Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#6F7985' }}>
            I am vape free since {formatDate(userData.createdAt)}
          </Text>
        </View>

        {/* Compass Info */}
        <View style={{ paddingHorizontal: 20, marginTop: 30 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#2E2E2E', marginBottom: 30 }}>My compass</Text>

          <Text style={{ fontSize: 25, marginBottom: 30 }}>
            <Text style={{ fontWeight: '800' }}>Name:</Text> {userData.name}
          </Text>
          <Text style={{ fontSize: 25, marginBottom: 30 }}>
            <Text style={{ fontWeight: '800' }}>Gender:</Text> {userData.gender}
          </Text>
          <Text style={{ fontSize: 25, marginBottom: 30 }}>
            <Text style={{ fontWeight: '800' }}>Year of Birth:</Text> {userData.birthday}
          </Text>
          <Text style={{ fontSize: 25, marginBottom: 30 }}>
            <Text style={{ fontWeight: '800' }}>Reason of change:</Text> {userData.mainReason}
          </Text>
          <Text style={{ fontSize: 25, marginBottom: 30 }}>
            <Text style={{ fontWeight: '800' }}>When started:</Text> {userData.whenStartVaping}
          </Text>
          <Text style={{ fontSize: 25 }}>
            <Text style={{ fontWeight: '800' }}>How many times have you tried to quit:</Text>{' '}
            {userData.timesQuit}
          </Text>
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={settingsVisible}
        onRequestClose={() => setSettingsVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
          <StatusBar barStyle="dark-content" />

          {/* Back Button */}
          <Pressable
            onPress={() => {
              if (settingsScreen === 'main') {
                setSettingsVisible(false);
              } else {
                setSettingsScreen('main');
              }
            }}
            style={{
              position: 'absolute',
              top: 75,
              left: 20,
              zIndex: 10,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#6F7985' }}>Back</Text>
          </Pressable>

          {settingsScreen === 'main' ? (
            <ScrollView contentContainerStyle={{ paddingTop: 120, paddingHorizontal: 20, paddingBottom: 100 }}>
              <Text style={{ fontSize: 25, fontWeight: '800' }}>Settings</Text>

              <Text style={{ fontSize: 18, fontWeight: '800', marginTop: 35 }}>
                My Nomo Vape Passport
              </Text>

              {/* Account Details Button */}
              <TouchableOpacity
                onPress={() => setSettingsScreen('account')}
                style={{
                  marginTop: 20,
                  backgroundColor: 'white',
                  borderRadius: 8,
                  borderColor: '#DEDEDE',
                  borderWidth: 1,
                  paddingHorizontal: 20,
                  paddingVertical: 25,
                  width: '100%',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <FontAwesome6 name="pen-to-square" size={20} color="#2E2E2E" />
                  <Text style={{ marginLeft: 10, fontSize: 18, color: '#2E2E2E' }}>
                    Account details
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Logout Button */}
              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  marginTop: 20,
                  backgroundColor: 'white',
                  borderRadius: 8,
                  borderColor: '#DEDEDE',
                  borderWidth: 1,
                  paddingVertical: 10,
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 18, color: 'red' }}>Log out</Text>
              </TouchableOpacity>

              {/* About Section */}
              <Text style={{ fontSize: 18, fontWeight: '800', marginTop: 30 }}>
                About Nomo Vape
              </Text>

              {/* Terms of Service Button */}
              <TouchableOpacity
                onPress={() => setSettingsScreen('terms')}
                style={{
                  marginTop: 20,
                  backgroundColor: 'white',
                  borderRadius: 8,
                  borderColor: '#DEDEDE',
                  borderWidth: 1,
                  paddingHorizontal: 20,
                  paddingVertical: 25,
                  width: '100%',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <FontAwesome6 name="circle-check" size={20} color="#2E2E2E" />
                  <Text style={{ marginLeft: 10, fontSize: 18, color: '#2E2E2E' }}>
                    Terms of Service
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Privacy Policy Button */}
              <TouchableOpacity
                onPress={() => setSettingsScreen('privacy')}
                style={{
                  marginTop: 20,
                  backgroundColor: 'white',
                  borderRadius: 8,
                  borderColor: '#DEDEDE',
                  borderWidth: 1,
                  paddingHorizontal: 20,
                  paddingVertical: 25,
                  width: '100%',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <FontAwesome6 name="lock" size={20} color="#2E2E2E" />
                  <Text style={{ marginLeft: 10, fontSize: 18, color: '#2E2E2E' }}>
                    Privacy Policy
                  </Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          ) : settingsScreen === 'account' ? (
            <ScrollView contentContainerStyle={{ paddingTop: 120, paddingHorizontal: 20, paddingBottom: 100 }}>
              <Text style={{ fontSize: 25, fontWeight: '800', color: '#2E2E2E', marginBottom: 30 }}>
                Account details
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>Name:</Text>
              <Text style={{ fontSize: 18, marginBottom: 20 }}>{userData.name}</Text>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>Email:</Text>
              <Text style={{ fontSize: 18 }}>{userData.email}</Text>
            </ScrollView>
          ) : settingsScreen === 'terms' ? (
            <ScrollView contentContainerStyle={{ paddingTop: 120, paddingHorizontal: 20, paddingBottom: 100 }}>
              <Text style={{ fontSize: 25, fontWeight: '800', color: '#2E2E2E', marginBottom: 30 }}>
                Terms of Service
              </Text>
              <Text style={{ fontSize: 16, color: '#333', lineHeight: 22 }}>
                {/* Replace with your full Terms of Service text */}
                {`
                Nomo Vape Terms and Conditions
                Effective Date: 25/07/2025 BST
                Last Updated: 25/07/2025 BST

                1. Introduction
                Welcome to Nomo Vape ("we", "us", "our"). These Terms and Conditions ("Terms") govern your use of the Nomo Vape mobile application ("App") and any related services provided through it. By downloading, accessing or using the App, you confirm that you have read, understood and agree to be bound by these Terms.

                If you do not agree to these Terms, please do not use the App.

                2. Who We Are
                Nomo Vape is a UK-based digital health and wellbeing application designed to support individuals in their journey to quit vaping. Trading under the name Nomo Vape.

                For all enquiries, including legal or support-related matters, please contact us at:
                Email: max.im.enterprize@gmail.com

                3. Eligibility
                To use Nomo Vape, you must be at least 13 years old. By using the App, you confirm that you meet this age requirement. If you are under 13, do not use this App. By using the App, you warrant that you are of legal age and that you have the capacity to enter into a binding agreement.

                4. Account Registration
                To use certain features of the App, you may be required to register and provide personal information including, but not limited to, your name, email, birthday, gender, and information about your vaping habits. You agree that the information you provide is accurate and up-to-date.

                You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account.

                5. Data and Privacy
                We take your privacy seriously. By using the App, you consent to the collection and processing of your data in accordance with our [Privacy Policy] (available within the App or upon request). Personal data may include health-related information such as your reasons for quitting, vape usage, and quit history.

                Your data is securely stored using Supabase infrastructure. While we implement safeguards to protect your information, you acknowledge that no system is completely secure.

                6. User Responsibilities
                You agree not to use the App:

                For any unlawful purpose or in breach of any applicable UK laws or regulations;

                To transmit harmful, offensive, or inappropriate content;

                To interfere with the proper operation of the App;

                To attempt to gain unauthorised access to other user accounts or data.

                We reserve the right to suspend or terminate accounts that violate these Terms.

                7. Health Disclaimer
                Nomo Vape is designed as a motivational tool and self-monitoring aid. It is not a medical device and does not provide medical advice. You should consult a medical professional before making any health decisions or quitting substances if you have underlying conditions.

                Use of the App is entirely at your own risk. We accept no liability for any consequences arising from decisions made based on the information provided by the App.

                8. Intellectual Property
                All content, trademarks, logos, graphics, and code within the App are the intellectual property of Nomo Vape or its licensors. You are granted a limited, non-exclusive, non-transferable licence to use the App for personal, non-commercial purposes only.

                You may not copy, distribute, modify, reverse-engineer, or create derivative works of the App without prior written consent.

                9. Limitation of Liability
                To the fullest extent permitted by UK law, Nomo Vape shall not be liable for:

                Any indirect, incidental, special, or consequential damages;

                Any loss of data, income, or profits;

                Any loss resulting from your reliance on the App or its content.

                We do not guarantee that the App will be error-free or continuously available.

                10. Termination
                We reserve the right to terminate or suspend your access to the App at any time, without prior notice, for any reason including breach of these Terms.

                Upon termination, your right to use the App will immediately cease. You may delete your account at any time through the App or by contacting us.

                11. Modifications
                We may update these Terms from time to time. When we do, we will revise the "Last Updated" date at the top. Continued use of the App after any such changes constitutes your acceptance of the revised Terms.

                We recommend reviewing these Terms periodically to stay informed.

                12. Governing Law
                These Terms are governed by and construed in accordance with the laws of England and Wales. Any disputes arising in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.

                13. Contact
                For any questions, concerns, or legal notices, please contact:

                Nomo Vape
                Email: max.im.enterprize@gmail.com

                (End of Terms of Service)
                `}
              </Text>
            </ScrollView>
          ) : settingsScreen === 'privacy' ? (
            <ScrollView contentContainerStyle={{ paddingTop: 120, paddingHorizontal: 20, paddingBottom: 100 }}>
              <Text style={{ fontSize: 25, fontWeight: '800', color: '#2E2E2E', marginBottom: 30 }}>
                Privacy Policy
              </Text>
              <Text style={{ fontSize: 16, color: '#333', lineHeight: 22 }}>
                {/* Replace with your full Privacy Policy text */}
                {`
                Privacy Policy
                Last updated: 25/07/2025 (BST)

                Welcome to Nomo Vape ("we", "us", "our"). This Privacy Policy explains how we collect, use, store, and protect your personal data when you use our mobile application ("Nomo Vape", "the App") available via the Google Play Store.

                By using the App, you agree to the practices outlined in this Privacy Policy. If you do not agree, please do not use the App.

                1. Who We Are
                Nomo Vape is a mobile wellness app designed to help users quit or reduce vaping. For all data protection matters, you can contact us at:

                Email: max.im.enterprize@gmail.com
                Location: United Kingdom (UK)

                We are the data controller of your personal information for the purposes of the UK General Data Protection Regulation (UK GDPR).

                2. Data We Collect
                We collect the following types of personal information when you use Nomo Vape:

                a. Account & Authentication Data
                Email address

                Password (securely stored using industry-standard encryption via Supabase)

                Unique user ID

                Account creation and sign-in timestamps

                b. Profile Information
                Full name

                Birthday (year only)

                Gender

                Quit vaping date

                Puffs per day (self-reported)

                Money spent weekly (on vaping)

                Main reason for quitting

                Times previously attempted to quit

                Age started vaping

                c. Usage Data
                Dates and times of logins

                Timestamps for milestones and streaks

                In-app preferences or settings

                We do not collect precise location data or track user movement. We do not serve ads or use tracking cookies.

                3. How We Use Your Data
                We process your data for the following purposes:

                To create and maintain your account

                To provide personalised stats and insights

                To track your vape-free streaks and savings

                To allow milestone notifications and reminders

                To generate visualisations based on your progress

                To improve our services and fix bugs

                To comply with legal obligations

                4. Legal Basis for Processing
                Under the UK GDPR, we rely on the following legal bases:

                Consent: By signing up and entering your data, you consent to us using it for the above purposes.

                Performance of a contract: We need your data to provide access to the features of the App.

                Legitimate interests: For security, service improvement, and analytics (non-personal).

                5. Who We Share Your Data With
                We do not sell or share your personal data with third parties for marketing purposes.

                We may share your data with:

                Supabase (data hosting, authentication, and database provider)

                Your data is stored securely on Supabase servers in accordance with their terms of service and privacy standards.

                Service providers only when necessary to run or improve the App (e.g., for backups or error logging)

                Legal authorities, if required to comply with UK law

                All processors and sub-processors we use are GDPR-compliant.

                6. Data Retention
                We retain your personal data for as long as you maintain an account with us. If you delete your account, we will delete your data from our active systems within 30 days. Backup data may persist for an additional up to 90 days for security and disaster recovery purposes.

                7. Your Rights Under UK GDPR
                As a UK-based user, you have the following rights:

                Right to access – Request a copy of your personal data

                Right to rectification – Correct inaccurate or incomplete data

                Right to erasure – Request deletion of your data ("right to be forgotten")

                Right to restrict processing – Ask us to stop processing some of your data

                Right to data portability – Receive your data in a portable format

                Right to object – Object to data processing in some circumstances

                You can exercise any of these rights by emailing: max.im.enterprize@gmail.com
                We will respond within 30 days.

                8. Children’s Privacy
                You must be at least 13 years old to use Nomo Vape.

                We do not knowingly collect data from users under 13. If we learn that we have collected personal information from someone under 13, we will delete that data immediately.

                9. Security
                We take data protection seriously. We implement the following safeguards:

                Encrypted database storage via Supabase

                TLS-secured data transmission

                Regular security reviews and access controls

                Strong password enforcement and token-based authentication

                However, no method of electronic transmission is 100% secure. You use the App at your own risk.

                10. Changes to This Policy
                We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date at the top of this page. We recommend checking this page periodically for updates.

                11. Contact
                If you have any questions about this Privacy Policy, or wish to exercise your data rights, please contact:

                Email: max.im.enterprize@gmail.com

                (End of Privacy Policy)
                `}
              </Text>
            </ScrollView>
          ) : null}
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}
