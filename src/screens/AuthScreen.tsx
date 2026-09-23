import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/Typography';
import { PremiumCard } from '../components/PremiumCard';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, User, Sparkles, Shield, Flame, Phone, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../services/AuthContext';
import { AppHeader } from '../components/AppHeader';

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: AuthInputField is defined OUTSIDE AuthScreen so React never
// sees a new component type on re-render, which would unmount TextInputs
// and close the keyboard after every keystroke.
// ─────────────────────────────────────────────────────────────────────────────
interface AuthInputFieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  icon: any;
  keyboardType?: any;
  autoCapitalize?: any;
  secureTextEntry?: boolean;
  showToggle?: boolean;
  onToggle?: () => void;
  borderColor: string;
  inputBg: string;
  textColor: string;
  mutedColor: string;
}

const AuthInputField: React.FC<AuthInputFieldProps> = ({
  label, value, onChangeText, placeholder, icon: Icon,
  keyboardType, autoCapitalize, secureTextEntry,
  showToggle, onToggle,
  borderColor, inputBg, textColor, mutedColor,
}) => (
  <View style={styles.inputGroup}>
    <Typography variant="caption" weight="semibold" style={[styles.label, { color: mutedColor }]}>
      {label}
    </Typography>
    <View style={[styles.inputWrapper, { borderColor, backgroundColor: inputBg }]}>
      <Icon size={18} color={mutedColor} style={styles.inputIcon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={mutedColor + '90'}
        keyboardType={keyboardType || 'default'}
        autoCapitalize={autoCapitalize || 'sentences'}
        secureTextEntry={secureTextEntry}
        style={[styles.input, { color: textColor }]}
      />
      {showToggle !== undefined && onToggle && (
        <TouchableOpacity onPress={onToggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          {showToggle
            ? <EyeOff size={18} color={mutedColor} />
            : <Eye size={18} color={mutedColor} />}
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main AuthScreen
// ─────────────────────────────────────────────────────────────────────────────
export const AuthScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : colors.border;
  const inputBg   = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';
  const textColor  = colors.text;
  const mutedColor = colors.textSecondary;

  const handleAuth = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    if (!isLogin) {
      if (!displayName.trim()) {
        Alert.alert('Missing Name', 'Please enter your full name.');
        return;
      }
      if (!phoneNumber.trim()) {
        Alert.alert('Missing Phone', 'Please enter your phone number.');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Password Mismatch', 'Passwords do not match. Please re-enter.');
        return;
      }
      if (password.length < 6) {
        Alert.alert('Weak Password', 'Password must be at least 6 characters.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password, displayName.trim(), phoneNumber.trim());
        Alert.alert(
          'Registration Submitted',
          'Your account has been created and is pending admin approval. You will be notified once approved.',
        );
      }
    } catch (error: any) {
      let errorMsg = 'An error occurred during authentication.';
      if (error.code === 'auth/account-deleted')         errorMsg = error.message;
      else if (error.code === 'auth/email-already-in-use') errorMsg = 'This email is already registered. If your account was deleted, please sign in with your old password first to clear it, then register again.';
      else if (error.code === 'auth/invalid-email')      errorMsg = 'Please enter a valid email address.';
      else if (error.code === 'auth/weak-password')      errorMsg = 'Password should be at least 6 characters.';
      else if (error.code === 'auth/invalid-credential') errorMsg = 'Invalid email or password. Please try again.';
      else if (error.message)                            errorMsg = error.message;
      Alert.alert('Authentication Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (login: boolean) => {
    setIsLogin(login);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setPhoneNumber('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const fieldProps = { borderColor, inputBg, textColor, mutedColor };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Vedic Panchangam"
        subtitle="Authentication & Sign In"
        showThemeToggle={true}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Decorative header */}
          <View style={styles.headerDecorative}>
            <View style={[styles.iconContainer, { borderColor: colors.primary }]}>
              <Flame color={colors.primary} size={36} />
            </View>
            <Typography variant="body" color="muted" style={styles.subtitle}>
              {isLogin
                ? 'Enter your credentials to access the sacred calendar'
                : 'Create your account to access Vedic astrology calculations'}
            </Typography>
          </View>

          {/* Card */}
          <PremiumCard style={styles.card}>
            {/* Tabs */}
            <View style={[styles.tabs, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]}>
              <TouchableOpacity
                style={[styles.tab, isLogin && [styles.activeTab, { backgroundColor: colors.primary }]]}
                onPress={() => switchTab(true)}
              >
                <Typography variant="caption" weight="bold"
                  style={{ color: isLogin ? '#000000' : colors.textSecondary }}>
                  SIGN IN
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, !isLogin && [styles.activeTab, { backgroundColor: colors.primary }]]}
                onPress={() => switchTab(false)}
              >
                <Typography variant="caption" weight="bold"
                  style={{ color: !isLogin ? '#000000' : colors.textSecondary }}>
                  CREATE ACCOUNT
                </Typography>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {!isLogin && (
                <AuthInputField
                  label="FULL NAME"
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Enter your full name"
                  icon={User}
                  {...fieldProps}
                />
              )}

              <AuthInputField
                label="EMAIL ADDRESS"
                value={email}
                onChangeText={setEmail}
                placeholder="name@domain.com"
                icon={Mail}
                keyboardType="email-address"
                autoCapitalize="none"
                {...fieldProps}
              />

              {!isLogin && (
                <AuthInputField
                  label="PHONE NUMBER"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="+91 9876543210"
                  icon={Phone}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  {...fieldProps}
                />
              )}

              <AuthInputField
                label="PASSWORD"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                icon={Lock}
                autoCapitalize="none"
                secureTextEntry={!showPassword}
                showToggle={showPassword}
                onToggle={() => setShowPassword(p => !p)}
                {...fieldProps}
              />

              {!isLogin && (
                <AuthInputField
                  label="CONFIRM PASSWORD"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  icon={Lock}
                  autoCapitalize="none"
                  secureTextEntry={!showConfirmPassword}
                  showToggle={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword(p => !p)}
                  {...fieldProps}
                />
              )}

              <TouchableOpacity
                style={[styles.actionBtn, { opacity: loading ? 0.7 : 1 }]}
                onPress={handleAuth}
                disabled={loading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={(colors.primaryGradient || ['#D4AF37', '#FF9933']) as [string, string, ...string[]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientBtn}
                >
                  {loading ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <View style={styles.btnContent}>
                      <Typography variant="body" weight="bold" style={styles.btnText}>
                        {isLogin ? 'Sign In Now' : 'Create Account'}
                      </Typography>
                      <Sparkles size={16} color="#000" style={styles.btnIcon} />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </PremiumCard>

          {/* Approval note */}
          {!isLogin && (
            <View style={styles.infoBox}>
              <Shield size={16} color={colors.primary} style={styles.infoIcon} />
              <Typography variant="caption" color="muted" style={styles.infoText}>
                New accounts require admin approval before access is granted. You'll be notified once your account is reviewed.
              </Typography>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  headerDecorative: { alignItems: 'center', marginBottom: 28 },
  iconContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  subtitle: { textAlign: 'center', paddingHorizontal: 30, lineHeight: 20 },
  card: { width: '100%', padding: 24 },
  tabs: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  form: { width: '100%' },
  inputGroup: { marginBottom: 18 },
  label: { marginBottom: 7, letterSpacing: 1, fontSize: 10 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, height: '100%' },
  actionBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 12 },
  gradientBtn: { height: 54, justifyContent: 'center', alignItems: 'center' },
  btnContent: { flexDirection: 'row', alignItems: 'center' },
  btnText: { color: '#000000' },
  btnIcon: { marginLeft: 8 },
  infoBox: {
    flexDirection: 'row',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'flex-start',
  },
  infoIcon: { marginRight: 10, marginTop: 2 },
  infoText: { flex: 1, lineHeight: 16 },
});
