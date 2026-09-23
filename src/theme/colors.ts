export const colors = {
  light: {
    background: '#F1F5F9', // Soft light slate gray background so pure white cards pop
    surface: '#FFFFFF', // Pure White surface for cards
    surfaceVariant: '#E2E8F0', // Crisp slate gray background for chips & inputs
    primary: '#D4AF37', // Signature Gold (Same in Light & Dark Mode)
    primaryGradient: ['#D4AF37', '#FF9933'],
    secondary: '#FF9933', // Signature Saffron
    accent: '#FF9933',
    text: '#0F172A', // Slate-900 ultra dark text
    textSecondary: '#475569', // Slate-600 clear secondary text
    border: '#CBD5E1', // Slate-300 crisp border for cards
    cardShadow: 'rgba(15, 23, 42, 0.12)',
    onPrimary: '#000000',
  },
  dark: {
    background: '#000000', // Pure OLED Black
    surface: '#111111', // Cards
    surfaceVariant: '#1B1B1B', // Inputs, chips
    primary: '#D4AF37', // Premium Gold
    primaryGradient: ['#D4AF37', '#F4C542'],
    secondary: '#FF9933', // Temple Saffron
    accent: '#E53935', // Crimson Accent
    text: '#FFFFFF', // White
    textSecondary: '#A1A1AA', // Soft Gray
    border: '#2A2A2A', // Card borders
    cardShadow: 'rgba(0,0,0,0.85)',
    onPrimary: '#000000',
  },
  crimsonLight: {
    background: '#F8FAFC', // Clean modern white/slate background
    surface: '#FFFFFF', // Pure white cards
    surfaceVariant: '#F1F5F9', // Inputs, chips, secondary areas
    primary: '#890303', // Royal Crimson Red
    primaryGradient: ['#890303', '#D4AF37'], // Crimson to Gold
    secondary: '#D4AF37', // Antique Gold
    accent: '#FF9933', // Temple Saffron
    text: '#1E293B', // Dark Slate
    textSecondary: '#64748B', // Slate Grey
    border: '#E2E8F0', // Soft Grey
    cardShadow: 'rgba(122, 17, 36, 0.12)',
    onPrimary: '#FFFFFF',
  },
};

export type ThemeMode = keyof typeof colors;
export type ThemeColors = typeof colors.light;




