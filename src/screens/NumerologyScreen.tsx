import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Dimensions, 
  TextInput, 
  Modal, 
  KeyboardAvoidingView, 
  Platform,
  Share,
  Alert,
  Text
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/Typography';
import { PremiumCard } from '../components/PremiumCard';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Sparkles, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  ChevronRight, 
  ChevronDown, 
  X, 
  Search, 
  Check, 
  AlertCircle,
  Share2,
  Compass,
  Star,
  User,
  HelpCircle,
  Globe
} from 'lucide-react-native';
import { searchLocationSuggestions, LocationItem } from '../services/locationService';
import { 
  getNumerologyReport, 
  getNumerologySignDetails,
  reduceToSingleDigit, 
  NumerologyRequest, 
  NumerologyResponse 
} from '../services/numerologyApi';

const { width } = Dimensions.get('window');

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
                          NUMEROLOGY SCREEN MAIN
   ========================================================================= */
export const NumerologyScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  // Screen Mode: 'input' or 'result'
  const [screenMode, setScreenMode] = useState<'input' | 'result'>('input');

  // Input states (Defaulting to user's example values)
  const [fullName, setFullName] = useState('IJJI MADHU VENKAT');
  const [firstName, setFirstName] = useState('Madhu');
  const [date, setDate] = useState('15/06/1990');
  const [time, setTime] = useState('12:00');
  const [locationName, setLocationName] = useState('Bhimavaram, Andhra Pradesh, India');
  const [lat, setLat] = useState(16.561);
  const [lng, setLng] = useState(81.520);
  const [ayanamsa, setAyanamsa] = useState('RAMAN');

  // Custom picker modals visibility
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);

  // Modal location search states
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [suggestions, setSuggestions] = useState<LocationItem[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  // API Call states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [numerologyData, setNumerologyData] = useState<NumerologyResponse | null>(null);

  // Results accordion expansion state
  const [expandedPredictions, setExpandedPredictions] = useState<{ [key: string]: boolean }>({});

  const togglePrediction = (name: string) => {
    setExpandedPredictions(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Automatically update first name when full name changes
  const handleFullNameChange = (text: string) => {
    setFullName(text);
    // extract first word and capitalize first letter
    const words = text.trim().split(/\s+/);
    if (words.length > 0 && words[0].length > 0) {
      const extracted = words[0];
      const capitalized = extracted.charAt(0).toUpperCase() + extracted.slice(1).toLowerCase();
      setFirstName(capitalized);
    } else {
      setFirstName('');
    }
  };

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

  // Handle Calculate Numerology Profile
  const handleCalculateNumerology = async () => {
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!firstName.trim()) {
      setErrorMsg('Please enter your first name.');
      return;
    }
    if (!locationName) {
      setErrorMsg('Please select your birth place.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    const stdTimeStr = `${time} ${date} +05:30`;

    const requestPayload: NumerologyRequest = {
      firstName: firstName.trim(),
      fullName: fullName.trim(),
      birthTime: stdTimeStr,
      locationName: locationName,
      latitude: lat,
      longitude: lng,
      ayanamsa: ayanamsa
    };

    try {
      const response = await getNumerologyReport(requestPayload);
      setNumerologyData(response);
      setScreenMode('result');
    } catch (err: any) {
      setErrorMsg(err.message || 'Combined Numerology calculation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to parse prediction HTML text to React Native components
  const renderPredictionText = (textStr: string) => {
    if (!textStr) return null;
    
    // Tokenize by strong tags
    // Matches: <strong style="color:green;"> or <strong style="color:red;"> or <strong>
    const regex = /(<strong[^>]*>.*?<\/strong>)/g;
    const parts = textStr.split(regex);
    
    return (
      <Text style={{ lineHeight: 24, fontSize: 15, color: colors.text }}>
        {parts.map((part, index) => {
          if (part.startsWith('<strong')) {
            const colorMatch = part.match(/color:(green|red)/);
            const color = colorMatch 
              ? (colorMatch[1] === 'green' ? '#10B981' : '#EF4444') 
              : colors.primary;
            
            const textMatch = part.match(/>(.*?)<\/strong>/);
            const content = textMatch ? textMatch[1] : '';
            
            return (
              <Text 
                key={index} 
                style={{ color, fontWeight: 'bold', fontSize: 15 }}
              >
                {content}
              </Text>
            );
          }
          
          let cleanText = part
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"');
          
          return (
            <Text key={index} style={{ color: colors.text, fontSize: 15 }}>
              {cleanText}
            </Text>
          );
        })}
      </Text>
    );
  };

  // Share handler
  const handleShareProfile = async () => {
    if (!numerologyData) return;
    
    try {
      const cleanPredictionText = numerologyData.namePredictionText
        .replace(/<[^>]*>/g, '') // remove HTML tags for plain text sharing
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"');

      const shareMessage = `🔮 Vedic Numerology Report for ${fullName.trim()} 🔮\n\n` +
        `• Name Number: ${numerologyData.namePredictionNumber} (Root: ${numerologyData.namePredictionRoot}, Ruler: ${numerologyData.namePredictionPlanet})\n` +
        `• Destiny Number: ${numerologyData.destinyNumber} (${destinySignDetails.title})\n\n` +
        `📖 Predictions:\n"${cleanPredictionText}"\n\n` +
        `Shared via Vedic Panchangam App`;

      await Share.share({
        message: shareMessage,
        title: `${fullName} Numerology Profile`,
      });
    } catch (error: any) {
      Alert.alert('Error', 'Unable to share numerology profile at this time.');
    }
  };

  // Derived attributes of the calculated numbers
  const nameSignDetails = React.useMemo(() => {
    if (!numerologyData) return { title: '', planet: '', desc: '' };
    // Use the parsed root number from the API prediction, or calculate locally
    const targetNum = numerologyData.namePredictionRoot || reduceToSingleDigit(numerologyData.nameNumber);
    return getNumerologySignDetails(targetNum);
  }, [numerologyData]);

  const destinySignDetails = React.useMemo(() => {
    if (!numerologyData) return { title: '', planet: '', desc: '' };
    return getNumerologySignDetails(numerologyData.destinyNumber);
  }, [numerologyData]);

  // Design tokens
  const textColor = colors.onPrimary || (isDark ? '#FFFFFF' : '#000000');
  const subTextColor = colors.onPrimary === '#FFFFFF' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.75)';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* App Header with Custom Back Button */}
      <View 
        style={[
          styles.headerContainer,
          {
            paddingTop: Math.max(insets.top, 16) + 10,
            backgroundColor: colors.primary,
          }
        ]}
      >
        <View style={styles.headerContentRow}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)' }]} 
            onPress={() => {
              if (screenMode === 'result') {
                setScreenMode('input');
              } else {
                navigation.goBack();
              }
            }}
            activeOpacity={0.7}
          >
            <ArrowLeft color={textColor} size={22} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Typography 
              variant="display" 
              style={[styles.headerTitleText, { color: textColor }]}
            >
              Vedic Numerology
            </Typography>
            <Typography 
              variant="caption" 
              style={[styles.headerSubtitleText, { color: subTextColor }]}
            >
              {screenMode === 'result' ? `Analysis for ${firstName}` : 'Discover the hidden power of names & dates'}
            </Typography>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          {errorMsg && (
            <PremiumCard style={styles.errorCard}>
              <AlertCircle color="#EF4444" size={20} />
              <Typography variant="body" weight="medium" style={{ color: '#EF4444', marginLeft: 10, flex: 1 }}>
                {errorMsg}
              </Typography>
            </PremiumCard>
          )}

          {screenMode === 'input' ? (
            /* =========================================================================
                                     INPUT VIEW: NUMEROLOGY FORM
               ========================================================================= */
            <View>
              {/* Card 1: Personal Details (Names) */}
              <PremiumCard style={styles.formCard}>
                <View style={styles.sectionHeaderRow}>
                  <User color={colors.primary} size={20} />
                  <Typography variant="subtitle" weight="bold" style={{ marginLeft: 10 }}>
                    Name Parameters
                  </Typography>
                </View>

                {/* Full Name field */}
                <View style={styles.fieldContainer}>
                  <Typography variant="caption" color="muted" weight="semibold" style={styles.fieldLabel}>
                    Full Name (for predictions)
                  </Typography>
                  <TextInput
                    style={[
                      styles.textInput, 
                      { 
                        color: colors.text, 
                        borderColor: colors.border,
                        backgroundColor: isDark ? '#1E1E26' : '#FFFFFF'
                      }
                    ]}
                    value={fullName}
                    onChangeText={handleFullNameChange}
                    placeholder="Enter your complete name"
                    placeholderTextColor={colors.textSecondary + '80'}
                    autoCapitalize="words"
                  />
                </View>

                {/* First Name field */}
                <View style={styles.fieldContainer}>
                  <Typography variant="caption" color="muted" weight="semibold" style={styles.fieldLabel}>
                    First Name (for name number)
                  </Typography>
                  <TextInput
                    style={[
                      styles.textInput, 
                      { 
                        color: colors.text, 
                        borderColor: colors.border,
                        backgroundColor: isDark ? '#1E1E26' : '#FFFFFF'
                      }
                    ]}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="First name only"
                    placeholderTextColor={colors.textSecondary + '80'}
                    autoCapitalize="words"
                  />
                </View>
              </PremiumCard>

              {/* Card 2: Birth Details (Date, Time, Location) */}
              <PremiumCard style={styles.formCard}>
                <View style={styles.sectionHeaderRow}>
                  <Clock color={colors.primary} size={20} style={{ transform: [{ scaleX: -1 }] }} />
                  <Typography variant="subtitle" weight="bold" style={{ marginLeft: 10 }}>
                    Birth Coordinates
                  </Typography>
                </View>

                <View style={styles.row}>
                  {/* Birth Date Picker */}
                  <View style={[styles.fieldContainer, { flex: 1, marginRight: 10 }]}>
                    <Typography variant="caption" color="muted" weight="semibold" style={styles.fieldLabel}>Birth Date</Typography>
                    <TouchableOpacity 
                      style={[styles.inputIconWrapper, { borderColor: colors.border }]}
                      onPress={() => setDatePickerVisible(true)}
                      activeOpacity={0.7}
                    >
                      <CalendarIcon color={colors.primary} size={18} style={{ marginRight: 8 }} />
                      <Typography variant="body" style={{ color: colors.text, flex: 1 }}>
                        {date}
                      </Typography>
                      <ChevronDown color={colors.textSecondary} size={14} />
                    </TouchableOpacity>
                  </View>

                  {/* Birth Time Picker */}
                  <View style={[styles.fieldContainer, { flex: 1 }]}>
                    <Typography variant="caption" color="muted" weight="semibold" style={styles.fieldLabel}>Birth Time</Typography>
                    <TouchableOpacity 
                      style={[styles.inputIconWrapper, { borderColor: colors.border }]}
                      onPress={() => setTimePickerVisible(true)}
                      activeOpacity={0.7}
                    >
                      <Clock color={colors.secondary} size={18} style={{ marginRight: 8 }} />
                      <Typography variant="body" style={{ color: colors.text, flex: 1 }}>
                        {time}
                      </Typography>
                      <ChevronDown color={colors.textSecondary} size={14} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Birth Location search trigger */}
                <View style={styles.fieldContainer}>
                  <Typography variant="caption" color="muted" weight="semibold" style={styles.fieldLabel}>Birth Place</Typography>
                  <TouchableOpacity 
                    style={[styles.inputIconWrapper, { borderColor: colors.border }]}
                    onPress={() => setLocationModalVisible(true)}
                    activeOpacity={0.7}
                  >
                    <MapPin color={colors.primary} size={18} style={{ marginRight: 8 }} />
                    <Typography variant="body" style={{ flex: 1, color: locationName ? colors.text : colors.textSecondary }} numberOfLines={1}>
                      {locationName}
                    </Typography>
                    <ChevronRight color={colors.textSecondary} size={18} />
                  </TouchableOpacity>
                  <Typography variant="caption" color="muted" style={{ fontSize: 10, marginTop: 4, fontStyle: 'italic' }}>
                    Coords: Lat {lat.toFixed(3)}, Lng {lng.toFixed(3)}
                  </Typography>
                </View>
              </PremiumCard>

              {/* Card 3: Ayanamsa Settings */}
              <PremiumCard style={styles.formCard}>
                <View style={styles.sectionHeaderRow}>
                  <Globe color={colors.primary} size={18} />
                  <Typography variant="subtitle" weight="bold" style={{ marginLeft: 10, flex: 1 }}>
                    Ayanamsa Calculation System
                  </Typography>
                </View>
                
                <Typography variant="caption" color="muted" style={{ marginBottom: 14 }}>
                  Select the Vedic mathematical system used to align planetary grids:
                </Typography>

                <View style={styles.ayanamsaRow}>
                  {['RAMAN', 'LAHIRI', 'KP'].map((item) => {
                    const isSelected = ayanamsa === item;
                    return (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.ayanamsaChip,
                          {
                            borderColor: isSelected ? colors.primary : colors.border,
                            backgroundColor: isSelected ? colors.primary + '18' : 'transparent'
                          }
                        ]}
                        onPress={() => setAyanamsa(item)}
                        activeOpacity={0.7}
                      >
                        <Typography variant="caption" weight={isSelected ? "bold" : "semibold"} style={{ color: isSelected ? colors.primary : colors.textSecondary }}>
                          {item}
                        </Typography>
                        {isSelected && <Check color={colors.primary} size={12} style={{ marginLeft: 4 }} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </PremiumCard>

              {/* ACTION CALL: SUBMIT */}
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Typography variant="body" weight="bold" style={{ marginTop: 14 }}>
                    Calculating Numerological Grids...
                  </Typography>
                  <Typography variant="caption" color="muted" style={{ marginTop: 4 }}>
                    Accessing Destiny & Name API metrics at api.vedastro.org...
                  </Typography>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleCalculateNumerology}
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
                      Calculate Numerology Profile
                    </Typography>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            /* =========================================================================
                                     RESULT VIEW: REPORT DISPLAY
               ========================================================================= */
            <View>
              {/* Back to Edit Input trigger */}
              <TouchableOpacity 
                style={styles.editBackBtn} 
                onPress={() => setScreenMode('input')}
                activeOpacity={0.7}
              >
                <ArrowLeft color={colors.primary} size={16} />
                <Typography variant="body" weight="semibold" color="primary" style={{ marginLeft: 6 }}>
                  Modify Inputs & Recalculate
                </Typography>
              </TouchableOpacity>

              {/* User Profile summary card */}
              <PremiumCard style={styles.resultSummaryCard}>
                <Typography variant="body" weight="bold" style={{ fontSize: 18, marginBottom: 4 }}>
                  {fullName.trim()}
                </Typography>
                <Typography variant="caption" color="muted">
                  Born {date} at {time} ({locationName})
                </Typography>
                <Typography variant="caption" color="primary" style={{ fontSize: 10, marginTop: 4, fontWeight: 'bold' }}>
                  AYANAMSA SYSTEM: {ayanamsa}
                </Typography>
              </PremiumCard>

              {/* Core numbers display (Side-by-side) */}
              <View style={styles.numberGridRow}>
                {/* Name Number Card */}
                <PremiumCard style={[styles.numberCard, { borderColor: colors.primary + '30' }]}>
                  <View style={styles.numberBadgeWrapper}>
                    <LinearGradient
                      colors={['#7A1124', '#D4AF37']}
                      style={styles.numberCircle}
                    >
                      <Typography style={styles.numberText}>
                        {numerologyData?.namePredictionNumber || numerologyData?.nameNumber}
                      </Typography>
                    </LinearGradient>
                  </View>
                  <Typography variant="body" weight="bold" style={{ marginTop: 10, textAlign: 'center' }}>
                    Name Number (Root: {numerologyData?.namePredictionRoot})
                  </Typography>
                  <Typography variant="caption" color="muted" style={{ fontSize: 11, textAlign: 'center', marginTop: 2 }}>
                    Chaldean Vibration
                  </Typography>
                  <View style={[styles.planetPill, { backgroundColor: colors.primary + '18' }]}>
                    <Typography variant="caption" style={{ color: colors.primary, fontSize: 10, fontWeight: 'bold' }}>
                      Ruler: {numerologyData?.namePredictionPlanet || nameSignDetails.planet}
                    </Typography>
                  </View>
                </PremiumCard>

                {/* Destiny Number Card */}
                <PremiumCard style={[styles.numberCard, { borderColor: colors.secondary + '30' }]}>
                  <View style={styles.numberBadgeWrapper}>
                    <LinearGradient
                      colors={['#1E293B', colors.secondary]}
                      style={styles.numberCircle}
                    >
                      <Typography style={styles.numberText}>{numerologyData?.destinyNumber}</Typography>
                    </LinearGradient>
                  </View>
                  <Typography variant="body" weight="bold" style={{ marginTop: 10, textAlign: 'center' }}>
                    Destiny Number
                  </Typography>
                  <Typography variant="caption" color="muted" style={{ fontSize: 11, textAlign: 'center', marginTop: 2 }}>
                    Birthdate Vibration
                  </Typography>
                  <View style={[styles.planetPill, { backgroundColor: colors.secondary + '18' }]}>
                    <Typography variant="caption" style={{ color: colors.secondary, fontSize: 10, fontWeight: 'bold' }}>
                      Ruler: {destinySignDetails.planet}
                    </Typography>
                  </View>
                </PremiumCard>
              </View>

              {/* Vedic Numerology Predictions */}
              <PremiumCard style={{ marginBottom: 16, padding: 18, borderWidth: 1.5, borderColor: 'rgba(212, 175, 55, 0.25)' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(212,175,55,0.15)', justifyContent: 'center', alignItems: 'center' }}>
                    <Sparkles color={colors.primary} size={20} />
                  </View>
                  <Typography variant="subtitle" weight="bold" style={{ marginLeft: 12 }}>
                    Vedic Numerology Analysis
                  </Typography>
                </View>

                {renderPredictionText(numerologyData?.namePredictionText || '')}
              </PremiumCard>

              {/* Life Aspect Vibrations Summary */}
              {numerologyData?.predictionSummary && (
                <PremiumCard style={{ marginBottom: 16, padding: 18 }}>
                  <Typography variant="body" weight="bold" style={{ marginBottom: 16 }}>
                    Life Aspect Vibration Summary
                  </Typography>

                  {Object.entries(numerologyData.predictionSummary).map(([key, val]) => {
                    const numVal = Number(val) || 0;
                    return (
                      <View key={key} style={{ marginBottom: 14 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                          <Typography variant="caption" weight="medium">
                            {key}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            weight="bold" 
                            style={{ color: numVal >= 0 ? '#10B981' : '#EF4444' }}
                          >
                            {numVal >= 0 ? `+${numVal}%` : `${numVal}%`}
                          </Typography>
                        </View>

                        {/* Split progress bar representation */}
                        <View 
                          style={{ 
                            height: 8, 
                            borderRadius: 4, 
                            backgroundColor: isDark ? '#1E1E26' : '#E2E8F0', 
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          {/* Center dividing line (0 score) */}
                          <View 
                            style={{ 
                              position: 'absolute', 
                              left: '50%', 
                              top: 0, 
                              bottom: 0, 
                              width: 1, 
                              backgroundColor: isDark ? '#3E3E4A' : '#CBD5E1', 
                              zIndex: 2
                            }} 
                          />

                          {/* Colored bar fill */}
                          {numVal >= 0 ? (
                            <View 
                              style={{ 
                                position: 'absolute', 
                                left: '50%', 
                                width: `${Math.min(numVal / 2, 50)}%`, // map 0-100 to 0-50%
                                top: 0, 
                                bottom: 0, 
                                backgroundColor: '#10B981', 
                                borderTopRightRadius: 4,
                                borderBottomRightRadius: 4
                              }} 
                            />
                          ) : (
                            <View 
                              style={{ 
                                position: 'absolute', 
                                right: '50%', 
                                width: `${Math.min(Math.abs(numVal) / 2, 50)}%`, // map 0-100 to 0-50%
                                top: 0, 
                                bottom: 0, 
                                backgroundColor: '#EF4444', 
                                borderTopLeftRadius: 4,
                                borderBottomLeftRadius: 4
                              }} 
                            />
                          )}
                        </View>
                      </View>
                    );
                  })}
                </PremiumCard>
              )}

              {/* Core Astrological Traits & Interpretations */}
              <Typography variant="subtitle" weight="bold" style={{ marginBottom: 12, marginTop: 10 }}>
                Astrological Traits
              </Typography>

              {/* Name Traits Card */}
              <PremiumCard style={styles.traitCard}>
                <View style={styles.traitHeader}>
                  <Star color={colors.primary} size={18} />
                  <Typography variant="body" weight="bold" style={{ marginLeft: 8 }}>
                    Name Number {numerologyData?.namePredictionRoot || reduceToSingleDigit(numerologyData?.nameNumber || 1)}: {nameSignDetails.title}
                  </Typography>
                </View>
                <Typography variant="body" color="muted" style={styles.traitDesc}>
                  {nameSignDetails.desc}
                </Typography>
              </PremiumCard>

              {/* Destiny Traits Card */}
              <PremiumCard style={styles.traitCard}>
                <View style={styles.traitHeader}>
                  <Compass color={colors.secondary} size={18} />
                  <Typography variant="body" weight="bold" style={{ marginLeft: 8 }}>
                    Destiny Number {numerologyData?.destinyNumber || 1}: {destinySignDetails.title}
                  </Typography>
                </View>
                <Typography variant="body" color="muted" style={styles.traitDesc}>
                  {destinySignDetails.desc}
                </Typography>
              </PremiumCard>

              {numerologyData?.isFallback && (
                <View style={[styles.fallbackAlert, { marginTop: 10, marginBottom: 16 }]}>
                  <Typography variant="caption" color="muted" style={{ fontStyle: 'italic', fontSize: 11 }}>
                    Calculations validated locally using Chaldean numerological formulas.
                  </Typography>
                </View>
              )}

              {/* Action Buttons Row */}
              <View style={styles.actionRowContainer}>
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                  onPress={handleShareProfile}
                  activeOpacity={0.8}
                >
                  <Share2 color={textColor} size={18} style={{ marginRight: 8 }} />
                  <Typography variant="body" weight="semibold" style={{ color: textColor }}>
                    Share Report
                  </Typography>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.outlineBtn, { borderColor: colors.border }]}
                  onPress={() => setScreenMode('input')}
                  activeOpacity={0.8}
                >
                  <Typography variant="body" weight="semibold">
                    Recalculate
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* =========================================================================
                                CUSTOM LOCATION SELECTION MODAL
         ========================================================================= */}
      <Modal visible={locationModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Typography variant="subtitle" weight="bold">Search Birth Place</Typography>
              <TouchableOpacity onPress={() => setLocationModalVisible(false)} style={styles.closeBtn}>
                <X color={colors.text} size={20} />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchBox, { backgroundColor: isDark ? '#1E1E26' : '#F1F5F9', borderColor: colors.border, borderWidth: 1 }]}>
              <Search color={colors.textSecondary} size={18} />
              <TextInput
                style={[styles.modalInput, { color: colors.text }]}
                placeholder="Search city e.g. Bhimavaram"
                placeholderTextColor={colors.textSecondary + '80'}
                value={locationInput}
                onChangeText={setLocationInput}
                autoFocus
              />
              {locationInput.length > 0 && (
                <TouchableOpacity onPress={() => setLocationInput('')}>
                  <X color={colors.textSecondary} size={16} />
                </TouchableOpacity>
              )}
            </View>

            {isSearchingLocation ? (
              <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                <ActivityIndicator color={colors.primary} size="small" />
                <Typography variant="caption" color="muted" style={{ marginTop: 8 }}>
                  Searching geographical databases...
                </Typography>
              </View>
            ) : (
              <ScrollView style={{ marginTop: 14 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {suggestions.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.quickLocItem, { borderBottomColor: colors.border + '20' }]}
                    onPress={() => handleSelectLocation(item)}
                  >
                    <MapPin color={colors.primary} size={16} style={{ marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                      <Typography variant="body" weight="medium">{item.name}</Typography>
                      <Typography variant="caption" color="muted" style={{ fontSize: 11, marginTop: 2 }}>
                        {item.fullName}
                      </Typography>
                    </View>
                  </TouchableOpacity>
                ))}

                {suggestions.length === 0 && locationInput.trim().length >= 2 && (
                  <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                    <Typography variant="caption" color="muted">
                      No matching locations found.
                    </Typography>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* CUSTOM DATE/TIME PICKER OVERLAYS */}
      <CustomDatePickerModal
        visible={datePickerVisible}
        value={date}
        onSelect={setDate}
        onClose={() => setDatePickerVisible(false)}
      />
      <CustomTimePickerModal
        visible={timePickerVisible}
        value={time}
        onSelect={setTime}
        onClose={() => setTimePickerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  headerContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitleText: {
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#EF4444',
    borderWidth: 1.5,
    marginBottom: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  formCard: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
  },
  inputIconWrapper: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  ayanamsaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ayanamsaChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
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
  editBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultSummaryCard: {
    marginBottom: 16,
  },
  numberGridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  numberCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  numberBadgeWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberCircle: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  planetPill: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  traitCard: {
    marginBottom: 12,
  },
  traitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  traitDesc: {
    fontSize: 14,
    lineHeight: 21,
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
  predictionContent: {
    padding: 16,
    gap: 12,
  },
  predTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  miniTagChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  fallbackAlert: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingTop: 10,
    marginTop: 14,
  },
  actionRowContainer: {
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  outlineBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
  },

  /* Custom Modals Styling */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeBtn: {
    padding: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 24,
    marginBottom: 10,
  },
  modalInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    paddingVertical: 8,
  },
  quickLocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },

  /* Scroll Pickers Grid */
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
});
