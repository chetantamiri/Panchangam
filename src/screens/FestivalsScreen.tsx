import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Dimensions, Modal } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/Typography';
import { PremiumCard } from '../components/PremiumCard';
import { AppHeader } from '../components/AppHeader';
import { Search, Flame, Calendar, Sparkles, Clock, ChevronDown, Check, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getFestivalsForMonthAndYear, FestivalItem } from '../data/festivalsData';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const availableYears = [2025, 2026, 2027];

const categories = ['All', 'Major Festival', 'Vrat & Upvas', 'Jayanti'];

export const FestivalsScreen = ({ navigation }: any) => {
  const { colors, spacing, isDark } = useTheme();

  // Selected Month & Year states
  const [selectedMonth, setSelectedMonth] = useState(6); // 6 = July
  const [selectedYear, setSelectedYear] = useState(2026);

  const [showPickerModal, setShowPickerModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Retrieve shared festivals for selected Month & Year
  const currentFestivals: FestivalItem[] = getFestivalsForMonthAndYear(selectedMonth, selectedYear);

  // Filtering logic: "All" displays EVERY festival for that month & year!
  const filteredFestivals = currentFestivals.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.tithi.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader 
        title="Festivals & Vrats" 
        subtitle="Sacred Occasions & Divine Celebrations"
        onBackPress={navigation?.canGoBack() ? () => navigation.goBack() : undefined}
        onMenuPress={() => navigation.navigate('Menu')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Simple Month & Year Picker Bar */}
        <TouchableOpacity 
          style={[styles.simplePickerBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setShowPickerModal(true)}
          activeOpacity={0.8}
        >
          <View style={styles.pickerLeft}>
            <Calendar color={colors.primary} size={20} />
            <View style={{ marginLeft: 10 }}>
              <Typography variant="caption" color="muted" weight="medium">Selected Month & Year</Typography>
              <Typography variant="body" weight="bold">
                {monthNames[selectedMonth]} {selectedYear}
              </Typography>
            </View>
          </View>
          <View style={[styles.pickerBadge, { backgroundColor: isDark ? '#1E1E26' : colors.surfaceVariant }]}>
            <Typography variant="caption" weight="bold" color="primary">
              {currentFestivals.length} Events
            </Typography>
            <ChevronDown color={colors.text} size={16} style={{ marginLeft: 4 }} />
          </View>
        </TouchableOpacity>

        {/* Search Bar */}
        <View 
          style={[
            styles.searchContainer, 
            { 
              backgroundColor: colors.surface, 
              borderColor: colors.border 
            }
          ]}
        >
          <Search color={colors.textSecondary} size={18} />
          <TextInput
            placeholder={`Search in ${monthNames[selectedMonth]} ${selectedYear}...`}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>

        {/* Category Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map((cat, idx) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
                style={[
                  styles.categoryChip,
                  { 
                    backgroundColor: isSelected 
                      ? colors.primary 
                      : (isDark ? '#1E1E26' : colors.surfaceVariant) 
                  }
                ]}
              >
                <Typography
                  variant="caption"
                  weight="bold"
                  style={{ color: isSelected ? '#000000' : colors.text }}
                >
                  {cat}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Highlight Banner for First Festival */}
        {filteredFestivals.length > 0 && (
          <PremiumCard style={styles.bannerCard} noPadding>
            <LinearGradient colors={(filteredFestivals[0].colors || ['#FF9933', '#D4AF37']) as any} style={styles.bannerGradient}>
              <View style={styles.topBadge}>
                <Flame color="#FFF" size={16} />
                <Typography variant="caption" weight="bold" style={{ color: '#FFF', marginLeft: 6 }}>
                  FEATURED EVENT ({monthNames[selectedMonth].toUpperCase()} {selectedYear})
                </Typography>
              </View>

              <View style={{ marginTop: 'auto' }}>
                <Typography variant="display" style={{ color: '#FFF', fontSize: 20 }}>
                  {filteredFestivals[0].name}
                </Typography>
                <Typography variant="body" style={{ color: 'rgba(255,255,255,0.95)', marginTop: 4, fontWeight: '500' }}>
                  {filteredFestivals[0].day} {monthNames[selectedMonth]} {selectedYear} • {filteredFestivals[0].tithi}
                </Typography>
              </View>
            </LinearGradient>
          </PremiumCard>
        )}

        {/* Festival Cards List */}
        <Typography variant="subtitle" weight="bold" style={{ marginBottom: 14 }}>
          {selectedCategory === 'All' ? 'All Occasions' : selectedCategory} in {monthNames[selectedMonth]} {selectedYear} ({filteredFestivals.length})
        </Typography>

        {filteredFestivals.map((item) => (
          <PremiumCard key={item.id} style={styles.festivalCard}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.badgeRow}>
                  <View 
                    style={[
                      styles.miniBadge, 
                      { backgroundColor: isDark ? 'rgba(212, 175, 55, 0.2)' : 'rgba(181, 136, 0, 0.15)' }
                    ]}
                  >
                    <Typography variant="caption" weight="bold" color="primary">
                      {item.category}
                    </Typography>
                  </View>

                  <View style={styles.countdownBadge}>
                    <Clock color={colors.secondary} size={14} />
                    <Typography variant="caption" weight="bold" style={{ color: colors.secondary, marginLeft: 4 }}>
                      {item.day} {monthNames[selectedMonth].substring(0, 3)}
                    </Typography>
                  </View>
                </View>

                <Typography variant="subtitle" weight="bold" style={{ marginTop: 8 }}>
                  {item.name}
                </Typography>

                <Typography variant="caption" color="muted" style={{ marginTop: 2 }}>
                  {item.tithi}
                </Typography>
              </View>

              <View style={[styles.dateBox, { backgroundColor: isDark ? '#1E1E26' : colors.surfaceVariant }]}>
                <Calendar color={colors.primary} size={20} />
                <Typography variant="caption" weight="bold" style={{ marginTop: 4, textAlign: 'center', color: colors.text }}>
                  {item.day} {monthNames[selectedMonth].substring(0, 3)}
                </Typography>
              </View>
            </View>

            <Typography variant="body" color="muted" style={{ marginTop: 12, lineHeight: 18, fontSize: 13 }}>
              {item.description}
            </Typography>
          </PremiumCard>
        ))}

        {/* Simple Month & Year Selection Dropdown Modal */}
        <Modal visible={showPickerModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
              <View style={styles.modalHeader}>
                <Typography variant="subtitle" weight="bold">Select Month & Year</Typography>
                <TouchableOpacity onPress={() => setShowPickerModal(false)}>
                  <X color={colors.text} size={22} />
                </TouchableOpacity>
              </View>

              {/* Year Options */}
              <Typography variant="caption" color="muted" weight="bold" style={{ marginBottom: 8 }}>
                Select Year
              </Typography>
              <View style={styles.yearGrid}>
                {availableYears.map((yr) => (
                  <TouchableOpacity
                    key={yr}
                    onPress={() => setSelectedYear(yr)}
                    style={[
                      styles.yearOption,
                      { backgroundColor: yr === selectedYear ? colors.primary : (isDark ? '#1E1E26' : colors.surfaceVariant) }
                    ]}
                  >
                    <Typography variant="body" weight="bold" style={{ color: yr === selectedYear ? '#000000' : colors.text }}>
                      {yr}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Month Options */}
              <Typography variant="caption" color="muted" weight="bold" style={{ marginTop: 16, marginBottom: 8 }}>
                Select Month
              </Typography>
              <ScrollView style={{ maxHeight: 220 }}>
                {monthNames.map((mName, idx) => {
                  const isSel = idx === selectedMonth;
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedMonth(idx)}
                      style={[
                        styles.monthOption,
                        { borderBottomColor: colors.border },
                        isSel && { backgroundColor: isDark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0.12)' }
                      ]}
                    >
                      <Typography variant="body" weight={isSel ? 'bold' : 'medium'} style={{ color: isSel ? colors.primary : colors.text }}>
                        {mName}
                      </Typography>
                      {isSel && <Check color={colors.primary} size={18} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TouchableOpacity
                style={[styles.applyBtn, { backgroundColor: colors.primary }]}
                onPress={() => setShowPickerModal(false)}
              >
                <Typography variant="body" weight="bold" style={{ color: '#000000' }}>
                  Apply Filter
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  simplePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
    elevation: 2,
  },
  pickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  categoriesContainer: {
    marginBottom: 18,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  bannerCard: {
    height: 160,
    marginBottom: 20,
  },
  bannerGradient: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  festivalCard: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  yearGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  yearOption: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  monthOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderRadius: 10,
  },
  applyBtn: {
    marginTop: 18,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
