import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  ActivityIndicator, 
  Dimensions, 
  KeyboardAvoidingView, 
  Platform,
  Switch
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/Typography';
import { PremiumCard } from '../components/PremiumCard';
import { AppHeader } from '../components/AppHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Sparkles, 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  X, 
  Search, 
  ArrowLeft, 
  AlertCircle, 
  Info,
  Sliders,
  Check,
  Star,
  Layers,
  Compass,
  BookOpen
} from 'lucide-react-native';
import { searchLocationSuggestions, LocationItem } from '../services/locationService';
import { getHoroscopePredictions, HoroscopePredictionsRequest } from '../services/vedAstroApi';

const { width } = Dimensions.get('window');

const CATEGORIES_DATA = [
  {
    category: 'Career',
    tags: ['Authority', 'Status', 'Skills', 'Reputation']
  },
  {
    category: 'Finance',
    tags: ['Finance', 'Wealth']
  },
  {
    category: 'Marriage',
    tags: ['Marriage', 'Romance']
  },
  {
    category: 'Health',
    tags: ['Health']
  },
  {
    category: 'Family',
    tags: ['Family', 'Children']
  },
  {
    category: 'Property',
    tags: ['Property']
  },
  {
    category: 'Travel',
    tags: ['Travel']
  }
];

/* =========================================================================
                          CUSTOM DATE PICKER MODAL
   ========================================================================= */
const CustomDatePickerModal = ({ visible, onClose, onSelect, value }: any) => {
  const { colors } = useTheme();
  
  const [day, setDay] = useState(15);
  const [month, setMonth] = useState(6);
  const [year, setYear] = useState(1990);

  useEffect(() => {
    if (value && visible) {
      const parts = value.split('/');
      if (parts.length === 3) {
        setDay(parseInt(parts[0], 10) || 15);
        setMonth(parseInt(parts[1], 10) || 6);
        setYear(parseInt(parts[2], 10) || 1990);
      }
    }
  }, [value, visible]);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const years = Array.from({ length: 80 }, (_, i) => 2026 - i);

  const handleConfirm = () => {
    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(month).padStart(2, '0');
    onSelect(`${formattedDay}/${formattedMonth}/${year}`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.pickerModalContent, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
          <Typography variant="subtitle" weight="bold" style={{ marginBottom: 16, textAlign: 'center' }}>
            Select Birth Date
          </Typography>

          <View style={styles.pickerColumnsRow}>
            {/* Day Column */}
            <View style={styles.pickerColumn}>
              <Typography variant="caption" color="muted" weight="bold" style={styles.pickerColHeader}>Day</Typography>
              <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                {days.map((d) => {
                  const isSelected = day === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setDay(d)}
                      style={[
                        styles.pickerItem,
                        isSelected && { backgroundColor: colors.primary }
                      ]}
                    >
                      <Typography variant="body" weight={isSelected ? "bold" : "regular"} style={{ color: isSelected ? '#FFF' : colors.text }}>
                        {d}
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Month Column */}
            <View style={[styles.pickerColumn, { flex: 1.5 }]}>
              <Typography variant="caption" color="muted" weight="bold" style={styles.pickerColHeader}>Month</Typography>
              <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                {months.map((m, idx) => {
                  const isSelected = month === idx + 1;
                  return (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setMonth(idx + 1)}
                      style={[
                        styles.pickerItem,
                        isSelected && { backgroundColor: colors.primary }
                      ]}
                    >
                      <Typography variant="body" weight={isSelected ? "bold" : "regular"} style={{ color: isSelected ? '#FFF' : colors.text, fontSize: 13 }}>
                        {m}
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Year Column */}
            <View style={styles.pickerColumn}>
              <Typography variant="caption" color="muted" weight="bold" style={styles.pickerColHeader}>Year</Typography>
              <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                {years.map((y) => {
                  const isSelected = year === y;
                  return (
                    <TouchableOpacity
                      key={y}
                      onPress={() => setYear(y)}
                      style={[
                        styles.pickerItem,
                        isSelected && { backgroundColor: colors.primary }
                      ]}
                    >
                      <Typography variant="body" weight={isSelected ? "bold" : "regular"} style={{ color: isSelected ? '#FFF' : colors.text }}>
                        {y}
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          <View style={styles.pickerActionRow}>
            <TouchableOpacity onPress={onClose} style={[styles.pickerCancelBtn, { borderColor: colors.border, borderWidth: 1 }]}>
              <Typography variant="body" weight="semibold">Cancel</Typography>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleConfirm} style={styles.pickerConfirmBtn}>
              <LinearGradient
                colors={['#7A1124', '#D4AF37']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.pickerBtnGradient}
              >
                <Typography variant="body" weight="bold" style={{ color: '#FFF' }}>Confirm</Typography>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* =========================================================================
                          CUSTOM TIME PICKER MODAL
   ========================================================================= */
const CustomTimePickerModal = ({ visible, onClose, onSelect, value }: any) => {
  const { colors } = useTheme();
  
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [isPm, setIsPm] = useState(false);

  useEffect(() => {
    if (value && visible) {
      const parts = value.split(':');
      if (parts.length === 2) {
        let h = parseInt(parts[0], 10) || 12;
        const m = parseInt(parts[1], 10) || 0;
        
        if (h >= 12) {
          setIsPm(true);
          if (h > 12) h -= 12;
        } else {
          setIsPm(false);
          if (h === 0) h = 12;
        }
        setHour(h);
        setMinute(m);
      }
    }
  }, [value, visible]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleConfirm = () => {
    let h24 = hour;
    if (isPm) {
      if (hour !== 12) h24 += 12;
    } else {
      if (hour === 12) h24 = 0;
    }
    
    const formattedHour = String(h24).padStart(2, '0');
    const formattedMinute = String(minute).padStart(2, '0');
    onSelect(`${formattedHour}:${formattedMinute}`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.pickerModalContent, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
          <Typography variant="subtitle" weight="bold" style={{ marginBottom: 16, textAlign: 'center' }}>
            Select Birth Time
          </Typography>

          <View style={styles.pickerColumnsRow}>
            {/* Hour Column */}
            <View style={styles.pickerColumn}>
              <Typography variant="caption" color="muted" weight="bold" style={styles.pickerColHeader}>Hour</Typography>
              <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                {hours.map((h) => {
                  const isSelected = hour === h;
                  return (
                    <TouchableOpacity
                      key={h}
                      onPress={() => setHour(h)}
                      style={[
                        styles.pickerItem,
                        isSelected && { backgroundColor: colors.primary }
                      ]}
                    >
                      <Typography variant="body" weight={isSelected ? "bold" : "regular"} style={{ color: isSelected ? '#FFF' : colors.text }}>
                        {h}
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Minute Column */}
            <View style={styles.pickerColumn}>
              <Typography variant="caption" color="muted" weight="bold" style={styles.pickerColHeader}>Minute</Typography>
              <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                {minutes.map((m) => {
                  const isSelected = minute === m;
                  const mStr = String(m).padStart(2, '0');
                  return (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setMinute(m)}
                      style={[
                        styles.pickerItem,
                        isSelected && { backgroundColor: colors.primary }
                      ]}
                    >
                      <Typography variant="body" weight={isSelected ? "bold" : "regular"} style={{ color: isSelected ? '#FFF' : colors.text }}>
                        {mStr}
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* AM/PM Column */}
            <View style={styles.pickerColumn}>
              <Typography variant="caption" color="muted" weight="bold" style={styles.pickerColHeader}>AM/PM</Typography>
              <View style={{ flex: 1, justifyContent: 'center', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setIsPm(false)}
                  style={[
                    styles.pickerItem,
                    { height: 44 },
                    !isPm && { backgroundColor: colors.primary }
                  ]}
                >
                  <Typography variant="body" weight={!isPm ? "bold" : "regular"} style={{ color: !isPm ? '#FFF' : colors.text }}>
                    AM
                  </Typography>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setIsPm(true)}
                  style={[
                    styles.pickerItem,
                    { height: 44 },
                    isPm && { backgroundColor: colors.primary }
                  ]}
                >
                  <Typography variant="body" weight={isPm ? "bold" : "regular"} style={{ color: isPm ? '#FFF' : colors.text }}>
                    PM
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.pickerActionRow}>
            <TouchableOpacity onPress={onClose} style={[styles.pickerCancelBtn, { borderColor: colors.border, borderWidth: 1 }]}>
              <Typography variant="body" weight="semibold">Cancel</Typography>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleConfirm} style={styles.pickerConfirmBtn}>
              <LinearGradient
                colors={['#7A1124', '#D4AF37']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.pickerBtnGradient}
              >
                <Typography variant="body" weight="bold" style={{ color: '#FFF' }}>Confirm</Typography>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* =========================================================================
                      HOROSCOPE PREDICTIONS SCREEN
   ========================================================================= */
export const HoroscopePredictionsScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();

  // Mode: 'input' or 'result'
  const [screenMode, setScreenMode] = useState<'input' | 'result'>('input');

  // Input states (Pre-filled with user's example values)
  const [date, setDate] = useState('15/06/1990');
  const [time, setTime] = useState('12:00');
  const [locationName, setLocationName] = useState('Bhimavaram, Andhra Pradesh, India');
  const [lat, setLat] = useState(16.561);
  const [lng, setLng] = useState(81.52);

  // Selected Filter tag (All by default)
  const [selectedTag, setSelectedTag] = useState<string>('All');

  // Sort by weight toggle state
  const [sortByWeight, setSortByWeight] = useState(true);

  // Custom picker modals visibility
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [showDropdownModal, setShowDropdownModal] = useState(false);

  // Modal location search states
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [suggestions, setSuggestions] = useState<LocationItem[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  // API states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [horoscopeData, setHoroscopeData] = useState<any[]>([]);

  // Results expanded accordion state
  const [expandedPredictions, setExpandedPredictions] = useState<{ [key: string]: boolean }>({});

  // Debounced location search
  useEffect(() => {
    if (!locationInput || locationInput.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLocation(true);
      try {
        const results = await searchLocationSuggestions(locationInput);
        setSuggestions(results);
      } catch (err) {
        console.warn('Location lookup failed:', err);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [locationInput]);

  // Select location item
  const handleSelectLocation = (item: LocationItem) => {
    setLocationName(item.name);
    setLat(item.latitude);
    setLng(item.longitude);
    setLocationModalVisible(false);
    setSuggestions([]);
  };

  // Toggle single tag (Radio button style selection)
  const handleSelectTag = (tag: string) => {
    setSelectedTag(tag);
  };

  const getTakeaway = (desc: string): string => {
    if (!desc) return '';
    const sentences = desc.split(/(?<=[.!?])\s+/);
    return sentences[0] || '';
  };
  
  const getRemainingDesc = (desc: string): string => {
    if (!desc) return '';
    const sentences = desc.split(/(?<=[.!?])\s+/);
    if (sentences.length <= 1) return '';
    return sentences.slice(1).join(' ');
  };

  const renderNaturePill = (nature: string) => {
    if (!nature) return null;
    const cleanNature = String(nature).trim().toLowerCase();
    
    let label = 'Neutral';
    let color = '#7F8C8D';
    let bgColor = 'rgba(127, 140, 141, 0.08)';
    let borderColor = 'rgba(127, 140, 141, 0.3)';
    
    if (cleanNature === 'good' || cleanNature === 'positive') {
      label = 'Auspicious';
      color = '#10B981';
      bgColor = 'rgba(16, 185, 129, 0.08)';
      borderColor = 'rgba(16, 185, 129, 0.3)';
    } else if (cleanNature === 'bad' || cleanNature === 'negative') {
      label = 'Challenging';
      color = '#EF4444';
      bgColor = 'rgba(239, 68, 68, 0.08)';
      borderColor = 'rgba(239, 68, 68, 0.3)';
    }
    
    return (
      <View style={[styles.naturePill, { backgroundColor: bgColor, borderColor: borderColor }]}>
        <Typography variant="caption" weight="bold" style={{ color: color, fontSize: 10 }}>
          {label}
        </Typography>
      </View>
    );
  };

  // Generate Horoscope prediction list
  const handleGenerateHoroscope = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    const stdTimeStr = `${time} ${date} +05:30`;

    // Gather all unique tags from CATEGORIES_DATA
    const allTags = CATEGORIES_DATA.reduce((acc, cat) => {
      cat.tags.forEach(tag => {
        if (!acc.includes(tag)) {
          acc.push(tag);
        }
      });
      return acc;
    }, [] as string[]);

    const tagsToFetch = selectedTag === 'All' ? allTags : [selectedTag];

    try {
      const promises = tagsToFetch.map(async (tag) => {
        try {
          const requestPayload: HoroscopePredictionsRequest = {
            BirthTime: {
              StdTime: stdTimeStr,
              Location: {
                Name: locationName,
                Latitude: lat,
                Longitude: lng
              }
            },
            FilterTags: tag,
            SortByWeight: sortByWeight ? 'True' : 'False',
            Ayanamsa: 'RAMAN'
          };
          const response = await getHoroscopePredictions(requestPayload);
          const predictions = response.Payload || response;
          if (Array.isArray(predictions)) {
            return predictions;
          } else if (response?.Payload?.HoroscopePredictions && Array.isArray(response.Payload.HoroscopePredictions)) {
            return response.Payload.HoroscopePredictions;
          }
        } catch (err) {
          console.warn(`Failed to fetch horoscope predictions for tag "${tag}":`, err);
        }
        return [];
      });

      const results = await Promise.all(promises);
      const allPredictions = results.flat();

      // Deduplicate predictions by Name
      const uniquePredictions: any[] = [];
      const seenNames = new Set<string>();
      for (const pred of allPredictions) {
        if (pred && pred.Name && !seenNames.has(pred.Name)) {
          seenNames.add(pred.Name);
          uniquePredictions.push(pred);
        }
      }

      if (uniquePredictions.length > 0) {
        setHoroscopeData(uniquePredictions);
        setScreenMode('result');
      } else {
        setErrorMsg('Failed to parse horoscope predictions. Please try a different birth time.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'API request failed. HoroscopePredictions service offline.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle prediction accordion item
  const togglePrediction = (name: string) => {
    setExpandedPredictions(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Processed horoscope predictions list
  const processedHoroscopeList = React.useMemo(() => {
    if (!horoscopeData) return [];

    let list = [...horoscopeData];

    // Optional sort by weight
    if (sortByWeight) {
      list.sort((a, b) => (b.Weight || 0) - (a.Weight || 0));
    }

    return list;
  }, [horoscopeData, sortByWeight]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader 
        title="Horoscope Predictions" 
        subtitle="Vedic Life Interpretations"
        onMenuPress={() => navigation?.navigate('Menu')}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {screenMode === 'input' ? (
            /* =========================================================================
                                     INPUT VIEW: HOROSCOPE FORM
               ========================================================================= */
            <View>
              {errorMsg && (
                <PremiumCard style={styles.errorCard}>
                  <AlertCircle color="#EF4444" size={20} />
                  <Typography variant="body" weight="medium" style={{ color: '#EF4444', marginLeft: 10, flex: 1 }}>
                    {errorMsg}
                  </Typography>
                </PremiumCard>
              )}

              {/* BIRTH DETAILS CARD */}
              <PremiumCard style={styles.formCard}>
                <Typography variant="subtitle" weight="bold" style={{ marginBottom: 16 }}>
                  Birth Details
                </Typography>

                <View style={styles.row}>
                  {/* Birth Date picker */}
                  <View style={[styles.fieldContainer, { flex: 1, marginRight: 10 }]}>
                    <Typography variant="caption" color="muted" weight="semibold" style={styles.fieldLabel}>Birth Date</Typography>
                    <TouchableOpacity 
                      style={[styles.inputIconWrapper, { borderColor: colors.border }]}
                      onPress={() => setDatePickerVisible(true)}
                      activeOpacity={0.7}
                    >
                      <CalendarIcon color={colors.primary} size={18} style={{ marginRight: 8 }} />
                      <Typography variant="body" style={{ color: colors.text, flex: 1 }}>
                        {date || 'Select Date'}
                      </Typography>
                      <ChevronDown color={colors.textSecondary} size={14} />
                    </TouchableOpacity>
                  </View>

                  {/* Birth Time picker */}
                  <View style={[styles.fieldContainer, { flex: 1 }]}>
                    <Typography variant="caption" color="muted" weight="semibold" style={styles.fieldLabel}>Birth Time</Typography>
                    <TouchableOpacity 
                      style={[styles.inputIconWrapper, { borderColor: colors.border }]}
                      onPress={() => setTimePickerVisible(true)}
                      activeOpacity={0.7}
                    >
                      <Clock color={colors.secondary} size={18} style={{ marginRight: 8 }} />
                      <Typography variant="body" style={{ color: colors.text, flex: 1 }}>
                        {time || 'Select Time'}
                      </Typography>
                      <ChevronDown color={colors.textSecondary} size={14} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Birth Place picker */}
                <View style={styles.fieldContainer}>
                  <Typography variant="caption" color="muted" weight="semibold" style={styles.fieldLabel}>Birth Place</Typography>
                  <TouchableOpacity 
                    style={[styles.inputIconWrapper, { borderColor: colors.border }]}
                    onPress={() => setLocationModalVisible(true)}
                    activeOpacity={0.7}
                  >
                    <MapPin color={colors.primary} size={18} style={{ marginRight: 8 }} />
                    <Typography variant="body" style={{ flex: 1, color: locationName ? colors.text : colors.textSecondary }} numberOfLines={1}>
                      {locationName || 'Select place'}
                    </Typography>
                    <ChevronRight color={colors.textSecondary} size={18} />
                  </TouchableOpacity>
                </View>
              </PremiumCard>

              {/* FILTER TAGS / CATEGORIES DROPDOWN (Senior Developer Design) */}
              <PremiumCard style={styles.formCard}>
                <View style={styles.sectionHeaderRow}>
                  <Layers color={colors.primary} size={18} />
                  <Typography variant="subtitle" weight="bold" style={{ marginLeft: 10, flex: 1 }}>
                    Filter Category
                  </Typography>
                </View>

                <Typography variant="caption" color="muted" style={{ marginBottom: 12 }}>
                  Filter predictions by specific life categories, or view all predictions.
                </Typography>

                {/* Dropdown Selector Button */}
                <TouchableOpacity 
                  style={[styles.dropdownSelector, { borderColor: colors.border }]}
                  onPress={() => setShowDropdownModal(true)}
                  activeOpacity={0.7}
                >
                  <Sliders color={colors.primary} size={18} style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Typography variant="caption" color="muted" style={{ fontSize: 9 }}>SELECTED FILTER</Typography>
                    <Typography variant="body" weight="bold">
                      {selectedTag === 'All' ? 'All Categories (No Filter)' : selectedTag}
                    </Typography>
                  </View>
                  <ChevronDown color={colors.textSecondary} size={18} />
                </TouchableOpacity>
              </PremiumCard>

              {/* SORT BY WEIGHT TOGGLE */}
              <PremiumCard style={styles.formCard}>
                <View style={styles.sortToggleRow}>
                  <View style={{ flex: 1 }}>
                    <Typography variant="body" weight="bold">Sort Predictions by Weight</Typography>
                    <Typography variant="caption" color="muted">Show predictions with higher intensity and significance first</Typography>
                  </View>
                  <Switch
                    value={sortByWeight}
                    onValueChange={setSortByWeight}
                    trackColor={{ false: '#BDC3C7', true: colors.primary }}
                    thumbColor={Platform.OS === 'android' ? '#FFF' : undefined}
                  />
                </View>
              </PremiumCard>

              {/* GENERATE HOROSCOPE BUTTON */}
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Typography variant="body" weight="bold" style={{ marginTop: 14 }}>
                    Generating Horoscope Report...
                  </Typography>
                  <Typography variant="caption" color="muted" style={{ marginTop: 4, textAlign: 'center' }}>
                    Requesting predictions for Category Tag "{selectedTag}"...
                  </Typography>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleGenerateHoroscope}
                  style={styles.calculateBtn}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#7A1124', '#D4AF37']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.btnGradient}
                  >
                    <Sparkles color="#FFF" size={20} style={{ marginRight: 8 }} />
                    <Typography variant="body" weight="bold" style={{ color: '#FFF' }}>
                      Generate Horoscope Predictions
                    </Typography>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            /* =========================================================================
                                     RESULT VIEW: PREDICTIONS LIST
               ========================================================================= */
            <View>
              {/* BACK BUTTON */}
              <TouchableOpacity 
                onPress={() => setScreenMode('input')}
                style={styles.backButton}
              >
                <ArrowLeft color={colors.primary} size={18} />
                <Typography variant="body" weight="semibold" style={{ color: colors.primary, marginLeft: 8 }}>
                  Change Details & Filters
                </Typography>
              </TouchableOpacity>

              {/* INFO CARD */}
              <PremiumCard style={styles.infoSummaryCard}>
                <Typography variant="caption" weight="bold" color="primary">Vedic Almanac Predictions</Typography>
                <Typography variant="subtitle" weight="bold" style={{ marginTop: 4 }}>
                  Horoscope Report ({selectedTag})
                </Typography>
                <Typography variant="caption" color="muted" style={{ marginTop: 2 }}>
                  Calculated for: {locationName} • {date} ({time})
                </Typography>
                <Typography variant="caption" color="muted" style={{ marginTop: 4 }}>
                  Found {processedHoroscopeList.length} predictions from the VedAstro engine.
                </Typography>
              </PremiumCard>

              {/* PREDICTIONS ACCORDION LIST */}
              {processedHoroscopeList.length === 0 ? (
                <PremiumCard style={styles.noResultsCard}>
                  <Info color={colors.textSecondary} size={24} />
                  <Typography variant="body" color="muted" style={{ marginTop: 10, textAlign: 'center' }}>
                    No predictions found matching tag "{selectedTag}". Try different birth details.
                  </Typography>
                </PremiumCard>
              ) : (
                processedHoroscopeList.map((item: any, idx: number) => {
                  const isExpanded = !!expandedPredictions[item.Name];
                  
                  // Parse tags safely to display
                  const tagsArr = Array.isArray(item.Tags) 
                    ? item.Tags 
                    : (typeof item.Tags === 'string' ? item.Tags.split(',') : []);

                  // Format weight value
                  const weightVal = parseFloat(item.Weight) || 0;

                  return (
                    <PremiumCard 
                      key={idx} 
                      style={[
                        styles.predictionCard, 
                        { 
                          borderLeftWidth: 4, 
                          borderLeftColor: colors.primary,
                          backgroundColor: isDark ? 'rgba(212,175,55,0.06)' : '#FEFBF3'
                        }
                      ]}
                      noPadding
                    >
                      <TouchableOpacity
                        onPress={() => togglePrediction(item.Name)}
                        activeOpacity={0.7}
                        style={styles.predictionTrigger}
                      >
                        <View style={{ flex: 1, paddingRight: 8 }}>
                           <Typography variant="body" weight="bold">{item.Name}</Typography>
                          
                          {/* Stars / Weight visual rating */}
                          <View style={styles.weightRow}>
                            <Star color={colors.primary} size={11} fill={colors.primary} />
                            <Typography variant="caption" color="muted" style={{ fontSize: 10, marginLeft: 4 }}>
                              Intensity / Weight: {weightVal.toFixed(1)}
                            </Typography>
                          </View>
                        </View>

                        <View style={styles.predictionRightRow}>
                          {renderNaturePill(item.Nature)}
                          <ChevronDown color={colors.textSecondary} size={18} style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }} />
                        </View>
                      </TouchableOpacity>

                      {isExpanded && (
                        <View style={[styles.predictionContent, { borderTopWidth: 1, borderTopColor: colors.border + '30', backgroundColor: colors.surface }]}>
                          
                          {/* Related Bodies (Planets, Houses, Zodiacs) */}
                          {item.RelatedBody && (
                            <View style={styles.genderComparisonRow}>
                              {Array.isArray(item.RelatedBody.Planets) && item.RelatedBody.Planets.length > 0 && (
                                <View style={[styles.genderInfoBox, { borderColor: colors.border + '30', backgroundColor: colors.background + '40' }]}>
                                  <View style={styles.genderBoxHeader}>
                                    <Sparkles color={colors.primary} size={12} />
                                    <Typography variant="caption" weight="bold" style={{ color: colors.primary, marginLeft: 4 }}>Planets</Typography>
                                  </View>
                                  <Typography variant="caption" color="muted" style={{ marginTop: 2 }}>
                                    {item.RelatedBody.Planets.join(', ')}
                                  </Typography>
                                </View>
                              )}

                              {Array.isArray(item.RelatedBody.Houses) && item.RelatedBody.Houses.length > 0 && (
                                <View style={[styles.genderInfoBox, { borderColor: colors.border + '30', backgroundColor: colors.background + '40' }]}>
                                  <View style={styles.genderBoxHeader}>
                                    <Compass color={colors.secondary} size={12} />
                                    <Typography variant="caption" weight="bold" style={{ color: colors.secondary, marginLeft: 4 }}>Houses</Typography>
                                  </View>
                                  <Typography variant="caption" color="muted" style={{ marginTop: 2 }}>
                                    {item.RelatedBody.Houses.map((h: string) => h.replace('House', 'House ')).join(', ')}
                                  </Typography>
                                </View>
                              )}
                            </View>
                          )}

                          {/* Description box */}
                          <View style={[styles.verdictDetailBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <View style={styles.verdictHeaderRow}>
                              <BookOpen color={colors.primary} size={14} />
                              <Typography variant="caption" weight="bold" color="primary" style={{ marginLeft: 6 }}>
                                Astrological Guidance
                              </Typography>
                            </View>
                            
                            {/* Highlighted Takeaway */}
                            {getTakeaway(item.Description) ? (
                              <View style={[styles.takeawayHighlight, { borderLeftColor: colors.primary, backgroundColor: isDark ? 'rgba(212,175,55,0.06)' : '#FFFBEB' }]}>
                                <Typography variant="body" weight="semibold" style={{ fontSize: 13, lineHeight: 18, color: isDark ? '#D4AF37' : '#B45309' }}>
                                  "{getTakeaway(item.Description)}"
                                </Typography>
                              </View>
                            ) : null}

                            {/* Remaining description */}
                            {getRemainingDesc(item.Description) ? (
                              <Typography variant="body" style={{ marginTop: 8, fontSize: 13, lineHeight: 19, color: colors.textSecondary }}>
                                {getRemainingDesc(item.Description)}
                              </Typography>
                            ) : !getTakeaway(item.Description) ? (
                              <Typography variant="body" style={{ marginTop: 8, fontSize: 13, lineHeight: 19, color: colors.textSecondary }}>
                                {item.Description}
                              </Typography>
                            ) : null}
                          </View>

                          {/* Tags row */}
                          {tagsArr.length > 0 && (
                            <View style={styles.predTagsContainer}>
                              {tagsArr.map((t: string, tIdx: number) => (
                                <View key={tIdx} style={[styles.miniTagChip, { backgroundColor: colors.border + '40' }]}>
                                  <Typography variant="caption" style={{ fontSize: 9, fontWeight: '700' }}>
                                    {t.trim()}
                                  </Typography>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      )}
                    </PremiumCard>
                  );
                })
              )}
            </View>
          )}

          <View style={{ height: 110 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* DATE PICKER MODAL */}
      <CustomDatePickerModal 
        visible={datePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        value={date}
        onSelect={(dateStr: string) => setDate(dateStr)}
      />

      {/* TIME PICKER MODAL */}
      <CustomTimePickerModal 
        visible={timePickerVisible}
        onClose={() => setTimePickerVisible(false)}
        value={time}
        onSelect={(timeStr: string) => setTime(timeStr)}
      />

      {/* Dropdown Filter Category Modal */}
      <Modal visible={showDropdownModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
            <View style={styles.modalHeader}>
              <Typography variant="subtitle" weight="bold">Select Filter Category</Typography>
              <TouchableOpacity onPress={() => setShowDropdownModal(false)}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {/* Option 'All' */}
              <TouchableOpacity
                onPress={() => {
                  setSelectedTag('All');
                  setShowDropdownModal(false);
                }}
                style={[
                  styles.dropdownItem,
                  selectedTag === 'All' && { backgroundColor: colors.primary + '12' },
                  { borderBottomColor: colors.border, borderBottomWidth: 1 }
                ]}
              >
                <Sparkles color={colors.primary} size={16} />
                <Typography variant="body" weight={selectedTag === 'All' ? 'bold' : 'medium'} style={{ marginLeft: 10, flex: 1 }}>
                  All Categories (Show All Predictions)
                </Typography>
                {selectedTag === 'All' && <Check color={colors.primary} size={18} />}
              </TouchableOpacity>

              {/* Categorized Options */}
              {CATEGORIES_DATA.map((catItem) => (
                <View key={catItem.category} style={{ marginTop: 12 }}>
                  {/* Section Label */}
                  <Typography variant="caption" color="primary" weight="bold" style={{ marginLeft: 12, marginBottom: 6, letterSpacing: 1 }}>
                    {catItem.category.toUpperCase()}
                  </Typography>
                  
                  {catItem.tags.map((tag) => {
                    const isSelected = selectedTag === tag;
                    return (
                      <TouchableOpacity
                        key={tag}
                        onPress={() => {
                          setSelectedTag(tag);
                          setShowDropdownModal(false);
                        }}
                        style={[
                          styles.dropdownItem,
                          isSelected && { backgroundColor: colors.primary + '12' }
                        ]}
                      >
                        <View style={{ width: 16 }} />
                        <Typography variant="body" weight={isSelected ? 'bold' : 'regular'} style={{ flex: 1, color: colors.text }}>
                          {tag}
                        </Typography>
                        {isSelected && <Check color={colors.primary} size={18} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* LOCATION PICKER SEARCH MODAL */}
      <Modal visible={locationModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
            <View style={styles.modalHeader}>
              <Typography variant="subtitle" weight="bold">Search City / Birth Place</Typography>
              <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchBox, { backgroundColor: isDark ? '#1E1E26' : '#F1F5F9', borderColor: colors.border, borderWidth: 1 }]}>
              <Search color={colors.textSecondary} size={18} />
              <TextInput
                value={locationInput}
                onChangeText={setLocationInput}
                placeholder="Search city (e.g. Bhimavaram, Delhi)..."
                placeholderTextColor={colors.textSecondary}
                style={[styles.modalInput, { color: colors.text }]}
                autoFocus
              />
              {isSearchingLocation && (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 8 }} />
              )}
              {locationInput.length > 0 && !isSearchingLocation && (
                <TouchableOpacity onPress={() => { setLocationInput(''); setSuggestions([]); }}>
                  <X color={colors.textSecondary} size={16} />
                </TouchableOpacity>
              )}
            </View>

            <Typography variant="caption" color="muted" weight="bold" style={{ marginTop: 16, marginBottom: 8 }}>
              {suggestions.length > 0 ? 'Search Results' : 'Type to search...'}
            </Typography>

            <ScrollView style={{ maxHeight: 280 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {suggestions.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.quickLocItem, { borderBottomColor: colors.border }]}
                  onPress={() => handleSelectLocation(item)}
                >
                  <MapPin color={colors.primary} size={18} style={{ marginTop: 2 }} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Typography variant="body" weight="bold">{item.name}</Typography>
                    {item.fullName ? (
                      <Typography variant="caption" color="muted" numberOfLines={1}>
                        {item.fullName}
                      </Typography>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    marginBottom: 20,
    padding: 16,
  },
  formCard: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fieldContainer: {
    marginBottom: 14,
  },
  fieldLabel: {
    marginBottom: 6,
  },
  inputIconWrapper: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)',
    paddingBottom: 8,
  },
  catRow: {
    paddingVertical: 12,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  sortToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  calculateBtn: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  btnGradient: {
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 18,
    paddingVertical: 4,
  },
  infoSummaryCard: {
    marginBottom: 24,
  },
  predictionCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  predictionTrigger: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  predictionRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  naturePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.15)',
  },
  predictionContent: {
    padding: 16,
    gap: 12,
  },
  predTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  miniTagChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  descBox: {
    marginTop: 4,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  noResultsCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '80%',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 23,
  },
  modalInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  quickLocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },

  /* Scroll Pickers Styling */
  pickerModalContent: {
    borderRadius: 28,
    padding: 24,
    width: width - 40,
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  pickerColumnsRow: {
    flexDirection: 'row',
    height: 200,
    marginBottom: 20,
    gap: 8,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'stretch',
    borderRadius: 16,
    backgroundColor: 'rgba(150,150,150,0.05)',
    padding: 6,
  },
  pickerColHeader: {
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  pickerScrollView: {
    flex: 1,
  },
  pickerItem: {
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  pickerActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  pickerCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerConfirmBtn: {
    flex: 1.3,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
  },
  pickerBtnGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Related Bodies Comparison Box Styles */
  genderComparisonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  genderInfoBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
  },
  genderBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  verdictDetailBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 4,
  },
  verdictHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  dropdownSelector: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(150,150,150,0.02)',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 2,
  },
  takeawayHighlight: {
    borderLeftWidth: 3,
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 4,
  }
});
