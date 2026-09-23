import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  ScrollView
} from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/Typography';
import { PremiumCard } from '../components/PremiumCard';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, ShieldAlert, XCircle, LogOut, RefreshCw } from 'lucide-react-native';
import { useAuth } from '../services/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export const StatusScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { userProfile, logout, user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const status = userProfile?.status || 'pending';

  const handleRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      // Force fetch the document to make sure it's up to date
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status === 'approved') {
          Alert.alert('Status Updated', 'Your account has been approved! Enjoy the application.');
        } else {
          Alert.alert('Status Check', `Your current account status is still: ${data.status}`);
        }
      } else {
        Alert.alert('Error', 'User profile not found in database. Please contact support.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to check status. Please check your connection.');
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case 'rejected':
        return {
          icon: <XCircle color="#EF4444" size={56} />,
          title: 'Access Rejected',
          color: '#EF4444',
          description: 'Your registration request has been rejected by the administrator. If you believe this was a mistake, please contact support.',
        };
      case 'suspended':
        return {
          icon: <ShieldAlert color="#F59E0B" size={56} />,
          title: 'Account Suspended',
          color: '#F59E0B',
          description: 'Your account has been suspended by the administrator. You will not be able to access the almanac calculations during this time.',
        };
      case 'pending':
      default:
        return {
          icon: <Clock color={colors.primary} size={56} />,
          title: 'Approval Pending',
          color: colors.primary,
          description: 'Your registration is currently under review by the administrator. Once approved, you will get complete access automatically.',
        };
    }
  };

  const content = getStatusContent();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader 
        title="Vedic Panchangam" 
        subtitle="Account Verification Status"
        showThemeToggle={true}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={isDark ? ['rgba(212, 175, 55, 0.08)', 'transparent'] : ['rgba(255, 153, 51, 0.08)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
        <PremiumCard style={styles.card}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: content.color + '15' }]}>
              {content.icon}
            </View>
            <Typography variant="title" style={styles.title}>
              {content.title}
            </Typography>
          </View>

          <Typography variant="body" color="muted" style={styles.description}>
            {content.description}
          </Typography>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.btn, styles.refreshBtn, { borderColor: colors.primary }]}
              onPress={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <>
                  <RefreshCw size={16} color={colors.primary} style={styles.btnIcon} />
                  <Typography variant="body" weight="semibold" style={{ color: colors.primary }}>
                    Check Status
                  </Typography>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btn, styles.logoutBtn, { backgroundColor: isDark ? '#1E1E26' : '#E2E8F0' }]}
              onPress={logout}
            >
              <LogOut size={16} color={colors.text} style={styles.btnIcon} />
              <Typography variant="body" weight="semibold" style={{ color: colors.text }}>
                Sign Out
              </Typography>
            </TouchableOpacity>
          </View>
        </PremiumCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  card: {
    padding: 30,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  btn: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshBtn: {
    borderWidth: 1,
  },
  logoutBtn: {},
  btnIcon: {
    marginRight: 8,
  },
});
