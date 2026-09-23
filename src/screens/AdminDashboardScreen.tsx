import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  ScrollView,
  Platform
} from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/Typography';
import { PremiumCard } from '../components/PremiumCard';
import { useAuth, UserProfile } from '../services/AuthContext';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { LogOut, UserCheck, UserX, Trash2, ShieldAlert, Users, Clock, CheckCircle, RefreshCw } from 'lucide-react-native';

type TabType = 'pending' | 'approved' | 'restricted';

export const AdminDashboardScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { logout, userProfile: adminProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  useEffect(() => {
    // Listen to all users in real-time
    const usersCollection = collection(db, 'users');
    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      const usersList: UserProfile[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as UserProfile;
        // Don't include the current admin in the list of users to manage
        if (data.uid !== adminProfile?.uid) {
          usersList.push(data);
        }
      });
      // Sort users by creation time or display name
      usersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUsers(usersList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users: ", error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load users list.');
    });

    return () => unsubscribe();
  }, [adminProfile]);

  const handleUpdateStatus = async (userUid: string, name: string, newStatus: UserProfile['status']) => {
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to change ${name}'s status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Proceed', 
          onPress: async () => {
            try {
              const userRef = doc(db, 'users', userUid);
              await updateDoc(userRef, { status: newStatus });
              Alert.alert('Success', `User status updated to ${newStatus}.`);
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to update user status.');
            }
          } 
        }
      ]
    );
  };

  const handleDeleteUser = async (userUid: string, name: string) => {
    Alert.alert(
      'Delete User Profile',
      `Are you sure you want to delete ${name}'s profile? This will revoke their access completely.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const userRef = doc(db, 'users', userUid);
              await deleteDoc(userRef);
              Alert.alert('Success', 'User profile deleted successfully.');
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to delete user profile.');
            }
          } 
        }
      ]
    );
  };

  // Filter users based on active tab
  const filteredUsers = users.filter((u) => {
    if (activeTab === 'pending') return u.status === 'pending';
    if (activeTab === 'approved') return u.status === 'approved';
    if (activeTab === 'restricted') return u.status === 'rejected' || u.status === 'suspended';
    return false;
  });

  const getStatusColor = (status: UserProfile['status']) => {
    switch (status) {
      case 'approved': return '#10B981'; // Green
      case 'pending': return '#F59E0B'; // Amber
      case 'rejected': return '#EF4444'; // Red
      case 'suspended': return '#8B5CF6'; // Purple
      default: return colors.textSecondary;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const renderUserItem = ({ item }: { item: UserProfile }) => (
    <PremiumCard style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.userMeta}>
          <Typography variant="body" weight="semibold" style={styles.userName}>
            {item.displayName}
          </Typography>
          <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
            <Typography variant="caption" weight="bold" style={{ color: getStatusColor(item.status), fontSize: 10 }}>
              {item.status.toUpperCase()}
            </Typography>
          </View>
        </View>
        <Typography variant="caption" color="muted" style={styles.userEmail}>
          {item.email}
        </Typography>
        <Typography variant="caption" color="muted" style={styles.userDate}>
          Registered: {formatDate(item.createdAt)}
        </Typography>
      </View>

      <View style={[styles.actions, { borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : colors.border }]}>
        {item.status !== 'approved' && (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.approveBtn, { backgroundColor: '#10B98120' }]}
            onPress={() => handleUpdateStatus(item.uid, item.displayName, 'approved')}
          >
            <UserCheck size={16} color="#10B981" />
            <Typography variant="caption" weight="semibold" style={{ color: '#10B981', marginLeft: 4 }}>
              Approve
            </Typography>
          </TouchableOpacity>
        )}

        {item.status === 'approved' && (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.suspendBtn, { backgroundColor: '#8B5CF620' }]}
            onPress={() => handleUpdateStatus(item.uid, item.displayName, 'suspended')}
          >
            <ShieldAlert size={16} color="#8B5CF6" />
            <Typography variant="caption" weight="semibold" style={{ color: '#8B5CF6', marginLeft: 4 }}>
              Suspend
            </Typography>
          </TouchableOpacity>
        )}

        {item.status === 'pending' && (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.rejectBtn, { backgroundColor: '#EF444420' }]}
            onPress={() => handleUpdateStatus(item.uid, item.displayName, 'rejected')}
          >
            <UserX size={16} color="#EF4444" />
            <Typography variant="caption" weight="semibold" style={{ color: '#EF4444', marginLeft: 4 }}>
              Reject
            </Typography>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.actionBtn, styles.deleteBtn, { backgroundColor: isDark ? '#2D1F23' : '#FEE2E2' }]}
          onPress={() => handleDeleteUser(item.uid, item.displayName)}
        >
          <Trash2 size={16} color="#EF4444" />
          <Typography variant="caption" weight="semibold" style={{ color: '#EF4444', marginLeft: 4 }}>
            Delete
          </Typography>
        </TouchableOpacity>
      </View>
    </PremiumCard>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader 
        title="Vedic Panchangam" 
        subtitle="Admin Control Dashboard"
        showThemeToggle={true}
      />
      <View style={{ flex: 1 }}>
        <PremiumCard style={styles.adminWelcomeCard}>
          <View style={styles.adminWelcomeRow}>
            <View style={{ flex: 1 }}>
              <Typography variant="body" weight="bold">Admin Portal</Typography>
              <Typography variant="caption" color="muted">Manage user registration requests</Typography>
            </View>
            <TouchableOpacity 
              style={[styles.logoutBtn, { backgroundColor: isDark ? '#1E1E26' : '#E2E8F0' }]}
              onPress={logout}
            >
              <LogOut size={16} color={colors.text} />
              <Typography variant="caption" weight="semibold" style={{ color: colors.text, marginLeft: 6 }}>
                Sign Out
              </Typography>
            </TouchableOpacity>
          </View>
        </PremiumCard>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: isDark ? '#121212' : '#FFFFFF', borderBottomColor: isDark ? '#26262D' : colors.border }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'pending' && [styles.activeTab, { borderBottomColor: colors.primary }]]}
          onPress={() => setActiveTab('pending')}
        >
          <Clock size={16} color={activeTab === 'pending' ? colors.primary : colors.textSecondary} />
          <Typography 
            variant="caption" 
            weight="semibold" 
            style={[styles.tabText, { color: activeTab === 'pending' ? colors.primary : colors.textSecondary }]}
          >
            Pending ({users.filter(u => u.status === 'pending').length})
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'approved' && [styles.activeTab, { borderBottomColor: colors.primary }]]}
          onPress={() => setActiveTab('approved')}
        >
          <CheckCircle size={16} color={activeTab === 'approved' ? colors.primary : colors.textSecondary} />
          <Typography 
            variant="caption" 
            weight="semibold" 
            style={[styles.tabText, { color: activeTab === 'approved' ? colors.primary : colors.textSecondary }]}
          >
            Approved ({users.filter(u => u.status === 'approved').length})
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'restricted' && [styles.activeTab, { borderBottomColor: colors.primary }]]}
          onPress={() => setActiveTab('restricted')}
        >
          <Users size={16} color={activeTab === 'restricted' ? colors.primary : colors.textSecondary} />
          <Typography 
            variant="caption" 
            weight="semibold" 
            style={[styles.tabText, { color: activeTab === 'restricted' ? colors.primary : colors.textSecondary }]}
          >
            Restricted ({users.filter(u => u.status === 'rejected' || u.status === 'suspended').length})
          </Typography>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Typography variant="body" color="muted" style={{ marginTop: 10 }}>
            Fetching users database...
          </Typography>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.centered}>
          <Users size={48} color={colors.textSecondary + '60'} />
          <Typography variant="body" color="muted" style={{ marginTop: 16, textAlign: 'center', paddingHorizontal: 40 }}>
            No users found in this category.
          </Typography>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.uid}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  adminWelcomeCard: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
  },
  adminWelcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 16,
  },
  headerTitleContainer: {},
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    height: 48,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 6,
  },
  activeTab: {},
  tabText: {
    fontSize: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  userCard: {
    padding: 0,
    borderRadius: 16,
  },
  userInfo: {
    padding: 16,
  },
  userMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  userName: {
    fontSize: 16,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  userEmail: {
    marginBottom: 4,
  },
  userDate: {
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    padding: 12,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 38,
    borderRadius: 8,
  },
  approveBtn: {},
  suspendBtn: {},
  rejectBtn: {},
  deleteBtn: {},
});
