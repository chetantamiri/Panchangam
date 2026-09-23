// Trigger Metro reload to resolve new screen files
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet, Platform, Text, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { Home, Moon, Calendar as CalendarIcon, Flame, Menu, Heart, Sparkles, LogIn, User, Sun, Compass } from 'lucide-react-native';
import { useAuth } from '../services/AuthContext';
import { AuthScreen } from '../screens/AuthScreen';
import { StatusScreen } from '../screens/StatusScreen';


import { useTheme } from '../theme/ThemeContext';
import { HomeScreen } from '../screens/HomeScreen';
import { PanchangScreen } from '../screens/PanchangScreen';
import { MatchCheckerScreen } from '../screens/MatchCheckerScreen';
import { HoroscopePredictionsScreen } from '../screens/HoroscopePredictionsScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { FestivalsScreen } from '../screens/FestivalsScreen';
import { MenuScreen } from '../screens/MenuScreen';
import { DailyHoroscopeScreen } from '../screens/DailyHoroscopeScreen';
import { NumerologyScreen } from '../screens/NumerologyScreen';
import { KundaliChartScreen } from '../screens/KundaliChartScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { UserManagementScreen } from '../screens/UserManagementScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const AccountWrapperScreen = ({ navigation }: any) => {
  const { user, userProfile, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  // Both admin and user see their Profile page in the Account tab
  if (userProfile?.role === 'admin' || userProfile?.status === 'approved') {
    return <ProfileScreen navigation={navigation} />;
  }

  return <StatusScreen />;
};

const PanchangWrapper = ({ navigation, route }: any) => {
  const { user, userProfile, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (userProfile?.role === 'admin' || userProfile?.status === 'approved') {
    return <PanchangScreen navigation={navigation} route={route} />;
  }

  return <StatusScreen />;
};

const MatchCheckerWrapper = ({ navigation, route }: any) => {
  const { user, userProfile, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (userProfile?.role === 'admin' || userProfile?.status === 'approved') {
    return <MatchCheckerScreen navigation={navigation} route={route} />;
  }

  return <StatusScreen />;
};

const HoroscopeWrapper = ({ navigation, route }: any) => {
  const { user, userProfile, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (userProfile?.role === 'admin' || userProfile?.status === 'approved') {
    return <HoroscopePredictionsScreen navigation={navigation} route={route} />;
  }

  return <StatusScreen />;
};

const TabNavigator = () => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();


  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          elevation: 10,
          backgroundColor: isDark ? 'rgba(18, 18, 18, 0.92)' : 'rgba(255, 255, 255, 0.92)',
          borderRadius: 28,
          height: 68,
          borderTopWidth: 0,
          borderColor: colors.primary + '40',
          borderWidth: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: isDark ? 0.6 : 0.12,
          shadowRadius: 20,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarBackground: () => (
          <BlurView 
            tint={isDark ? "dark" : "light"} 
            intensity={95} 
            style={[StyleSheet.absoluteFill, { borderRadius: 28, overflow: 'hidden' }]} 
          />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && { backgroundColor: colors.primary + '26' }]}>
              <Home color={color} size={22} />
            </View>
          )
        }}
      />
      <Tab.Screen 
        name="Panchang" 
        component={PanchangWrapper} 
        options={{
          tabBarLabel: 'Panchangam',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && { backgroundColor: colors.primary + '26' }]}>
              <Moon color={color} size={22} />
            </View>
          )
        }}
      />
      <Tab.Screen 
        name="MatchChecker" 
        component={MatchCheckerWrapper} 
        options={{
          tabBarLabel: 'Match',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && { backgroundColor: colors.primary + '26' }]}>
              <Heart color={color} size={22} />
            </View>
          )
        }}
      />
      <Tab.Screen 
        name="Horoscope" 
        component={HoroscopeWrapper} 
        options={{
          tabBarLabel: 'Horoscope',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && { backgroundColor: colors.primary + '26' }]}>
              <Sparkles color={color} size={22} />
            </View>
          )
        }}
      />
      <Tab.Screen 
        name="Numerology" 
        component={NumerologyScreen} 
        options={{
          tabBarLabel: 'Numerology',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && { backgroundColor: colors.primary + '26' }]}>
              <Compass color={color} size={22} />
            </View>
          )
        }}
      />
      <Tab.Screen 
        name="DailyHoroscope" 
        component={DailyHoroscopeScreen} 
        options={{
          tabBarLabel: 'Daily',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && { backgroundColor: colors.primary + '26' }]}>
              <Sun color={color} size={22} />
            </View>
          )
        }}
      />
      <Tab.Screen 
        name="Account" 
        component={AccountWrapperScreen} 
        options={{
          tabBarLabel: user ? 'Account' : 'Login',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && { backgroundColor: colors.primary + '26' }]}>
              {user ? <User color={color} size={22} /> : <LogIn color={color} size={22} />}
            </View>
          )
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="KundaliChart" component={KundaliChartScreen} />
      <Stack.Screen name="Menu" component={MenuScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} />
      <Stack.Screen name="Festivals" component={FestivalsScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
