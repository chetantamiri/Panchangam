import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/Typography';
import { PremiumCard } from '../components/PremiumCard';
import { useAuth, UserProfile } from '../services/AuthContext';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import {
  UserCheck, UserX, Trash2, ShieldAlert, Users,
  Clock, CheckCircle, Search, Phone, Mail, Calendar
} from 'lucide-react-native';

type TabType = 'pending' | 'approved' | 'restricted';

export const UserManagementScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { userProfile: adminProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const usersCollection = collection(db, 'users');
    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      const usersList: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as UserProfile;
        if (data.uid !== adminProfile?.uid) {
          usersList.push(data);
        }
      });
      usersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUsers(usersList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching users:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load users list.');
    });

    return () => unsubscribe();
  }, [adminProfile]);

  const handleUpdateStatus = async (userUid: string, name: string, newStatus: UserProfile['status']) => {
    const actionLabels: Record<string, string> = {
      approved: 'Approve',
      rejected: 'Reject',
      suspended: 'Suspend',
    };
    Alert.alert(
      `${actionLabels[newStatus] || 'Update'} User`,
      `Are you sure you want to ${actionLabels[newStatus]?.toLowerCase() || 'update'} ${name}'s account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionLabels[newStatus] || 'Confirm',
          style: newStatus === 'rejected' || newStatus === 'suspended' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              const userRef = doc(db, 'users', userUid);
              await updateDoc(userRef, { status: newStatus });
              Alert.alert('Done', `${name}'s account has been ${newStatus}.`);
            } catch (error) {
              Alert.alert('Error', 'Failed to update user status.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteUser = async (userUid: string, name: string) => {
    Alert.alert(
      'Delete User',
      `Permanently delete ${name}?\n\nThey will be removed from the database and will need to register again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete the Firestore profile document.
              // Once deleted, if the user tries to sign in again the app will
              // automatically detect their missing profile and sign them out
              // instantly — they must register again from scratch.
              await deleteDoc(doc(db, 'users', userUid));
              Alert.alert('Deleted', `${name} has been removed. They must register again to access the app.`);
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to delete user.');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: UserProfile['status']) => {
    switch (status) {
      case 'approved': return '#22C55E';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      case 'suspended': return '#8B5CF6';
      default: return colors.textSecondary;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const allFiltered = users.filter((u) => {
    const matchesTab =
      activeTab === 'pending' ? u.status === 'pending' :
      activeTab === 'approved' ? u.status === 'approved' :
      u.status === 'rejected' || u.status === 'suspended';

    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      u.displayName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      (u as any).phoneNumber?.toLowerCase().includes(q);

    return matchesTab && matchesSearch;
  });

  const tabs: { id: TabType; label: string; icon: any; color: string }[] = [
    { id: 'pending', label: 'Pending', icon: Clock, color: '#F59E0B' },
    { id: 'approved', label: 'Approved', icon: CheckCircle, color: '#22C55E' },
    { id: 'restricted', label: 'Restricted', icon: ShieldAlert, color: '#EF4444' },
  ];

  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : colors.border;

  const renderUserItem = ({ item }: { item: UserProfile }) => {
    const statusColor = getStatusColor(item.status);
    const initials = item.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

    return (
      <PremiumCard style={styles.userCard}>
        {/* Header Row */}
        <View style={styles.userHeader}>
          <View style={[styles.userAvatar, { backgroundColor: colors.primary + '20', borderColor: colors.primary + '40' }]}>
            <Typography variant="body" weight="bold" style={{ color: colors.primary }}>{initials}</Typography>
          </View>
          <View style={styles.userMeta}>
            <Typography variant="body" weight="bold" numberOfLines={1}>{item.displayName}</Typography>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor + '40' }]}>
              <Typography variant="caption" weight="bold" style={{ color: statusColor, fontSize: 10 }}>
                {item.status.toUpperCase()}
              </Typography>
            </View>
          </View>
        </View>

        {/* Details */}
        <View style={[styles.userDetails, { borderTopColor: borderColor }]}>
          <View style={styles.detailRow}>
            <Mail size={13} color={colors.textSecondary} />
            <Typography variant="caption" color="muted" style={{ marginLeft: 6 }} numberOfLines={1}>{item.email}</Typography>
          </View>
          {(item as any).phoneNumber ? (
            <View style={styles.detailRow}>
              <Phone size={13} color={colors.textSecondary} />
              <Typography variant="caption" color="muted" style={{ marginLeft: 6 }}>{(item as any).phoneNumber}</Typography>
            </View>
          ) : null}
          <View style={styles.detailRow}>
            <Calendar size={13} color={colors.textSecondary} />
            <Typography variant="caption" color="muted" style={{ marginLeft: 6 }}>Registered: {formatDate(item.createdAt)}</Typography>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionRow, { borderTopColor: borderColor }]}>
          {item.status !== 'approved' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#22C55E20' }]}
              onPress={() => handleUpdateStatus(item.uid, item.displayName, 'approved')}
              activeOpacity={0.7}
            >
              <UserCheck size={15} color="#22C55E" />
              <Typography variant="caption" weight="bold" style={{ color: '#22C55E', marginLeft: 5 }}>Approve</Typography>
            </TouchableOpacity>
          )}

          {item.status === 'approved' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#8B5CF620' }]}
              onPress={() => handleUpdateStatus(item.uid, item.displayName, 'suspended')}
              activeOpacity={0.7}
            >
              <ShieldAlert size={15} color="#8B5CF6" />
              <Typography variant="caption" weight="bold" style={{ color: '#8B5CF6', marginLeft: 5 }}>Suspend</Typography>
            </TouchableOpacity>
          )}

          {item.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#EF444420' }]}
              onPress={() => handleUpdateStatus(item.uid, item.displayName, 'rejected')}
              activeOpacity={0.7}
            >
              <UserX size={15} color="#EF4444" />
              <Typography variant="caption" weight="bold" style={{ color: '#EF4444', marginLeft: 5 }}>Reject</Typography>
            </TouchableOpacity>
          )}

          {(item.status === 'suspended' || item.status === 'rejected') && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#F59E0B20' }]}
              onPress={() => handleUpdateStatus(item.uid, item.displayName, 'approved')}
              activeOpacity={0.7}
            >
              <UserCheck size={15} color="#F59E0B" />
              <Typography variant="caption" weight="bold" style={{ color: '#F59E0B', marginLeft: 5 }}>Re-approve</Typography>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: isDark ? '#2D1520' : '#FEE2E2' }]}
            onPress={() => handleDeleteUser(item.uid, item.displayName)}
            activeOpacity={0.7}
          >
            <Trash2 size={15} color="#EF4444" />
            <Typography variant="caption" weight="bold" style={{ color: '#EF4444', marginLeft: 5 }}>Delete</Typography>
          </TouchableOpacity>
        </View>
      </PremiumCard>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Vedic Panchangam"
        subtitle="User Management"
        showThemeToggle={false}
        onBackPress={navigation?.canGoBack() ? () => navigation.goBack() : undefined}
      />

      {/* Stats Bar */}
      <LinearGradient
        colors={isDark ? ['rgba(212,175,55,0.10)', 'transparent'] : ['rgba(212,175,55,0.07)', 'transparent']}
        style={styles.statsBar}
      >
        {[
          { label: 'Pending', count: users.filter(u => u.status === 'pending').length, color: '#F59E0B' },
          { label: 'Approved', count: users.filter(u => u.status === 'approved').length, color: '#22C55E' },
          { label: 'Restricted', count: users.filter(u => u.status === 'rejected' || u.status === 'suspended').length, color: '#EF4444' },
          { label: 'Total', count: users.length, color: colors.primary },
        ].map(({ label, count, color }) => (
          <View key={label} style={styles.statItem}>
            <Typography variant="title" weight="bold" style={{ color, fontSize: 22 }}>{count}</Typography>
            <Typography variant="caption" color="muted" style={{ fontSize: 10 }}>{label}</Typography>
          </View>
        ))}
      </LinearGradient>

      {/* Search */}
      <View style={[styles.searchBar, { borderColor, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
        <Search size={16} color={colors.textSecondary} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name, email, or phone..."
          placeholderTextColor={colors.textSecondary + '80'}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: borderColor }]}>
        {tabs.map(({ id, label, icon: Icon, color }) => {
          const count = users.filter(u =>
            id === 'pending' ? u.status === 'pending' :
            id === 'approved' ? u.status === 'approved' :
            u.status === 'rejected' || u.status === 'suspended'
          ).length;
          const isActive = activeTab === id;
          return (
            <TouchableOpacity
              key={id}
              style={[styles.tab, isActive && { borderBottomColor: color, borderBottomWidth: 2.5 }]}
              onPress={() => setActiveTab(id)}
              activeOpacity={0.7}
            >
              <Icon size={14} color={isActive ? color : colors.textSecondary} />
              <Typography
                variant="caption"
                weight={isActive ? 'bold' : 'medium'}
                style={{ color: isActive ? color : colors.textSecondary, marginLeft: 4 }}
              >
                {label} ({count})
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Typography variant="body" color="muted" style={{ marginTop: 12 }}>Loading users...</Typography>
        </View>
      ) : allFiltered.length === 0 ? (
        <View style={styles.centered}>
          <Users size={52} color={colors.textSecondary + '50'} />
          <Typography variant="body" color="muted" style={{ marginTop: 16, textAlign: 'center', paddingHorizontal: 40 }}>
            {searchQuery ? 'No users match your search.' : 'No users in this category.'}
          </Typography>
        </View>
      ) : (
        <FlatList
          data={allFiltered}
          keyExtractor={(item) => item.uid}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsBar: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  statItem: { alignItems: 'center' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    height: 46,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  userCard: {
    padding: 0,
    borderRadius: 18,
    overflow: 'hidden',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMeta: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  userDetails: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 10,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
  },
});
