import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/Typography';
import { Sparkles, Sun } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';

interface Props {
  onComplete: () => void;
}

export const AnimatedSplashScreen: React.FC<Props> = ({ onComplete }) => {
  const { colors, isDark } = useTheme();

  const mandalaRotate = useSharedValue(0);
  const emblemScale = useSharedValue(0.4);
  const emblemOpacity = useSharedValue(0);
  const textY = useSharedValue(25);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    // 1. Continuous Mandala Rotation
    mandalaRotate.value = withRepeat(
      withTiming(360, { duration: 12000, easing: Easing.linear }),
      -1,
      false
    );

    // 2. Emblem Spring Entrance
    emblemOpacity.value = withTiming(1, { duration: 400 });
    emblemScale.value = withSpring(1, { damping: 12, stiffness: 100 });

    // 3. Text Fade & Slide
    textOpacity.value = withTiming(1, { duration: 500 });
    textY.value = withSpring(0, { damping: 14 });

    // 4. Complete splash after 2.5 seconds - instant transition with 0 white flash
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const animatedMandala = useAnimatedStyle(() => ({
    transform: [{ rotate: `${mandalaRotate.value}deg` }],
  }));

  const animatedEmblem = useAnimatedStyle(() => ({
    opacity: emblemOpacity.value,
    transform: [{ scale: emblemScale.value }],
  }));

  const animatedText = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F1F5F9' }]}>
      <LinearGradient
        colors={isDark ? ['#000000', '#151106', '#000000'] : ['#FFFDF7', '#F5EFE0', '#E6DCBF']}
        style={StyleSheet.absoluteFill}
      >
        <View style={styles.centerBox}>
          {/* Rotating Mandala Rays */}
          <Animated.View style={[styles.mandalaWrapper, animatedMandala]}>
            <Svg height="260" width="260" viewBox="0 0 100 100">
              <Circle cx="50" cy="50" r="46" stroke={isDark ? "#D4AF37" : "#B58800"} strokeWidth="0.8" strokeDasharray="3 3" fill="none" opacity={0.6} />
              <Circle cx="50" cy="50" r="38" stroke={isDark ? "#FF9933" : "#EA580C"} strokeWidth="0.6" strokeDasharray="1 2" fill="none" opacity={0.5} />
              <Circle cx="50" cy="50" r="30" stroke={isDark ? "#D4AF37" : "#B58800"} strokeWidth="0.5" fill="none" opacity={0.4} />
            </Svg>
          </Animated.View>

          {/* Central Om Emblem */}
          <Animated.View style={[styles.emblemBox, animatedEmblem]}>
            <LinearGradient
              colors={['#FF9933', '#D4AF37']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.emblemGradient}
            >
              <Typography variant="display" style={styles.omSymbol}>
                ॐ
              </Typography>
            </LinearGradient>
          </Animated.View>

          {/* Title & Tagline */}
          <Animated.View style={[styles.textWrapper, animatedText]}>
            <View style={styles.titleRow}>
              <Sun color={isDark ? "#D4AF37" : "#D97706"} size={22} />
              <Typography 
                variant="display" 
                style={[styles.appTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}
              >
                PANCHANGAM
              </Typography>
            </View>

            <Typography 
              variant="caption" 
              style={[styles.appSubtitle, { color: isDark ? '#D4AF37' : '#B58800' }]}
            >
              DIVINE VEDIC ALMANAC & ASTROLOGY
            </Typography>

            <View 
              style={[
                styles.badgePill, 
                { 
                  backgroundColor: isDark ? 'rgba(255, 153, 51, 0.15)' : 'rgba(234, 88, 12, 0.12)',
                  borderColor: isDark ? 'rgba(255, 153, 51, 0.3)' : 'rgba(234, 88, 12, 0.25)' 
                }
              ]}
            >
              <Sparkles color={isDark ? "#FF9933" : "#EA580C"} size={13} />
              <Typography 
                variant="caption" 
                weight="bold" 
                style={[styles.badgeText, { color: isDark ? '#FF9933' : '#EA580C' }]}
              >
                AUTHENTIC VEDIC WISDOM
              </Typography>
            </View>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 99999,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  mandalaWrapper: {
    position: 'absolute',
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emblemBox: {
    width: 104,
    height: 104,
    borderRadius: 52,
    elevation: 20,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    marginBottom: 26,
  },
  emblemGradient: {
    flex: 1,
    borderRadius: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  omSymbol: {
    fontSize: 50,
    color: '#000000',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: -4,
  },
  textWrapper: {
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginLeft: 8,
  },
  appSubtitle: {
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '600',
    marginTop: 4,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 18,
    borderWidth: 1,
  },
  badgeText: {
    marginLeft: 6,
    fontSize: 10,
    letterSpacing: 1,
  },
});
