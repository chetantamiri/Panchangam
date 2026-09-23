import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface PremiumCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  noPadding?: boolean;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({ children, style, noPadding }) => {
  const { colors, layout, isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: 24,
          padding: noPadding ? 0 : layout.padding.card,
          shadowColor: isDark ? '#000000' : colors.cardShadow,
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border,
          borderWidth: 1,
        },
        isDark ? styles.darkShadow : styles.lightShadow,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    elevation: 3,
  },
  lightShadow: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  darkShadow: {
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  }
});
