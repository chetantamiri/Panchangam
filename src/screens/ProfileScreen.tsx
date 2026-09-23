import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/Typography';
import { PremiumCard } from '../components/PremiumCard';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User, Mail, Phone, Lock, Edit3, Save, X,
  Eye, EyeOff, Shield, ChevronRight, CheckCircle,
  Key, Users, Calendar,
} from 'lucide-react-native';
import { useAuth } from '../services/AuthContext';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components defined OUTSIDE ProfileScreen so they are stable references.
// Defining them inside would cause React to unmount/remount TextInputs on every
// keystroke (because a new component type is created on every re-render),
// which closes the keyboard after each character.
// ─────────────────────────────────────────────────────────────────────────────

interface InfoRowProps {
  icon: any;
  label: string;
  value: string;
  primaryColor: string;
  borderColor: string;
}
const InfoRow: React.FC<InfoRowProps> = ({ icon: Icon, label, value, primaryColor, borderColor }) => (
  <View style={[infoStyles.row, { borderBottomColor: borderColor }]}>
    <View style={[infoStyles.iconWrapper, { backgroundColor: primaryColor + '18' }]}>
      <Icon size={16} color={primaryColor} />
    </View>
    <View style={infoStyles.content}>
      <Typography variant="caption" style={{ color: '#888', fontSize: 10, letterSpacing: 0.8 }}>{label}</Typography>
      <Typography variant="body" weight="medium">{value || '—'}</Typography>
    </View>
  </View>
);

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { marginLeft: 14, flex: 1 },
});

interface EditableRowProps {
  icon: any;
  label: string;
  value: string;
  setValue: (v: string) => void;
  editing: boolean;
  setEditing: (b: boolean) => void;
  onSave: () => void;
  saving: boolean;
  cancelValue: string;
  keyboardType?: any;
  placeholder: string;
  primaryColor: string;
  primaryGradient: string[];
  borderColor: string;
  inputBg: string;
  textColor: string;
  mutedColor: string;
}
const EditableRow: React.FC<EditableRowProps> = ({
  icon: Icon, label, value, setValue, editing, setEditing,
  onSave, saving, cancelValue, keyboardType, placeholder,
  primaryColor, primaryGradient, borderColor, inputBg, textColor, mutedColor,
}) => (
  <View style={[editableStyles.container, { borderColor }]}>
    <View style={editableStyles.header}>
      <View style={editableStyles.left}>
        <View style={[editableStyles.iconWrapper, { backgroundColor: primaryColor + '18' }]}>
          <Icon size={16} color={primaryColor} />
        </View>
        <Typography variant="caption" style={{ color: mutedColor, fontSize: 10, letterSpacing: 0.8, marginLeft: 10 }}>
          {label}
        </Typography>
      </View>
      {!editing && (
        <TouchableOpacity
          style={[editableStyles.editBtn, { backgroundColor: primaryColor + '18' }]}
          onPress={() => setEditing(true)}
          activeOpacity={0.7}
        >
          <Edit3 size={14} color={primaryColor} />
          <Typography variant="caption" weight="semibold" style={{ color: primaryColor, marginLeft: 4 }}>Edit</Typography>
        </TouchableOpacity>
      )}
    </View>

    {editing ? (
      <View style={editableStyles.inputArea}>
        <View style={[editableStyles.inputWrapper, { borderColor, backgroundColor: inputBg }]}>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor={mutedColor + '70'}
            keyboardType={keyboardType || 'default'}
            style={[editableStyles.input, { color: textColor }]}
            autoFocus
          />
        </View>
        <View style={editableStyles.actions}>
          <TouchableOpacity
            style={[editableStyles.cancelBtn, { borderColor }]}
            onPress={() => { setValue(cancelValue); setEditing(false); }}
            activeOpacity={0.7}
          >
            <X size={14} color={mutedColor} />
            <Typography variant="caption" style={{ marginLeft: 4, color: mutedColor }}>Cancel</Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={editableStyles.saveBtn}
            onPress={onSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={primaryGradient as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={editableStyles.saveBtnGradient}
            >
              {saving ? <ActivityIndicator size="small" color="#000" /> : (
                <>
                  <Save size={14} color="#000" />
                  <Typography variant="caption" weight="bold" style={{ color: '#000', marginLeft: 4 }}>Save</Typography>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    ) : (
      <Typography variant="body" weight="medium" style={{ marginTop: 6, marginLeft: 42 }}>
        {cancelValue || '—'}
      </Typography>
    )}
  </View>
);

const editableStyles = StyleSheet.create({
  container: { borderWidth: 1, borderRadius: 14, padding: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  editBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  inputArea: { marginTop: 12 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, height: 50, paddingHorizontal: 14 },
  input: { flex: 1, fontSize: 15 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: 10, paddingVertical: 10 },
  saveBtn: { flex: 2, borderRadius: 10, overflow: 'hidden' },
  saveBtnGradient: { height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});

// ─────────────────────────────────────────────────────────────────────────────
// Main ProfileScreen
// ─────────────────────────────────────────────────────────────────────────────
export const ProfileScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { userProfile, user, updateProfile, updatePassword, logout } = useAuth();

  const [editingName, setEditingName] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [nameValue, setNameValue] = useState(userProfile?.displayName || '');
  const [phoneValue, setPhoneValue] = useState(userProfile?.phoneNumber || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [savingName, setSavingName] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : colors.border;
  const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';
  const textColor  = colors.text;
  const mutedColor = colors.textSecondary;
  const primaryGradient = (colors.primaryGradient || ['#D4AF37', '#FF9933']) as string[];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved': return '#22C55E';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      case 'suspended': return '#8B5CF6';
      default: return mutedColor;
    }
  };
  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'approved': return 'Active & Approved';
      case 'pending': return 'Pending Approval';
      case 'rejected': return 'Access Rejected';
      case 'suspended': return 'Suspended';
      default: return 'Unknown';
    }
  };

  const handleSaveName = async () => {
    if (!nameValue.trim()) { Alert.alert('Error', 'Name cannot be empty.'); return; }
    setSavingName(true);
    try {
      await updateProfile({ displayName: nameValue.trim() });
      setEditingName(false);
      Alert.alert('Success', 'Name updated successfully.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update name.');
    } finally { setSavingName(false); }
  };

  const handleSavePhone = async () => {
    if (!phoneValue.trim()) { Alert.alert('Error', 'Phone number cannot be empty.'); return; }
    setSavingPhone(true);
    try {
      await updateProfile({ phoneNumber: phoneValue.trim() });
      setEditingPhone(false);
      Alert.alert('Success', 'Phone number updated successfully.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update phone number.');
    } finally { setSavingPhone(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Missing Fields', 'Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Mismatch', 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Weak Password', 'New password must be at least 6 characters.');
      return;
    }
    setSavingPassword(true);
    try {
      await updatePassword(currentPassword, newPassword);
      setChangingPassword(false);
      setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
      Alert.alert('Success', 'Password changed successfully.');
    } catch (e: any) {
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        Alert.alert('Wrong Password', 'Current password is incorrect.');
      } else {
        Alert.alert('Error', e.message || 'Failed to change password.');
      }
    } finally { setSavingPassword(false); }
  };

  const isAdmin   = userProfile?.role === 'admin';
  const initials  = userProfile?.displayName
    ? userProfile.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const statusColor = getStatusColor(userProfile?.status);

  const sharedEditProps = { primaryColor: colors.primary, primaryGradient, borderColor, inputBg, textColor, mutedColor };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Vedic Panchangam"
        subtitle="My Profile"
        showThemeToggle={false}
        onBackPress={navigation?.canGoBack() ? () => navigation.goBack() : undefined}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Hero Banner */}
          <LinearGradient
            colors={isDark ? ['rgba(212,175,55,0.12)', 'transparent'] : ['rgba(212,175,55,0.08)', 'transparent']}
            style={styles.heroBanner}
          >
            <View style={[styles.avatarCircle, { borderColor: colors.primary, backgroundColor: colors.primary + '18' }]}>
              <Typography variant="title" weight="bold" style={{ color: colors.primary, fontSize: 30 }}>{initials}</Typography>
            </View>
            <Typography variant="subtitle" weight="bold" style={{ marginTop: 14 }}>
              {userProfile?.displayName || 'User'}
            </Typography>
            <Typography variant="caption" color="muted" style={{ marginTop: 4 }}>
              {userProfile?.email}
            </Typography>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '40' }]}>
                <Shield size={11} color={colors.primary} />
                <Typography variant="caption" weight="bold" style={{ color: colors.primary, marginLeft: 4, fontSize: 10 }}>
                  {isAdmin ? 'ADMINISTRATOR' : 'USER'}
                </Typography>
              </View>
              <View style={[styles.badge, { backgroundColor: statusColor + '18', borderColor: statusColor + '40' }]}>
                <CheckCircle size={11} color={statusColor} />
                <Typography variant="caption" weight="bold" style={{ color: statusColor, marginLeft: 4, fontSize: 10 }}>
                  {getStatusLabel(userProfile?.status)}
                </Typography>
              </View>
            </View>
          </LinearGradient>

          {/* Admin: Manage Users */}
          {isAdmin && (
            <PremiumCard style={styles.card}>
              <Typography variant="body" weight="bold" style={{ marginBottom: 14, color: colors.primary }}>Admin Tools</Typography>
              <TouchableOpacity
                style={[styles.adminLink, { borderColor, backgroundColor: colors.primary + '08' }]}
                onPress={() => navigation?.navigate('UserManagement')}
                activeOpacity={0.7}
              >
                <View style={[editableStyles.iconWrapper, { backgroundColor: colors.primary + '20' }]}>
                  <Users size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Typography variant="body" weight="semibold">Manage Users</Typography>
                  <Typography variant="caption" color="muted">Approve, reject, or suspend user accounts</Typography>
                </View>
                <ChevronRight size={18} color={mutedColor} />
              </TouchableOpacity>
            </PremiumCard>
          )}

          {/* Non-editable info */}
          <PremiumCard style={styles.card}>
            <Typography variant="body" weight="bold" style={{ marginBottom: 14, color: colors.primary }}>Account Information</Typography>
            <InfoRow icon={Mail} label="EMAIL ADDRESS" value={userProfile?.email || ''} primaryColor={colors.primary} borderColor={borderColor} />
            <InfoRow
              icon={Calendar}
              label="MEMBER SINCE"
              value={userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
              primaryColor={colors.primary}
              borderColor={borderColor}
            />
          </PremiumCard>

          {/* Editable info */}
          <PremiumCard style={styles.card}>
            <Typography variant="body" weight="bold" style={{ marginBottom: 14, color: colors.primary }}>Edit Profile</Typography>

            <EditableRow
              icon={User}
              label="FULL NAME"
              value={nameValue}
              setValue={setNameValue}
              editing={editingName}
              setEditing={setEditingName}
              onSave={handleSaveName}
              saving={savingName}
              cancelValue={userProfile?.displayName || ''}
              placeholder="Enter your full name"
              {...sharedEditProps}
            />

            <View style={{ height: 16 }} />

            <EditableRow
              icon={Phone}
              label="PHONE NUMBER"
              value={phoneValue}
              setValue={setPhoneValue}
              editing={editingPhone}
              setEditing={setEditingPhone}
              onSave={handleSavePhone}
              saving={savingPhone}
              cancelValue={userProfile?.phoneNumber || ''}
              keyboardType="phone-pad"
              placeholder="+91 9876543210"
              {...sharedEditProps}
            />
          </PremiumCard>

          {/* Change Password */}
          <PremiumCard style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[editableStyles.iconWrapper, { backgroundColor: colors.primary + '18' }]}>
                  <Key size={16} color={colors.primary} />
                </View>
                <Typography variant="body" weight="bold" style={{ marginLeft: 10, color: colors.primary }}>Change Password</Typography>
              </View>
              {!changingPassword && (
                <TouchableOpacity
                  style={[editableStyles.editBtn, { backgroundColor: colors.primary + '18' }]}
                  onPress={() => setChangingPassword(true)}
                  activeOpacity={0.7}
                >
                  <Edit3 size={14} color={colors.primary} />
                  <Typography variant="caption" weight="semibold" style={{ color: colors.primary, marginLeft: 4 }}>Change</Typography>
                </TouchableOpacity>
              )}
            </View>

            {changingPassword && (
              <View style={{ marginTop: 14 }}>
                {([
                  { label: 'CURRENT PASSWORD', value: currentPassword, setter: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(s => !s) },
                  { label: 'NEW PASSWORD',      value: newPassword,     setter: setNewPassword,     show: showNew,     toggle: () => setShowNew(s => !s) },
                  { label: 'CONFIRM NEW PASSWORD', value: confirmNewPassword, setter: setConfirmNewPassword, show: showConfirm, toggle: () => setShowConfirm(s => !s) },
                ] as const).map(({ label, value, setter, show, toggle }, idx) => (
                  <View key={idx} style={{ marginBottom: 14 }}>
                    <Typography variant="caption" style={{ color: mutedColor, fontSize: 10, letterSpacing: 0.8, marginBottom: 7 }}>
                      {label}
                    </Typography>
                    <View style={[editableStyles.inputWrapper, { borderColor, backgroundColor: inputBg }]}>
                      <Lock size={16} color={mutedColor} style={{ marginRight: 12 }} />
                      <TextInput
                        value={value}
                        onChangeText={setter}
                        placeholder="••••••••"
                        placeholderTextColor={mutedColor + '70'}
                        secureTextEntry={!show}
                        autoCapitalize="none"
                        style={[editableStyles.input, { color: textColor }]}
                      />
                      <TouchableOpacity onPress={toggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        {show ? <EyeOff size={16} color={mutedColor} /> : <Eye size={16} color={mutedColor} />}
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                <View style={editableStyles.actions}>
                  <TouchableOpacity
                    style={[editableStyles.cancelBtn, { borderColor }]}
                    onPress={() => {
                      setChangingPassword(false);
                      setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
                    }}
                    activeOpacity={0.7}
                  >
                    <X size={14} color={mutedColor} />
                    <Typography variant="caption" style={{ marginLeft: 4, color: mutedColor }}>Cancel</Typography>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={editableStyles.saveBtn}
                    onPress={handleChangePassword}
                    disabled={savingPassword}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={primaryGradient as [string, string, ...string[]]}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={editableStyles.saveBtnGradient}
                    >
                      {savingPassword ? <ActivityIndicator size="small" color="#000" /> : (
                        <>
                          <Save size={14} color="#000" />
                          <Typography variant="caption" weight="bold" style={{ color: '#000', marginLeft: 4 }}>Update Password</Typography>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </PremiumCard>

          {/* Logout */}
          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: isDark ? '#1E1520' : '#FEE2E2', borderColor: '#EF444430' }]}
            onPress={() => Alert.alert('Log Out', 'Are you sure you want to log out?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Log Out', style: 'destructive', onPress: logout },
            ])}
            activeOpacity={0.8}
          >
            <Typography variant="body" weight="bold" style={{ color: '#EF4444' }}>Log Out</Typography>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 30 },
  heroBanner: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, borderWidth: 2.5, justifyContent: 'center', alignItems: 'center' },
  badgeRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  card: { marginHorizontal: 20, marginTop: 16, padding: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  adminLink: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1 },
  logoutBtn: { marginHorizontal: 20, marginTop: 20, paddingVertical: 16, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
});
