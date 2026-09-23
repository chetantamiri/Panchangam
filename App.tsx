import React, { useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AuthProvider } from './src/services/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AnimatedSplashScreen } from './src/screens/AnimatedSplashScreen';
import { VedicChatbot } from './src/components/VedicChatbot';
import './src/services/firebase';

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';

// ─── Main content (inside ThemeProvider) ─────────────────────────────────────

const MainAppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { colors, isDark } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppNavigator />
      <VedicChatbot />

      {/* Animated splash overlay */}
      {showSplash && (
        <AnimatedSplashScreen onComplete={() => setShowSplash(false)} />
      )}

      <StatusBar style={isDark ? 'light' : 'dark'} />
    </View>
  );
};

// ─── Root component ───────────────────────────────────────────────────────────

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <NavigationContainer>
            <MainAppContent />
          </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
