import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface StyledTextProps extends TextProps {
  variant?: 'display' | 'title' | 'subtitle' | 'body' | 'caption';
  color?: 'primary' | 'secondary' | 'default' | 'muted';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
}

export const Typography: React.FC<StyledTextProps> = ({ 
  variant = 'body', 
  color = 'default', 
  weight,
  style, 
  children, 
  ...props 
}) => {
  const { colors, typography } = useTheme();

  const getFontSize = () => {
    switch (variant) {
      case 'display': return typography.sizes.display; // 40
      case 'title': return typography.sizes.xxl; // 24
      case 'subtitle': return typography.sizes.lg; // 18
      case 'body': return typography.sizes.md; // 16
      case 'caption': return typography.sizes.sm; // 14
      default: return typography.sizes.md;
    }
  };

  const getFontColor = () => {
    switch (color) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.secondary;
      case 'muted': return colors.textSecondary;
      case 'default':
      default: return colors.text;
    }
  };

  const getFontWeight = () => {
    if (weight) return typography.weights[weight];
    switch (variant) {
      case 'display':
      case 'title': return typography.weights.bold;
      case 'subtitle': return typography.weights.semibold;
      case 'body':
      case 'caption': return typography.weights.regular;
      default: return typography.weights.regular;
    }
  };

  return (
    <Text
      style={[
        {
          fontSize: getFontSize(),
          color: getFontColor(),
          // Use Plus Jakarta Sans for Display/Title, DM Sans for others
          fontFamily: (variant === 'display' || variant === 'title' || variant === 'subtitle') 
              ? typography.fontFamily.title 
              : typography.fontFamily.secondary,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
