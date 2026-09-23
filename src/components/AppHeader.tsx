import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from './Typography';
import { Menu, Moon, Sun, ChevronLeft } from 'lucide-react-native';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onMenuPress?: () => void;
  showThemeToggle?: boolean;
  onBackPress?: () => void;
  rightIcon?: any;
  onRightPress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  onMenuPress,
  showThemeToggle = true,
  onBackPress,
  rightIcon,
  onRightPress,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();

  const textColor = colors.onPrimary || (isDark ? '#FFFFFF' : '#000000');
  const subTextColor = colors.onPrimary === '#FFFFFF' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.75)';
  const iconBgColor = colors.onPrimary === '#FFFFFF' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.12)';

  return (
    <View 
      style={[
        styles.headerContainer,
        {
          paddingTop: Math.max(insets.top, 16) + 10,
          backgroundColor: colors.primary,
          borderBottomColor: 'rgba(0, 0, 0, 0.1)',
        }
      ]}
    >
      <View style={styles.contentRow}>
        {onBackPress && (
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: iconBgColor }]} 
            onPress={onBackPress}
            activeOpacity={0.7}
          >
            <ChevronLeft color={textColor} size={22} />
          </TouchableOpacity>
        )}

        <View style={styles.titleContainer}>
          <Typography 
            variant="display" 
            style={[styles.titleText, { color: textColor }]}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography 
              variant="caption" 
              style={[styles.subtitleText, { color: subTextColor }]}
            >
              {subtitle}
            </Typography>
          )}
        </View>

        <View style={styles.actionRow}>
          {rightIcon && onRightPress && (
            <TouchableOpacity 
              style={[styles.iconButton, { marginRight: 10, backgroundColor: iconBgColor }]} 
              onPress={onRightPress}
              activeOpacity={0.7}
            >
              {React.createElement(rightIcon, { color: textColor, size: 20 })}
            </TouchableOpacity>
          )}

          {showThemeToggle && (
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: iconBgColor }]} 
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              {isDark ? (
                <Moon color={textColor} size={20} />
              ) : (
                <Sun color={textColor} size={20} />
              )}
            </TouchableOpacity>
          )}

          {onMenuPress && (
            <TouchableOpacity 
              style={[styles.iconButton, { marginLeft: 10, backgroundColor: iconBgColor }]} 
              onPress={onMenuPress}
              activeOpacity={0.7}
            >
              <Menu color={textColor} size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomWidth: 1,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000', // Crisp black text on gold primary background
  },
  subtitleText: {
    color: 'rgba(0, 0, 0, 0.75)',
    marginTop: 2,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
});
