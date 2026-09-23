import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/Typography';
import { PremiumCard } from '../components/PremiumCard';
import { AppHeader } from '../components/AppHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ChevronRight, Sun, Moon, Sparkles, Star, Calendar as CalendarIcon, Flame, Gift, Clock } from 'lucide-react-native';
import { getFestivalsForMonthAndYear, FestivalItem } from '../data/festivalsData';

const { width } = Dimensions.get('window');

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const tithiList = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashti', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima / Amavasya'
];

const nakshatraList = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni',
  'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha'
];

export const CalendarScreen = ({ navigation }: any) => {
  const { colors, spacing, isDark } = useTheme();

  // Selected Month and Year (defaults to July 2026)
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(6); // 0-indexed: 6 = July
  const [selectedDay, setSelectedDay] = useState(20);

  const todayYear = 2026;
  const todayMonth = 6;
  const todayDay = 20;

  // Real calendar calculations
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay();

  // Shared Festivals Data
  const monthFestivals: FestivalItem[] = getFestivalsForMonthAndYear(selectedMonth, selectedYear);

  // Construct mathematically exact 7-column row grid
  const gridRows: (number | null)[][] = [];
  let currentRow: (number | null)[] = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    currentRow.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    currentRow.push(d);
    if (currentRow.length === 7) {
      gridRows.push(currentRow);
      currentRow = [];
    }
  }

  if (currentRow.length > 0) {
    while (currentRow.length < 7) {
      currentRow.push(null);
    }
    gridRows.push(currentRow);
  }

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  const handleGoToToday = () => {
    setSelectedYear(todayYear);
    setSelectedMonth(todayMonth);
    setSelectedDay(todayDay);
  };

  // Check if a day has a festival
  const getFestivalForDay = (dayNum: number) => {
    return monthFestivals.find(f => f.day === dayNum);
  };

  // Compute Panchang details for selected day
  const getPanchangForDay = (dayNum: number) => {
    const tithiIndex = (dayNum - 1) % 15;
    const paksha = dayNum <= 15 ? 'Shukla' : 'Krishna';
    const tithiName = tithiIndex === 14 
      ? (paksha === 'Shukla' ? 'Purnima' : 'Amavasya') 
      : `${paksha} ${tithiList[tithiIndex]}`;

    let tag = '';
    if (tithiIndex === 10) tag = 'Ekadashi';
    else if (tithiIndex === 14 && paksha === 'Shukla') tag = 'Purnima';
    else if (tithiIndex === 14 && paksha === 'Krishna') tag = 'Amavasya';

    const festival = getFestivalForDay(dayNum);
    if (festival) {
      tag = festival.name;
    }

    const nakshatra = nakshatraList[(dayNum + selectedMonth) % nakshatraList.length];

    return {
      tithi: tithiName,
      paksha,
      tag,
      festival,
      nakshatra,
      sunrise: '05:48 AM',
      sunset: '06:52 PM',
      abhijit: '11:54 AM - 12:48 PM',
      rahuKalam: '10:30 AM - 12:00 PM',
    };
  };

  const activePanchang = getPanchangForDay(selectedDay);
  const activeFestival = getFestivalForDay(selectedDay);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader 
        title="Panchang Calendar" 
        subtitle={`${monthNames[selectedMonth]} ${selectedYear} • Vikram Samvat 2083`}
        onBackPress={navigation?.canGoBack() ? () => navigation.goBack() : undefined}
        onMenuPress={() => navigation.navigate('Menu')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Month Navigation Control Card */}
        <PremiumCard style={styles.monthHeaderCard}>
          <View style={styles.monthHeaderRow}>
            <TouchableOpacity 
              onPress={handlePrevMonth}
              style={[styles.navButton, { backgroundColor: isDark ? '#1E1E26' : colors.surfaceVariant }]}
              activeOpacity={0.7}
            >
              <ChevronLeft color={colors.text} size={22} />
            </TouchableOpacity>

            <View style={{ alignItems: 'center' }}>
              <Typography variant="title" weight="bold">
                {monthNames[selectedMonth]} {selectedYear}
              </Typography>
              <Typography variant="caption" color="primary" weight="semibold" style={{ marginTop: 2 }}>
                {monthFestivals.length} Festivals & Vrats this Month
              </Typography>
            </View>

            <TouchableOpacity 
              onPress={handleNextMonth}
              style={[styles.navButton, { backgroundColor: isDark ? '#1E1E26' : colors.surfaceVariant }]}
              activeOpacity={0.7}
            >
              <ChevronRight color={colors.text} size={22} />
            </TouchableOpacity>
          </View>
        </PremiumCard>

        {/* Go to Today Button */}
        <View style={styles.todayBtnRow}>
          <TouchableOpacity 
            onPress={handleGoToToday}
            style={[styles.todayChip, { backgroundColor: isDark ? 'rgba(212, 175, 55, 0.2)' : 'rgba(212, 175, 55, 0.15)' }]}
            activeOpacity={0.7}
          >
            <CalendarIcon color={colors.primary} size={14} />
            <Typography variant="caption" weight="bold" color="primary" style={{ marginLeft: 6 }}>
              Jump to Today (20 Jul 2026)
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Days of Week Header */}
        <View style={styles.daysHeader}>
          {daysOfWeek.map((day, idx) => (
            <Typography 
              key={idx} 
              variant="caption" 
              weight="bold" 
              style={[
                styles.dayHeaderCell, 
                { color: idx === 0 ? '#E53935' : colors.textSecondary }
              ]}
            >
              {day}
            </Typography>
          ))}
        </View>

        {/* Perfectly Aligned 7-Column Calendar Grid */}
        <PremiumCard style={styles.gridCard} noPadding>
          <View style={styles.calendarGrid}>
            {gridRows.map((row, rIdx) => (
              <View key={rIdx} style={styles.gridRow}>
                {row.map((day, cIdx) => {
                  if (day === null) {
                    return <View key={cIdx} style={styles.dayCell} />;
                  }

                  const isSelected = day === selectedDay;
                  const isToday = day === todayDay && selectedMonth === todayMonth && selectedYear === todayYear;
                  const festival = getFestivalForDay(day);

                  return (
                    <TouchableOpacity
                      key={cIdx}
                      onPress={() => setSelectedDay(day)}
                      activeOpacity={0.8}
                      style={[
                        styles.dayCell,
                        isSelected && { backgroundColor: colors.primary, borderRadius: 14 },
                        isToday && !isSelected && { borderWidth: 2, borderColor: colors.primary, borderRadius: 12 },
                        festival && !isSelected && { 
                          backgroundColor: isDark ? 'rgba(255, 153, 51, 0.22)' : '#FFEDD5', 
                          borderRadius: 12 
                        }
                      ]}
                    >
                      <Typography
                        variant="body"
                        weight={isSelected || isToday || festival ? 'bold' : 'medium'}
                        style={{ 
                          color: isSelected ? '#000000' : (festival ? '#EA580C' : colors.text), 
                          fontSize: 13 
                        }}
                      >
                        {day}
                      </Typography>
                      
                      {festival && (
                        <View 
                          style={[
                            styles.dotTag, 
                            { backgroundColor: isSelected ? '#000000' : '#EA580C' }
                          ]} 
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </PremiumCard>

        {/* Active Festival Highlight for Selected Day */}
        {activeFestival && (
          <PremiumCard style={styles.festivalHighlightCard} noPadding>
            <LinearGradient colors={['#FF9933', '#D4AF37']} style={styles.festivalGradient}>
              <View style={styles.festTagRow}>
                <Flame color="#FFF" size={16} />
                <Typography variant="caption" weight="bold" style={{ color: '#FFF', marginLeft: 6 }}>
                  FESTIVAL ON {selectedDay} {monthNames[selectedMonth]}
                </Typography>
              </View>
              <Typography variant="title" style={{ color: '#FFF', marginTop: 8, fontSize: 18 }}>
                {activeFestival.name}
              </Typography>
              <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.95)', marginTop: 4, fontWeight: '500' }}>
                {activeFestival.tithi} • {activeFestival.description}
              </Typography>
            </LinearGradient>
          </PremiumCard>
        )}

        {/* Selected Day Panchang Details */}
        <Typography variant="subtitle" weight="bold" style={{ marginTop: 20, marginBottom: 12 }}>
          Daily Panchang ({selectedDay} {monthNames[selectedMonth]} {selectedYear})
        </Typography>

        <PremiumCard style={styles.detailsCard}>
          <View style={styles.detailHeader}>
            <View style={{ flex: 1 }}>
              <Typography variant="title" color="primary" weight="bold">
                {activePanchang.tithi}
              </Typography>
              <Typography variant="caption" color="muted" style={{ marginTop: 3 }}>
                {activePanchang.paksha} Paksha • {activePanchang.nakshatra} Nakshatra
              </Typography>
            </View>

            {activePanchang.tag !== '' && (
              <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
                <Typography variant="caption" weight="bold" style={{ color: '#000000' }}>
                  {activePanchang.tag}
                </Typography>
              </View>
            )}
          </View>

          <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />

          <View style={styles.detailGrid}>
            <View style={styles.detailBox}>
              <Sun color={colors.primary} size={18} />
              <Typography variant="caption" color="muted" style={{ marginTop: 4 }}>Sunrise</Typography>
              <Typography variant="body" weight="semibold">{activePanchang.sunrise}</Typography>
            </View>

            <View style={styles.detailBox}>
              <Moon color={colors.secondary} size={18} />
              <Typography variant="caption" color="muted" style={{ marginTop: 4 }}>Sunset</Typography>
              <Typography variant="body" weight="semibold">{activePanchang.sunset}</Typography>
            </View>

            <View style={styles.detailBox}>
              <Sparkles color={colors.primary} size={18} />
              <Typography variant="caption" color="muted" style={{ marginTop: 4 }}>Abhijit</Typography>
              <Typography variant="body" weight="semibold">{activePanchang.abhijit}</Typography>
            </View>

            <View style={styles.detailBox}>
              <Star color="#E53935" size={18} />
              <Typography variant="caption" color="muted" style={{ marginTop: 4 }}>Rahu Kalam</Typography>
              <Typography variant="body" weight="semibold">{activePanchang.rahuKalam}</Typography>
            </View>
          </View>
        </PremiumCard>

        {/* All Festivals in Selected Month List */}
        <Typography variant="subtitle" weight="bold" style={{ marginTop: 8, marginBottom: 12 }}>
          Festivals in {monthNames[selectedMonth]} {selectedYear} ({monthFestivals.length})
        </Typography>

        {monthFestivals.map((fest, idx) => (
          <TouchableOpacity 
            key={idx}
            onPress={() => setSelectedDay(fest.day)}
            activeOpacity={0.7}
          >
            <PremiumCard style={styles.monthFestCard}>
              <View style={styles.monthFestRow}>
                <View style={[styles.festDateBox, { backgroundColor: isDark ? '#1E1E26' : colors.surfaceVariant }]}>
                  <Typography variant="title" weight="bold" color="primary">{fest.day}</Typography>
                  <Typography variant="caption" color="muted" style={{ fontSize: 10 }}>{monthNames[selectedMonth].substring(0, 3)}</Typography>
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Typography variant="subtitle" weight="bold">{fest.name}</Typography>
                  <Typography variant="caption" color="muted" style={{ marginTop: 2 }}>{fest.tithi}</Typography>
                  <Typography variant="caption" style={{ marginTop: 4, color: colors.textSecondary }} numberOfLines={1}>
                    {fest.description}
                  </Typography>
                </View>
              </View>
            </PremiumCard>
          </TouchableOpacity>
        ))}

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
  monthHeaderCard: {
    marginBottom: 14,
    paddingVertical: 14,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayBtnRow: {
    alignItems: 'center',
    marginBottom: 14,
  },
  todayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
  },
  daysHeader: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    marginBottom: 6,
  },
  dayHeaderCell: {
    flex: 1,
    textAlign: 'center',
  },
  gridCard: {
    padding: 6,
  },
  calendarGrid: {
    flexDirection: 'column',
  },
  gridRow: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  dayCell: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotTag: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  festivalHighlightCard: {
    marginTop: 16,
  },
  festivalGradient: {
    padding: 16,
  },
  festTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsCard: {
    marginBottom: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  detailDivider: {
    height: 1,
    marginVertical: 14,
  },
  detailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailBox: {
    alignItems: 'center',
    flex: 1,
  },
  monthFestCard: {
    marginBottom: 10,
    padding: 12,
  },
  monthFestRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  festDateBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
