import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from './Typography';
import { ArrowRight, ChevronRight } from 'lucide-react-native';

interface CarouselItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  gradient: string[];
  accentColor: string;
  icon: any;
  navTarget: string;
  ctaText: string;
}

interface Props {
  item: CarouselItem;
  cardWidth: number;
  onPress: () => void;
}

export const HomeCarouselCard: React.FC<Props> = ({ item, cardWidth, onPress }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const IconComp = item.icon;

  useEffect(() => {
    // 1. Slow background icon rotation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 18000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 2. Subtle pulse for the accent glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={[styles.cardContainer, { width: cardWidth }]}
    >
      <LinearGradient
        colors={item.gradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCard}
      >
        {/* Background Sacred Geometric Mandala / Aura Glow */}
        <Animated.View
          style={[
            styles.bgGlowCircle,
            {
              backgroundColor: item.accentColor || 'rgba(255,255,255,0.15)',
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />

        {/* Large Decorative Animated Watermark Emblem */}
        <Animated.View
          style={[
            styles.bgIconWrapper,
            { transform: [{ rotate: spin }] },
          ]}
        >
          <IconComp color="rgba(255, 255, 255, 0.16)" size={120} strokeWidth={1.2} />
        </Animated.View>

        {/* Card Header: Glassmorphism Tag & Icon Badge */}
        <View style={styles.cardHeader}>
          <View style={styles.glassTag}>
            <View style={[styles.statusDot, { backgroundColor: item.accentColor || '#D4AF37' }]} />
            <Typography variant="caption" weight="bold" style={styles.tagText}>
              {item.tag}
            </Typography>
          </View>

          <View style={styles.iconCircleBadge}>
            <IconComp color="#FFFFFF" size={20} strokeWidth={2.2} />
          </View>
        </View>

        {/* Card Body: Title, Subtitle, and Sleek CTA Button */}
        <View style={styles.cardBody}>
          <Typography variant="title" weight="bold" style={styles.cardTitle}>
            {item.title}
          </Typography>
          
          <Typography variant="caption" style={styles.cardSubtitle} numberOfLines={1}>
            {item.subtitle}
          </Typography>

          <View style={styles.ctaRow}>
            <View style={styles.ctaButton}>
              <Typography variant="caption" weight="bold" style={styles.ctaText}>
                {item.ctaText || 'Explore Now'}
              </Typography>
              <ArrowRight color="#FFFFFF" size={14} style={{ marginLeft: 6 }} />
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    height: 175,
    marginRight: 16,
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
  },
  gradientCard: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  bgGlowCircle: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 170,
    height: 170,
    borderRadius: 85,
    opacity: 0.25,
  },
  bgIconWrapper: {
    position: 'absolute',
    top: -20,
    right: -20,
    zIndex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  glassTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.32)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  iconCircleBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    marginTop: 'auto',
    zIndex: 2,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginTop: 3,
    fontWeight: '500',
  },
  ctaRow: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
