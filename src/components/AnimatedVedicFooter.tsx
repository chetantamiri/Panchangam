import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { Sun, Sparkles, Star } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from './Typography';

const { width } = Dimensions.get('window');

export const AnimatedVedicFooter: React.FC = () => {
  const { colors, isDark } = useTheme();

  // Animation values
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.35)).current;

  // Particle floating animations
  const p1Anim = useRef(new Animated.Value(0)).current;
  const p2Anim = useRef(new Animated.Value(0)).current;
  const p3Anim = useRef(new Animated.Value(0)).current;
  const p4Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Continuous slow rotation for mandala ring (20 seconds per turn)
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 2. Smooth floating motion up and down
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -5,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 5,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Logo scale breathing (1.0 -> 1.08 -> 1.0)
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 4. Slow breathing glow effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.75,
          duration: 2800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.35,
          duration: 2800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 5. Staggered floating particles animation
    const animateParticle = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 3500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 3500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateParticle(p1Anim, 0);
    animateParticle(p2Anim, 800);
    animateParticle(p3Anim, 1600);
    animateParticle(p4Anim, 2400);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const counterSpin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const textColor = colors.onPrimary || (isDark ? '#FFFFFF' : '#000000');
  const subTextColor = colors.onPrimary === '#FFFFFF' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.75)';
  const accentColor = colors.secondary || '#D4AF37';

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      {/* Background soft cosmic rays & aura */}
      <Animated.View 
        style={[
          styles.cosmicGlowBack, 
          { 
            backgroundColor: isDark ? 'rgba(212, 175, 55, 0.18)' : 'rgba(255, 255, 255, 0.22)',
            opacity: glowAnim,
            transform: [{ scale: Animated.multiply(scaleAnim, 1.1) }]
          }
        ]} 
      />

      {/* Floating Golden Particles around logo */}
      <Animated.View
        style={[
          styles.particle,
          { top: 20, left: width / 2 - 50 },
          {
            opacity: p1Anim,
            transform: [
              { translateY: p1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
              { scale: p1Anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 1.2, 0.6] }) }
            ]
          }
        ]}
      >
        <Sparkles color={accentColor} size={12} />
      </Animated.View>

      <Animated.View
        style={[
          styles.particle,
          { top: 28, right: width / 2 - 55 },
          {
            opacity: p2Anim,
            transform: [
              { translateY: p2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) },
              { scale: p2Anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1.1, 0.5] }) }
            ]
          }
        ]}
      >
        <Star color={textColor} size={10} />
      </Animated.View>

      <Animated.View
        style={[
          styles.particle,
          { top: 60, left: width / 2 - 65 },
          {
            opacity: p3Anim,
            transform: [
              { translateY: p3Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 8] }) },
              { scale: p3Anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.7, 1.3, 0.7] }) }
            ]
          }
        ]}
      >
        <Star color={accentColor} size={9} />
      </Animated.View>

      <Animated.View
        style={[
          styles.particle,
          { top: 65, right: width / 2 - 60 },
          {
            opacity: p4Anim,
            transform: [
              { translateY: p4Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] }) },
              { scale: p4Anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1.2, 0.5] }) }
            ]
          }
        ]}
      >
        <Sparkles color={accentColor} size={11} />
      </Animated.View>

      {/* Main Logo Wrapper with float and scale */}
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            transform: [
              { translateY: floatAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        {/* Rotating outer thin gold mandala ring */}
        <Animated.View style={[styles.mandalaOuterRing, { borderColor: isDark ? 'rgba(212, 175, 55, 0.7)' : 'rgba(0, 0, 0, 0.3)', transform: [{ rotate: spin }] }]}>
          <View style={[styles.mandalaNotchTop, { backgroundColor: textColor }]} />
          <View style={[styles.mandalaNotchBottom, { backgroundColor: textColor }]} />
          <View style={[styles.mandalaNotchLeft, { backgroundColor: textColor }]} />
          <View style={[styles.mandalaNotchRight, { backgroundColor: textColor }]} />
        </Animated.View>

        {/* Counter-rotating inner mandala detail ring */}
        <Animated.View style={[styles.mandalaInnerRing, { borderColor: isDark ? 'rgba(255, 153, 51, 0.5)' : 'rgba(0, 0, 0, 0.25)', transform: [{ rotate: counterSpin }] }]} />

        {/* Center Golden Aura Circle */}
        <Animated.View style={[styles.goldenAura, { opacity: glowAnim }]} />

        {/* Centered Panchang Sacred Emblem Logo */}
        <View style={[styles.sacredEmblemCenter, { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.25)', borderColor: textColor }]}>
          <Sun color={textColor} size={28} strokeWidth={2.2} />
        </View>
      </Animated.View>

      {/* Brand Name & Subtitle Section */}
      <View style={styles.brandTextContainer}>
        <Typography 
          variant="subtitle" 
          weight="bold" 
          style={[styles.brandTitle, { color: textColor }]}
        >
          Vedic Panchang
        </Typography>
        <Typography 
          variant="caption" 
          style={[styles.brandSubtitle, { color: subTextColor }]}
        >
          Daily Divine Astrological Almanac
        </Typography>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 175,
    width: '100%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingBottom: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  cosmicGlowBack: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  particle: {
    position: 'absolute',
    zIndex: 2,
  },
  logoWrapper: {
    width: 76,
    height: 76,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mandalaOuterRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mandalaNotchTop: {
    position: 'absolute',
    top: -4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  mandalaNotchBottom: {
    position: 'absolute',
    bottom: -4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  mandalaNotchLeft: {
    position: 'absolute',
    left: -4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  mandalaNotchRight: {
    position: 'absolute',
    right: -4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  mandalaInnerRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
  },
  goldenAura: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
  },
  sacredEmblemCenter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  brandTextContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  brandTitle: {
    fontSize: 17,
    letterSpacing: 1.1,
    fontWeight: '700',
  },
  brandSubtitle: {
    fontSize: 11,
    letterSpacing: 0.4,
    marginTop: 2,
    fontWeight: '500',
  },
});

