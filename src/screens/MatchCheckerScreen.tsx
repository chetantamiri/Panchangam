import React, { useState, useEffect, useMemo } from 'react';
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
  Platform 
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/Typography';
import { PremiumCard } from '../components/PremiumCard';
import { AppHeader } from '../components/AppHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Heart, 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  X, 
  Search, 
  ArrowLeft, 
  AlertCircle, 
  Info,
  Sliders,
  User,
  Compass,
  Grid
} from 'lucide-react-native';
import { searchLocationSuggestions, LocationItem } from '../services/locationService';
import { SvgXml } from 'react-native-svg';
import { getSouthIndianChart } from '../services/vedAstroApi';

const inlineSvgStyles = (rawSvg: string): string => {
  if (!rawSvg) return '';

  let processedSvg = rawSvg;

  // Remove XML declarations, DOCTYPEs, and HTML comments
  processedSvg = processedSvg.replace(/<\?xml[\s\S]*?\?>/gi, '');
  processedSvg = processedSvg.replace(/<!DOCTYPE[\s\S]*?>/gi, '');
  processedSvg = processedSvg.replace(/<!--[\s\S]*?-->/g, '');

  // 1. Extract styles from style tags
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let styleMatch;
  const classStyles: Record<string, Record<string, string>> = {};

  while ((styleMatch = styleRegex.exec(rawSvg)) !== null) {
    const styleContent = styleMatch[1].replace(/\/\*[\s\S]*?\*\//g, ''); // remove comments
    
    // Regex to match selector and block: Selector { Rules }
    const ruleBlockRegex = /([^{]+)\{([^}]+)\}/g;
    let ruleBlockMatch;
    
    while ((ruleBlockMatch = ruleBlockRegex.exec(styleContent)) !== null) {
      const selectors = ruleBlockMatch[1].split(',');
      const block = ruleBlockMatch[2];
      
      // Parse block declarations
      const declarations = block.split(';');
      const rules: Record<string, string> = {};
      declarations.forEach(decl => {
        const parts = decl.split(':');
        if (parts.length === 2) {
          const prop = parts[0].trim().toLowerCase();
          const val = parts[1].trim();
          if (prop && val) {
            rules[prop] = val;
          }
        }
      });
      
      // Map rules to each class found in the selectors
      selectors.forEach(sel => {
        const trimmedSel = sel.trim();
        const classMatchRegex = /\.([a-zA-Z0-9_-]+)/g;
        let classMatch;
        while ((classMatch = classMatchRegex.exec(trimmedSel)) !== null) {
          const className = classMatch[1];
          classStyles[className] = { ...(classStyles[className] || {}), ...rules };
        }
      });
    }
  }

  // 2. Fallback mappings for standard VedAstro D-charts in case stylesheet parsing fails
  const fallbackStyles: Record<string, Record<string, string>> = {
    K: { fill: '#fdfefd' },
    L: { fill: '#ffffff' },
    M: { fill: '#9e6b2b' },
    N: { fill: '#fcfaf8' },
    O: { fill: '#945f25' },
    P: { fill: '#ad8957' }
  };

  // Merge fallbacks with parsed styles
  const mergedStyles = { ...fallbackStyles, ...classStyles };

  // 3. Replace class="..." with inline attributes
  const classAttrRegex = /class=["']([a-zA-Z0-9_-]+)["']/g;
  processedSvg = processedSvg.replace(classAttrRegex, (match, className) => {
    const rules = mergedStyles[className];
    if (rules) {
      const inlineAttrs = Object.entries(rules)
        .map(([prop, val]) => `${prop}="${val}"`)
        .join(' ');
      return inlineAttrs;
    }
    return match;
  });

  // 4. Strip the <style> tags completely to prevent react-native-svg parser crashes
  processedSvg = processedSvg.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  return processedSvg;
};

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
  const years = Array.from({ length: 80 }, (_, i) => 2026 - i); // 2026 down to 1947

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
                          MAIN MATCH CHECKER SCREEN
   ========================================================================= */
export const MatchCheckerScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();

  // Mode: 'input' or 'result'
  const [screenMode, setScreenMode] = useState<'input' | 'result'>('input');

  // Input states (Pre-filled with user's example values)
  const [maleName, setMaleName] = useState('Male Chart');
  const [maleDate, setMaleDate] = useState('15/06/1990');
  const [maleTime, setMaleTime] = useState('12:00');
  const [maleLocation, setMaleLocation] = useState('Bhimavaram, Andhra Pradesh, India');
  const [maleLat, setMaleLat] = useState(16.561);
  const [maleLng, setMaleLng] = useState(81.52);

  const [femaleName, setFemaleName] = useState('Female Chart');
  const [femaleDate, setFemaleDate] = useState('15/06/1990');
  const [femaleTime, setFemaleTime] = useState('12:00');
  const [femaleLocation, setFemaleLocation] = useState('Bhimavaram, Andhra Pradesh, India');
  const [femaleLat, setFemaleLat] = useState(16.561);
  const [femaleLng, setFemaleLng] = useState(81.52);


  // Custom picker modals visibility
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<'male' | 'female'>('male');
  
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState<'male' | 'female'>('male');

  // Modal location search states
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationModalTarget, setLocationModalTarget] = useState<'male' | 'female'>('male');
  const [locationInput, setLocationInput] = useState('');
  const [suggestions, setSuggestions] = useState<LocationItem[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  // API Call state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<any>(null);
  const [maleRemedies, setMaleRemedies] = useState<any>(null);
  const [femaleRemedies, setFemaleRemedies] = useState<any>(null);
  const [resultTab, setResultTab] = useState<'match' | 'remedies'>('match');
  const [remedyPerson, setRemedyPerson] = useState<'male' | 'female'>('male');
  const [maleD1Svg, setMaleD1Svg] = useState<string | null>(null);
  const [maleD9Svg, setMaleD9Svg] = useState<string | null>(null);
  const [femaleD1Svg, setFemaleD1Svg] = useState<string | null>(null);
  const [femaleD9Svg, setFemaleD9Svg] = useState<string | null>(null);
  const [chartD1D9Tab, setChartD1D9Tab] = useState<'d1' | 'd9'>('d1');

  // Result display states
  const [expandedPredictions, setExpandedPredictions] = useState<{ [key: string]: boolean }>({});
  const [natureFilter, setNatureFilter] = useState<'All' | 'Good' | 'Neutral' | 'Bad'>('All');

  // Debounced location autocomplete search
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

  // Open location search
  const openLocationPicker = (target: 'male' | 'female') => {
    setLocationModalTarget(target);
    setLocationInput(target === 'male' ? maleLocation : femaleLocation);
    setLocationModalVisible(true);
  };

  // Select location item
  const handleSelectLocation = (item: LocationItem) => {
    if (locationModalTarget === 'male') {
      setMaleLocation(item.name);
      setMaleLat(item.latitude);
      setMaleLng(item.longitude);
    } else {
      setFemaleLocation(item.name);
      setFemaleLat(item.latitude);
      setFemaleLng(item.longitude);
    }
    setLocationModalVisible(false);
    setSuggestions([]);
  };

  // Open picker actions
  const openDatePicker = (target: 'male' | 'female') => {
    setDatePickerTarget(target);
    setDatePickerVisible(true);
  };

  const openTimePicker = (target: 'male' | 'female') => {
    setTimePickerTarget(target);
    setTimePickerVisible(true);
  };

  // Validate inputs and call API
  const handleCalculateMatch = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    const formatDateToYYYYMMDD = (dateStr: string): string => {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return dateStr;
    };

    const getTzOffset = (longitude: number) => {
      if (longitude === undefined || longitude === null || isNaN(Number(longitude))) {
        return '+05:30';
      }
      const longNum = Number(longitude);
      const offsetHours = longNum / 15;
      const totalMins = Math.round(offsetHours * 60);
      const sign = totalMins >= 0 ? '+' : '-';
      const absMins = Math.abs(totalMins);
      const h = String(Math.floor(absMins / 60)).padStart(2, '0');
      const m = String(absMins % 60).padStart(2, '0');
      return `${sign}${h}:${m}`;
    };

    const buildStdTime = (dateStr: string, timeStr: string, lng: number) => {
      const parts = dateStr.split('-');
      if (parts.length !== 3) return '';
      const [year, month, day] = parts;
      return `${timeStr} ${day}/${month}/${year} ${getTzOffset(lng)}`;
    };

    const d1 = formatDateToYYYYMMDD(maleDate);
    const d2 = formatDateToYYYYMMDD(femaleDate);
    
    const maleStdTime = buildStdTime(d1, maleTime, maleLng);
    const femaleStdTime = buildStdTime(d2, femaleTime, femaleLng);
    
    const compatibilityUrl = `https://openkundali.com/api/v1/compatibility?date1=${d1}&time1=${maleTime}&lat1=${maleLat}&lon1=${maleLng}&date2=${d2}&time2=${femaleTime}&lat2=${femaleLat}&lon2=${femaleLng}`;
    const maleRemediesUrl = `https://openkundali.com/api/v1/remedies?date=${d1}&time=${maleTime}&lat=${maleLat}&lon=${maleLng}`;
    const femaleRemediesUrl = `https://openkundali.com/api/v1/remedies?date=${d2}&time=${femaleTime}&lat=${femaleLat}&lon=${femaleLng}`;

    try {
      console.log('[OpenKundali & VedAstro] Fetching compatibility, remedies, and South Indian D1 & D9 charts in parallel...');
      
      const [
        compatibilityRes, 
        maleRemediesRes, 
        femaleRemediesRes, 
        maleD1Res, 
        maleD9Res, 
        femaleD1Res, 
        femaleD9Res
      ] = await Promise.all([
        fetch(compatibilityUrl).then(r => r.ok ? r.json() : null),
        fetch(maleRemediesUrl).then(r => r.ok ? r.json() : null),
        fetch(femaleRemediesUrl).then(r => r.ok ? r.json() : null),
        getSouthIndianChart({
          Time: {
            StdTime: maleStdTime,
            Location: { Name: maleLocation || 'Bhimavaram, Andhra Pradesh, India', Latitude: Number(maleLat) || 16.561, Longitude: Number(maleLng) || 81.52 }
          },
          ChartType: 'RasiD1',
          Ayanamsa: 'LAHIRI'
        }).catch(err => {
          console.warn('Male D1 chart fetch failed:', err);
          return null;
        }),
        getSouthIndianChart({
          Time: {
            StdTime: maleStdTime,
            Location: { Name: maleLocation || 'Bhimavaram, Andhra Pradesh, India', Latitude: Number(maleLat) || 16.561, Longitude: Number(maleLng) || 81.52 }
          },
          ChartType: 'NavamshaD9',
          Ayanamsa: 'LAHIRI'
        }).catch(err => {
          console.warn('Male D9 chart fetch failed:', err);
          return null;
        }),
        getSouthIndianChart({
          Time: {
            StdTime: femaleStdTime,
            Location: { Name: femaleLocation || 'Bhimavaram, Andhra Pradesh, India', Latitude: Number(femaleLat) || 16.561, Longitude: Number(femaleLng) || 81.52 }
          },
          ChartType: 'RasiD1',
          Ayanamsa: 'LAHIRI'
        }).catch(err => {
          console.warn('Female D1 chart fetch failed:', err);
          return null;
        }),
        getSouthIndianChart({
          Time: {
            StdTime: femaleStdTime,
            Location: { Name: femaleLocation || 'Bhimavaram, Andhra Pradesh, India', Latitude: Number(femaleLat) || 16.561, Longitude: Number(femaleLng) || 81.52 }
          },
          ChartType: 'NavamshaD9',
          Ayanamsa: 'LAHIRI'
        }).catch(err => {
          console.warn('Female D9 chart fetch failed:', err);
          return null;
        })
      ]);

      if (compatibilityRes && compatibilityRes.ashtakoota) {
        setMatchData(compatibilityRes);
        setMaleRemedies(maleRemediesRes);
        setFemaleRemedies(femaleRemediesRes);
        setMaleD1Svg(maleD1Res);
        setMaleD9Svg(maleD9Res);
        setFemaleD1Svg(femaleD1Res);
        setFemaleD9Svg(femaleD9Res);
        setResultTab('match'); // reset to match tab initially
        setScreenMode('result');
      } else {
        throw new Error('Invalid response structure from compatibility API.');
      }
    } catch (err: any) {
      console.error('[Compatibility calculation failed] Error:', err);
      setErrorMsg(err.message || 'API request failed. Please check your internet connection.');
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

  // Filtered prediction list
  const filteredPredictions = useMemo(() => {
    if (matchData?.ashtakoota?.kootas) {
      // If we are using OpenKundali API
      const list: any[] = [];
      
      // 1. Add Doshas as parameters
      if (Array.isArray(matchData.ashtakoota.doshas)) {
        matchData.ashtakoota.doshas.forEach((d: string) => {
          const parts = d.split(' — ');
          const title = parts[0] || 'Dosha Alert';
          const desc = parts[1] || d;
          list.push({
            Name: title,
            Description: desc,
            Nature: 'Bad',
            Score: null,
            MaleInfo: matchData.person1?.moonSign ? `Moon Sign: ${matchData.person1.moonSign}` : null,
            FemaleInfo: matchData.person2?.moonSign ? `Moon Sign: ${matchData.person2.moonSign}` : null,
            Info: d
          });
        });
      }

      // 2. Add Synastry Highlights
      if (matchData.synastry?.highlights && Array.isArray(matchData.synastry.highlights)) {
        matchData.synastry.highlights.forEach((h: any) => {
          list.push({
            Name: h.label || 'Synastry Detail',
            Description: h.description,
            Nature: h.quality === 'positive' ? 'Good' : h.quality === 'negative' ? 'Bad' : 'Neutral',
            Score: null,
            MaleInfo: null,
            FemaleInfo: null,
            Info: h.description
          });
        });
      }

      // Filter by Nature
      if (natureFilter === 'All') return list;
      return list.filter(item => item.Nature === natureFilter);
    }

    if (!matchData?.PredictionList) return [];
    
    return matchData.PredictionList.filter((item: any) => {
      if (!item.Name || item.Name === 'Empty' || item.Nature === 'Empty') return false;
      
      if (natureFilter === 'All') return true;
      return item.Nature === natureFilter;
    });
  }, [matchData, natureFilter]);

  // Color mapping based on compatibility nature
  const getNatureColor = (nature: string) => {
    switch (nature?.toLowerCase()) {
      case 'good': return '#10B981'; // green
      case 'bad': return '#EF4444'; // red
      case 'neutral': return '#F59E0B'; // amber
      default: return colors.textSecondary;
    }
  };

  const getNatureBgColor = (nature: string) => {
    switch (nature?.toLowerCase()) {
      case 'good': return isDark ? 'rgba(16, 185, 129, 0.08)' : '#EAFCEF';
      case 'bad': return isDark ? 'rgba(239, 68, 68, 0.08)' : '#FDECEB';
      case 'neutral': return isDark ? 'rgba(245, 158, 11, 0.08)' : '#FEF8EA';
      default: return isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    }
  };

  // Parse Ashtakoota details from embeddings and predictionList
  const ashtakootaTable = useMemo(() => {
    if (!matchData) return [];
    
    // If using the new OpenKundali response format
    if (matchData.ashtakoota?.kootas) {
      return matchData.ashtakoota.kootas.map((k: any) => {
        return {
          name: k.name,
          desc: k.description || '',
          male: '-',
          female: '-',
          max: k.maxPoints || 0,
          received: k.scored || 0
        };
      });
    }

    const embeddings = matchData.Embeddings || [];
    
    const kootaSpecs = [
      { name: 'Varna', max: 1, embeddingIndex: 6, queries: ['varna'], desc: 'Work / Natural Refinement' },
      { name: 'Vashya', max: 2, embeddingIndex: 7, queries: ['vasya kuta', 'vashya'], desc: 'Attraction / Magnetism' },
      { name: 'Swati / Dina (Tara)', max: 3, embeddingIndex: 5, queries: ['dina kuta', 'tara', 'dina'], desc: 'Comfort - Prosperity - Health' },
      { name: 'Yoni', max: 4, embeddingIndex: 3, queries: ['yoni kuta', 'yoni'], desc: 'Intimate Physical Alignment' },
      { name: 'Maitri', max: 5, embeddingIndex: 4, queries: ['graha maitram', 'maitri'], desc: 'Friendship & Planetary Lords' },
      { name: 'Gan', max: 6, embeddingIndex: 1, queries: ['guna kuta', 'gana', 'guna'], desc: 'Temperament compatibility' },
      { name: 'Bhakut', max: 7, embeddingIndex: 2, queries: ['rasi kuta', 'bhakut'], desc: 'Constructive Ability / Rasi' },
      { name: 'Nadi', max: 8, embeddingIndex: 0, queries: ['nadi kuta', 'nadi'], desc: 'Progeny / Biological Energy' },
    ];
    
    const findPrediction = (queries: string[]) => {
      if (!matchData.PredictionList) return null;
      return matchData.PredictionList.find((p: any) => 
        queries.some(q => p.Name?.toLowerCase().includes(q))
      );
    };

    const cleanAttrValue = (val: string) => {
      if (!val) return '-';
      return val.split(' ')[0].replace('Human', '').trim();
    };

    return kootaSpecs.map(k => {
      const pred = findPrediction(k.queries);
      const score = typeof embeddings[k.embeddingIndex] === 'number' 
        ? embeddings[k.embeddingIndex] 
        : (pred?.Score || 0);

      return {
        name: k.name,
        desc: k.desc,
        male: pred ? cleanAttrValue(pred.MaleInfo) : '-',
        female: pred ? cleanAttrValue(pred.FemaleInfo) : '-',
        max: k.max,
        received: score
      };
    });
  }, [matchData]);

  const ashtakootaTotal = useMemo(() => {
    if (matchData?.ashtakoota?.totalScore !== undefined) {
      return matchData.ashtakoota.totalScore;
    }
    return ashtakootaTable.reduce((sum: number, item: any) => sum + item.received, 0);
  }, [ashtakootaTable, matchData]);

  const matchVerdict = useMemo(() => {
    if (matchData?.ashtakoota?.verdict) {
      const verdict = matchData.ashtakoota.verdict;
      let color = '#EF4444';
      if (ashtakootaTotal >= 28) color = '#10B981';
      else if (ashtakootaTotal >= 18) color = '#F59E0B';
      return { 
        status: verdict.toUpperCase(), 
        color: color, 
        summary: `OpenKundali compatibility verdict: ${verdict}` 
      };
    }
    if (ashtakootaTotal >= 28) {
      return { status: 'EXCELLENT', color: '#10B981', summary: 'Excellent compatibility, highly auspicious match!' };
    }
    if (ashtakootaTotal >= 18) {
      return { status: 'PASS / GOOD', color: '#F59E0B', summary: 'Favourable compatibility, recommended to proceed.' };
    }
    return { status: 'FAIL / POOR', color: '#EF4444', summary: 'Critical mismatches in key areas (e.g. Nadi or Bhakut).' };
  }, [ashtakootaTotal, matchData]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader 
        title="Kundali Match Checker" 
        subtitle="Vedic Horoscope Matching (Guna Milan)"
        onMenuPress={() => navigation?.navigate('Menu')}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {screenMode === 'input' ? (
            /* =========================================================================
                                     INPUT VIEW: BIRTH FORMS
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

              {/* MALE CARD */}
              <PremiumCard style={styles.personCard}>
                <View style={styles.personHeader}>
                  <View style={[styles.genderBadge, { backgroundColor: isDark ? 'rgba(3,105,161,0.2)' : '#E0F2FE' }]}>
                    <Typography variant="caption" weight="bold" style={{ color: '#0369A1' }}>MALE</Typography>
                  </View>
                  <Typography variant="subtitle" weight="bold" style={{ marginLeft: 12 }}>Male Birth Details</Typography>
                </View>

                {/* Name Input */}
                <View style={styles.fieldContainer}>
                  <Typography variant="caption" color="muted" weight="semibold" style={styles.fieldLabel}>Name</Typography>
                  <TextInput
                    value={maleName}
                    onChangeText={setMaleName}
                    placeholder="Enter name"
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                  />
                </View>

                {/* Date & Time Row */}
                <View style={styles.row}>
                  <View style={[styles.fieldContainer, { flex: 1, marginRight: 10 }]}>
                    <Typography variant="caption" color="muted" weight="semibold" style={styles.fieldLabel}>Birth Date</Typography>
                    <TouchableOpacity 
                      style={[styles.inputIconWrapper, { borderColor: colors.border }]}
                      onPress={() => openDatePicker('male')}
                      activeOpacity={0.7}
                    >
                      <CalendarIcon color={colors.primary} size={18} style={{ marginRight: 8 }} />
                      <Typography variant="body" style={{ color: colors.text, flex: 1 }}>
                        {maleDate || 'Select Date'}
                      </Typography>
                      <ChevronDown color={colors.textSecondary} size={14} />
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.fieldContainer, { flex: 1 }]}>
                    <Typography variant="caption" color="muted" weight="semibold" style={styles.fieldLabel}>Birth Time</Typography>
                    <TouchableOpacity 
                      style={[styles.inputIconWrapper, { borderColor: colors.border }]}
                      onPress={() => openTimePicker('male')}
                      activeOpacity={0.7}
                    >
                      <Clock color={colors.secondary} size={18} style={{ marginRight: 8 }} />
                      <Typography variant="body" style={{ color: colors.text, flex: 1 }}>
                        {maleTime || 'Select Time'}
                      </Typography>
                      <ChevronDown color={colors.textSecondary} size={14} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Location Picker */}
                <View style={styles.fieldContainer}>
                  <Typography variant="caption" color="muted" weight="semibold" style={styles.fieldLabel}>Birth Place</Typography>
                  <TouchableOpacity 
                    style={[styles.inputIconWrapper, { borderColor: colors.border }]}
                    onPress={() => openLocationPicker('male')}
                    activeOpacity={0.7}
                  >
                    <MapPin color={colors.primary} size={18} style={{ marginRight: 8 }} />
                    <Typography variant="body" style={{ flex: 1, color: maleLocation ? colors.text : colors.textSecondary }} numberOfLines={1}>
                      {maleLocation || 'Select location'}
                    </Typography>
                    <ChevronRight color={colors.textSecondary} size={18} />
                  </TouchableOpacity>
                </View>
              </PremiumCard>

              {/* FEMALE CARD */}
              <PremiumCard style={styles.personCard}>
                <View style={styles.personHeader}>
                  <View style={[styles.genderBadge, { backgroundColor: isDark ? 'rgba(190,24,93,0.2)' : '#FCE7F3' }]}>
                    <Typography variant="caption" weight="bold" style={{ color: '#BE185D' }}>FEMALE</Typography>
                  </View>
                  <Typography variant="subtitle" weight="bold" style={{ marginLeft: 12 }}>Female Birth Details</Typography>
                </View>

                {/* Name Input */}
                <View style={styles.fieldContainer}>
                  <Typography variant="caption" color="muted" weight="semibold" style={styles.fieldLabel}>Name</Typography>
                  <TextInput
                    value={femaleName}
                    onChangeText={setFemaleName}
                    placeholder="Enter name"
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                  />
                </View>

                {/* Date & Time Row */}
                <View style={styles.row}>
                  <View style={[styles.fieldContainer, { flex: 1, marginRight: 10 }]}>
                    <Typography variant="caption" color="muted" weight="semibold" style={styles.fieldLabel}>Birth Date</Typography>
                    <TouchableOpacity 
                      style={[styles.inputIconWrapper, { borderColor: colors.border }]}
                      onPress={() => openDatePicker('female')}
                      activeOpacity={0.7}
                    >
                      <CalendarIcon color={colors.primary} size={18} style={{ marginRight: 8 }} />
                      <Typography variant="body" style={{ color: colors.text, flex: 1 }}>
                        {femaleDate || 'Select Date'}
                      </Typography>
                      <ChevronDown color={colors.textSecondary} size={14} />
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.fieldContainer, { flex: 1 }]}>
                    <Typography variant="caption" color="muted" weight="semibold" style={styles.fieldLabel}>Birth Time</Typography>
                    <TouchableOpacity 
                      style={[styles.inputIconWrapper, { borderColor: colors.border }]}
                      onPress={() => openTimePicker('female')}
                      activeOpacity={0.7}
                    >
                      <Clock color={colors.secondary} size={18} style={{ marginRight: 8 }} />
                      <Typography variant="body" style={{ color: colors.text, flex: 1 }}>
                        {femaleTime || 'Select Time'}
                      </Typography>
                      <ChevronDown color={colors.textSecondary} size={14} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Location Picker */}
                <View style={styles.fieldContainer}>
                  <Typography variant="caption" color="muted" weight="semibold" style={styles.fieldLabel}>Birth Place</Typography>
                  <TouchableOpacity 
                    style={[styles.inputIconWrapper, { borderColor: colors.border }]}
                    onPress={() => openLocationPicker('female')}
                    activeOpacity={0.7}
                  >
                    <MapPin color={colors.primary} size={18} style={{ marginRight: 8 }} />
                    <Typography variant="body" style={{ flex: 1, color: femaleLocation ? colors.text : colors.textSecondary }} numberOfLines={1}>
                      {femaleLocation || 'Select location'}
                    </Typography>
                    <ChevronRight color={colors.textSecondary} size={18} />
                  </TouchableOpacity>
                </View>
              </PremiumCard>

              {/* CALCULATE BUTTON */}
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Typography variant="body" weight="bold" style={{ marginTop: 14 }}>
                    Analyzing Compatibility...
                  </Typography>
                  <Typography variant="caption" color="muted" style={{ marginTop: 4, textAlign: 'center' }}>
                    Calculating Guna Milan score & dosha balances.
                  </Typography>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleCalculateMatch}
                  style={styles.calculateBtn}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#7A1124', '#D4AF37']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.btnGradient}
                  >
                    <Heart color="#FFF" size={20} style={{ marginRight: 8 }} />
                    <Typography variant="body" weight="bold" style={{ color: '#FFF' }}>
                      Calculate Compatibility
                    </Typography>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            /* =========================================================================
                                     RESULT VIEW: REPORT SCREEN
               ========================================================================= */
            <View>
              {/* BACK BUTTON TO EDIT */}
              <TouchableOpacity 
                onPress={() => setScreenMode('input')}
                style={styles.backButton}
              >
                <ArrowLeft color={colors.primary} size={18} />
                <Typography variant="body" weight="semibold" style={{ color: colors.primary, marginLeft: 8 }}>
                  Change Birth Details
                </Typography>
              </TouchableOpacity>

              {/* SEGMENTED TAB CONTROL */}
              <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
                <TouchableOpacity 
                  style={[styles.tabButton, resultTab === 'match' && { backgroundColor: colors.primary }]}
                  onPress={() => setResultTab('match')}
                >
                  <Typography variant="body" weight="bold" style={{ color: resultTab === 'match' ? '#FFF' : colors.text }}>
                    Compatibility Milan
                  </Typography>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.tabButton, resultTab === 'remedies' && { backgroundColor: colors.primary }]}
                  onPress={() => setResultTab('remedies')}
                >
                  <Typography variant="body" weight="bold" style={{ color: resultTab === 'remedies' ? '#FFF' : colors.text }}>
                    Remedies & Guidance
                  </Typography>
                </TouchableOpacity>
              </View>

              {resultTab === 'remedies' ? (
                <View>
                  {/* Person Toggle Switch */}
                  <View style={[styles.personSelectorContainer, { backgroundColor: isDark ? '#16161C' : '#F1F5F9' }]}>
                    <TouchableOpacity 
                      activeOpacity={0.8}
                      style={[
                        styles.personSelectorTab, 
                        remedyPerson === 'male' && { 
                          backgroundColor: isDark ? '#1E1D2D' : '#FFF',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 2,
                        }
                      ]}
                      onPress={() => setRemedyPerson('male')}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[
                          styles.genderIconBg, 
                          { backgroundColor: remedyPerson === 'male' ? 'rgba(3, 105, 161, 0.15)' : 'transparent' }
                        ]}>
                          <User color={remedyPerson === 'male' ? '#0369A1' : colors.textSecondary} size={15} />
                        </View>
                        <Typography 
                          variant="caption" 
                          weight="bold" 
                          style={{ 
                            marginLeft: 8, 
                            color: remedyPerson === 'male' ? '#0369A1' : colors.textSecondary 
                          }}
                        >
                          {maleName} (Male)
                        </Typography>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      activeOpacity={0.8}
                      style={[
                        styles.personSelectorTab, 
                        remedyPerson === 'female' && { 
                          backgroundColor: isDark ? '#1E1D2D' : '#FFF',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 2,
                        }
                      ]}
                      onPress={() => setRemedyPerson('female')}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[
                          styles.genderIconBg, 
                          { backgroundColor: remedyPerson === 'female' ? 'rgba(190, 24, 93, 0.15)' : 'transparent' }
                        ]}>
                          <User color={remedyPerson === 'female' ? '#BE185D' : colors.textSecondary} size={15} />
                        </View>
                        <Typography 
                          variant="caption" 
                          weight="bold" 
                          style={{ 
                            marginLeft: 8, 
                            color: remedyPerson === 'female' ? '#BE185D' : colors.textSecondary 
                          }}
                        >
                          {femaleName} (Female)
                        </Typography>
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Recommendations list */}
                  {(() => {
                    const activeRemedies = remedyPerson === 'male' ? maleRemedies : femaleRemedies;
                    if (!activeRemedies || !activeRemedies.recommendations || activeRemedies.recommendations.length === 0) {
                      return (
                        <PremiumCard style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="body" color="muted">No afflictions or remedies found for this birth chart.</Typography>
                        </PremiumCard>
                      );
                    }

                    return activeRemedies.recommendations.map((rec: any, idx: number) => {
                      return (
                        <PremiumCard key={idx} style={{ marginBottom: 16 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border + '30', paddingBottom: 10, marginBottom: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Typography variant="subtitle" weight="bold" color="primary">{rec.planet}</Typography>
                              <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 6, marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                                <Typography variant="caption" weight="bold" style={{ color: '#EF4444', fontSize: 10 }}>
                                  Severity: {rec.totalSeverity}
                                </Typography>
                              </View>
                            </View>
                            {rec.deity ? (
                              <Typography variant="caption" weight="semibold" color="muted">
                                Deity: {rec.deity}
                              </Typography>
                            ) : null}
                          </View>

                          {/* Afflictions list */}
                          {rec.afflictions && rec.afflictions.length > 0 && (
                            <View style={{ marginBottom: 12 }}>
                              <Typography variant="caption" color="muted" weight="bold" style={{ marginBottom: 4 }}>AFFLICTIONS</Typography>
                              {rec.afflictions.map((aff: any, aIdx: number) => (
                                <View key={aIdx} style={{ flexDirection: 'row', marginTop: 2, paddingLeft: 4 }}>
                                  <Typography variant="caption" style={{ color: '#EF4444', marginRight: 6 }}>•</Typography>
                                  <Typography variant="caption" style={{ flex: 1, lineHeight: 15 }}>{aff.description}</Typography>
                                </View>
                              ))}
                            </View>
                          )}

                          {/* Details - Gemstone, Mantra, Donation, Fasting, Rudraksha */}
                          <View style={{ gap: 10, borderTopWidth: 1, borderTopColor: colors.border + '20', paddingTop: 10 }}>
                            {/* Gemstone */}
                            {rec.gemstone && (
                              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <Typography variant="caption" weight="bold" style={{ color: colors.primary, width: 95 }}>Gemstone:</Typography>
                                <Typography variant="caption" style={{ flex: 1, lineHeight: 16 }}>
                                  Wear a {rec.gemstone.primary} ({rec.gemstone.minCarats} carats min) on {rec.gemstone.finger} in {rec.gemstone.metal} on a {rec.gemstone.day}.
                                </Typography>
                              </View>
                            )}

                            {/* Mantra */}
                            {rec.mantra && (
                              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <Typography variant="caption" weight="bold" style={{ color: colors.primary, width: 95 }}>Mantra:</Typography>
                                <View style={{ flex: 1 }}>
                                  <Typography variant="caption" weight="semibold" style={{ fontStyle: 'italic', lineHeight: 16 }}>
                                    "{rec.mantra.beej || rec.mantra.full}"
                                  </Typography>
                                  <Typography variant="caption" color="muted" style={{ marginTop: 2, lineHeight: 15 }}>
                                    Chant {rec.mantra.repetitions?.toLocaleString()} times starting on {rec.mantra.startDay}.
                                  </Typography>
                                </View>
                              </View>
                            )}

                            {/* Rudraksha */}
                            {rec.rudraksha && (
                              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <Typography variant="caption" weight="bold" style={{ color: colors.primary, width: 95 }}>Rudraksha:</Typography>
                                <Typography variant="caption" style={{ flex: 1, lineHeight: 16 }}>
                                  Wear a {rec.rudraksha.mukhi}-Mukhi Rudraksha (Deity: {rec.rudraksha.deity}). Benefits: {rec.rudraksha.benefits}.
                                </Typography>
                              </View>
                            )}

                            {/* Donation */}
                            {rec.donation && (
                              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <Typography variant="caption" weight="bold" style={{ color: colors.primary, width: 95 }}>Donation:</Typography>
                                <Typography variant="caption" style={{ flex: 1, lineHeight: 16 }}>
                                  Donate {rec.donation.items?.join(', ')} to {rec.donation.toWhom} on {rec.donation.day}s.
                                </Typography>
                              </View>
                            )}

                            {/* Fasting */}
                            {rec.fasting && (
                              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <Typography variant="caption" weight="bold" style={{ color: colors.primary, width: 95 }}>Fasting:</Typography>
                                <Typography variant="caption" style={{ flex: 1, lineHeight: 15 }}>
                                  {rec.fasting.protocol} on {rec.fasting.day}s.
                                </Typography>
                              </View>
                            )}

                            {/* Color */}
                            {rec.color && (
                              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <Typography variant="caption" weight="bold" style={{ color: colors.primary, width: 95 }}>Favorable Color:</Typography>
                                <Typography variant="caption" style={{ flex: 1 }}>{rec.color}</Typography>
                              </View>
                            )}
                          </View>
                        </PremiumCard>
                      );
                    });
                  })()}
                </View>
              ) : (
                <View>
                  {/* SCORE CARD */}
                  <PremiumCard style={styles.scoreCard}>
                    <View style={styles.scoreCardRow}>
                      {/* Circular Score display */}
                      <View style={[styles.scoreRing, { borderColor: colors.primary }]}>
                        <LinearGradient
                          colors={['#7A1124', '#D4AF37']}
                          style={styles.scoreRingInner}
                        >
                          <Typography variant="display" style={{ color: '#FFF', fontSize: 32, lineHeight: 32 }}>
                            {ashtakootaTotal}
                          </Typography>
                          <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>
                            OUT OF 36
                          </Typography>
                        </LinearGradient>
                      </View>

                      <View style={styles.scoreDetailColumn}>
                        {/* Status Badge */}
                        <View 
                          style={[
                            styles.statusBadge, 
                            { backgroundColor: matchVerdict.color }
                          ]}
                        >
                          <Typography variant="caption" weight="bold" style={{ color: '#FFF' }}>
                            {matchVerdict.status}
                          </Typography>
                        </View>

                        <Typography variant="subtitle" weight="bold" style={{ marginTop: 8 }}>
                          Guna Milan Score
                        </Typography>
                        <Typography variant="caption" color="muted" style={{ marginTop: 2 }}>
                          {matchVerdict.summary}
                        </Typography>
                      </View>
                    </View>

                    {/* Male vs Female quick bio info */}
                    <View style={[styles.bioDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.bioRow}>
                      <View style={{ flex: 1 }}>
                        <Typography variant="caption" weight="bold" color="primary">MALE CHART</Typography>
                        <Typography variant="body" weight="semibold" numberOfLines={1}>{maleName}</Typography>
                        <Typography variant="caption" color="muted" numberOfLines={1}>{maleLocation}</Typography>
                        {matchData?.person1?.moonSign && (
                          <Typography variant="caption" color="primary" weight="bold" style={{ marginTop: 4 }}>
                            🌙 Moon Sign: {matchData.person1.moonSign}
                          </Typography>
                        )}
                      </View>
                      <View style={styles.bioDividerVertical} />
                      <View style={{ flex: 1, paddingLeft: 16 }}>
                        <Typography variant="caption" weight="bold" color="secondary">FEMALE CHART</Typography>
                        <Typography variant="body" weight="semibold" numberOfLines={1}>{femaleName}</Typography>
                        <Typography variant="caption" color="muted" numberOfLines={1}>{femaleLocation}</Typography>
                        {matchData?.person2?.moonSign && (
                          <Typography variant="caption" color="secondary" weight="bold" style={{ marginTop: 4 }}>
                            🌙 Moon Sign: {matchData.person2.moonSign}
                          </Typography>
                        )}
                      </View>
                    </View>
                  </PremiumCard>

                  {/* TRADITIONAL ASHTAKOOTA TABLE */}
                  <PremiumCard style={styles.ashtakootaCard}>
                    <View style={styles.ashtakootaHeader}>
                      <Sparkles color={colors.primary} size={18} />
                      <Typography variant="body" weight="bold" style={{ marginLeft: 10 }}>
                        Ashta Kuta Guna Milan Details
                      </Typography>
                    </View>

                    {/* Table Header */}
                    <View style={[styles.tableRow, styles.tableHeaderRow, { borderBottomColor: colors.border }]}>
                      <View style={{ flex: 3.2 }}><Typography variant="caption" weight="bold" color="muted">Koota Attribute & Interpretation</Typography></View>
                      <View style={{ flex: 0.8, alignItems: 'flex-end' }}><Typography variant="caption" weight="bold" color="muted">Points</Typography></View>
                    </View>

                    {/* Table Rows */}
                    {ashtakootaTable.map((item: any, idx: number) => (
                      <View key={idx} style={[styles.tableRow, { borderBottomColor: colors.border + '20', paddingVertical: 10 }]}>
                        <View style={{ flex: 3.2, paddingRight: 10 }}>
                          <Typography variant="body" weight="semibold" style={{ fontSize: 13 }}>{item.name}</Typography>
                          {item.desc ? (
                            <Typography variant="caption" color="muted" style={{ fontSize: 11, marginTop: 2, lineHeight: 15 }}>
                              {item.desc}
                            </Typography>
                          ) : null}
                        </View>
                        <View style={{ flex: 0.8, alignItems: 'flex-end', justifyContent: 'center' }}>
                          <Typography variant="body" weight="bold" color={item.received > 0 ? "primary" : "muted"} style={{ fontSize: 13 }}>
                            {item.received} / {item.max}
                          </Typography>
                        </View>
                      </View>
                    ))}

                    {/* Table Footer */}
                    <View style={[styles.tableTotalRow, { backgroundColor: colors.primary + '0d', borderColor: colors.border, marginTop: 16 }]}>
                      <View style={{ flex: 1 }}>
                        <Typography variant="body" weight="bold">Total Guna Milan Score</Typography>
                        <Typography variant="caption" color="muted" style={{ fontSize: 10 }}>
                          Minimum Recommended: 18 / 36
                        </Typography>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Typography variant="body" weight="bold" color={ashtakootaTotal >= 18 ? "primary" : "secondary"}>
                          {ashtakootaTotal} / 36 Points
                        </Typography>
                        <View style={[
                          styles.minPassBadge, 
                          { backgroundColor: ashtakootaTotal >= 18 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }
                        ]}>
                          <Typography variant="caption" weight="bold" style={{ 
                            color: ashtakootaTotal >= 18 ? '#10B981' : '#EF4444', 
                            fontSize: 9,
                            paddingHorizontal: 6,
                            paddingVertical: 1.5,
                          }}>
                            {ashtakootaTotal >= 18 ? 'FAVOURABLE MATCH' : 'UNFAVOURABLE MATCH'}
                          </Typography>
                        </View>
                      </View>
                    </View>

                    {/* Conclusion Text */}
                    <View style={styles.conclusionBox}>
                      <Typography variant="caption" color="muted" weight="bold">COMPATIBILITY SUMMARY</Typography>
                      <Typography variant="body" style={{ marginTop: 4, fontSize: 12, lineHeight: 18 }}>
                        {ashtakootaTotal >= 18 
                          ? `This relationship shows a favourable Ashtakoota score of ${ashtakootaTotal}/36 points. OpenKundali verdict is "${matchData?.ashtakoota?.verdict || 'Pass'}". Compatibility is supportive in key areas. Proceeding is astrologically recommended.` 
                          : `This relationship has an Ashtakoota score of ${ashtakootaTotal}/36 points, which falls below the recommended minimum of 18. OpenKundali verdict is "${matchData?.ashtakoota?.verdict || 'Fail'}". Check the specific Nadi or Bhakoot Dosha conditions below for potential remedies.`
                        }
                      </Typography>
                    </View>
                  </PremiumCard>

                  {/* SOUTH INDIAN CHARTS CARD */}
                  {(maleD1Svg || maleD9Svg || femaleD1Svg || femaleD9Svg) && (
                    <PremiumCard style={styles.ashtakootaCard}>
                      <View style={[styles.ashtakootaHeader, { marginBottom: 16 }]}>
                        <Compass color={colors.primary} size={18} />
                        <Typography variant="body" weight="bold" style={{ marginLeft: 10 }}>
                          South Indian Birth Charts
                        </Typography>
                      </View>

                      {/* Prominent D1 / D9 Chart Selector Toggle */}
                      <View style={{ 
                        flexDirection: 'row', 
                        backgroundColor: isDark ? '#16161C' : '#F1F5F9', 
                        borderRadius: 14, 
                        padding: 4, 
                        marginBottom: 20, 
                        borderWidth: 1, 
                        borderColor: colors.border 
                      }}>
                        <TouchableOpacity
                          onPress={() => setChartD1D9Tab('d1')}
                          activeOpacity={0.8}
                          style={{
                            flex: 1,
                            paddingVertical: 10,
                            borderRadius: 10,
                            backgroundColor: chartD1D9Tab === 'd1' ? colors.primary : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            gap: 6
                          }}
                        >
                          <Grid color={chartD1D9Tab === 'd1' ? '#FFF' : colors.textSecondary} size={16} />
                          <Typography 
                            variant="caption" 
                            weight="bold" 
                            style={{ color: chartD1D9Tab === 'd1' ? '#FFF' : colors.textSecondary, fontSize: 12 }}
                          >
                            D1 Rasi Chart
                          </Typography>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setChartD1D9Tab('d9')}
                          activeOpacity={0.8}
                          style={{
                            flex: 1,
                            paddingVertical: 10,
                            borderRadius: 10,
                            backgroundColor: chartD1D9Tab === 'd9' ? colors.primary : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            gap: 6
                          }}
                        >
                          <Sparkles color={chartD1D9Tab === 'd9' ? '#FFF' : colors.textSecondary} size={16} />
                          <Typography 
                            variant="caption" 
                            weight="bold" 
                            style={{ color: chartD1D9Tab === 'd9' ? '#FFF' : colors.textSecondary, fontSize: 12 }}
                          >
                            D9 Navamsha Chart
                          </Typography>
                        </TouchableOpacity>
                      </View>

                      {/* Male Chart View */}
                      {(() => {
                        const activeMaleSvg = chartD1D9Tab === 'd1' ? maleD1Svg : maleD9Svg;
                        if (!activeMaleSvg) return null;
                        return (
                          <View style={{ marginBottom: 24, alignItems: 'center' }}>
                            <Typography variant="body" weight="bold" color="primary" style={{ marginBottom: 8, textAlign: 'center' }}>
                              {maleName} ({chartD1D9Tab === 'd1' ? 'Male D1 Rasi Chart' : 'Male D9 Navamsha Chart'})
                            </Typography>
                            <View style={{ backgroundColor: isDark ? '#16161C' : '#FAF8F5', borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                              <SvgXml 
                                xml={inlineSvgStyles(activeMaleSvg)} 
                                width={width - 72} 
                                height={width - 72} 
                              />
                            </View>
                          </View>
                        );
                      })()}

                      {/* Female Chart View */}
                      {(() => {
                        const activeFemaleSvg = chartD1D9Tab === 'd1' ? femaleD1Svg : femaleD9Svg;
                        if (!activeFemaleSvg) return null;
                        return (
                          <View style={{ alignItems: 'center' }}>
                            <Typography variant="body" weight="bold" color="secondary" style={{ marginBottom: 8, textAlign: 'center' }}>
                              {femaleName} ({chartD1D9Tab === 'd1' ? 'Female D1 Rasi Chart' : 'Female D9 Navamsha Chart'})
                            </Typography>
                            <View style={{ backgroundColor: isDark ? '#16161C' : '#FAF8F5', borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                              <SvgXml 
                                xml={inlineSvgStyles(activeFemaleSvg)} 
                                width={width - 72} 
                                height={width - 72} 
                              />
                            </View>
                          </View>
                        );
                      })()}
                    </PremiumCard>
                  )}

                  {/* DOSHAS & REMEDIES CARD */}
                  {matchData?.ashtakoota?.doshas && matchData.ashtakoota.doshas.length > 0 && (
                    <PremiumCard style={[styles.ashtakootaCard, { borderColor: 'rgba(239, 68, 68, 0.3)', borderWidth: 1 }]}>
                      <View style={styles.ashtakootaHeader}>
                        <AlertCircle color="#EF4444" size={18} />
                        <Typography variant="body" weight="bold" style={{ marginLeft: 10, color: '#EF4444' }}>
                          Doshas & Concerns ({matchData.ashtakoota.doshas.length})
                        </Typography>
                      </View>
                      <View style={{ gap: 10 }}>
                        {matchData.ashtakoota.doshas.map((dosha: string, idx: number) => {
                          const parts = dosha.split(' — ');
                          const title = parts[0] || 'Dosha Alert';
                          const desc = parts[1] || dosha;
                          return (
                            <View key={idx} style={{ borderLeftColor: '#EF4444', borderLeftWidth: 3, paddingLeft: 10, paddingVertical: 2 }}>
                              <Typography variant="body" weight="bold" style={{ fontSize: 13, color: '#B91C1C' }}>{title}</Typography>
                              <Typography variant="caption" color="muted" style={{ marginTop: 2, fontSize: 11, lineHeight: 16 }}>{desc}</Typography>
                            </View>
                          );
                        })}
                      </View>
                    </PremiumCard>
                  )}

                  {/* SYNASTRY HIGHLIGHTS CARD */}
                  {matchData?.synastry?.highlights && matchData.synastry.highlights.length > 0 && (
                    <PremiumCard style={styles.ashtakootaCard}>
                      <View style={styles.ashtakootaHeader}>
                        <Sparkles color={colors.secondary} size={18} />
                        <Typography variant="body" weight="bold" style={{ marginLeft: 10 }}>
                          Synastry Highlights
                        </Typography>
                      </View>
                      <View style={{ gap: 10 }}>
                        {matchData.synastry.highlights.map((h: any, idx: number) => {
                          const isNegative = h.quality === 'negative';
                          const highlightColor = isNegative ? '#EF4444' : '#10B981';
                          return (
                            <View key={idx} style={{ borderLeftColor: highlightColor, borderLeftWidth: 3, paddingLeft: 10, paddingVertical: 2 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Typography variant="body" weight="bold" style={{ fontSize: 13, color: highlightColor }}>
                                  {h.label}
                                </Typography>
                                <View style={[
                                  styles.minPassBadge, 
                                  { backgroundColor: isNegative ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', marginLeft: 8 }
                                ]}>
                                  <Typography variant="caption" weight="bold" style={{ 
                                    color: highlightColor, 
                                    fontSize: 9,
                                    paddingHorizontal: 5,
                                    paddingVertical: 1,
                                  }}>
                                    {h.quality?.toUpperCase() || 'INFO'}
                                  </Typography>
                                </View>
                              </View>
                              {h.description ? (
                                <Typography variant="caption" color="muted" style={{ marginTop: 4, fontSize: 11, lineHeight: 16 }}>
                                  {h.description}
                                </Typography>
                              ) : null}
                            </View>
                          );
                        })}
                      </View>
                    </PremiumCard>
                  )}
                </View>
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
        value={datePickerTarget === 'male' ? maleDate : femaleDate}
        onSelect={(dateStr: string) => {
          if (datePickerTarget === 'male') {
            setMaleDate(dateStr);
          } else {
            setFemaleDate(dateStr);
          }
        }}
      />

      {/* TIME PICKER MODAL */}
      <CustomTimePickerModal 
        visible={timePickerVisible}
        onClose={() => setTimePickerVisible(false)}
        value={timePickerTarget === 'male' ? maleTime : femaleTime}
        onSelect={(timeStr: string) => {
          if (timePickerTarget === 'male') {
            setMaleTime(timeStr);
          } else {
            setFemaleTime(timeStr);
          }
        }}
      />

      {/* LOCATION PICKER SEARCH MODAL */}
      <Modal visible={locationModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
            <View style={styles.modalHeader}>
              <Typography variant="subtitle" weight="bold">
                {locationModalTarget === 'male' ? "Male Birth Place" : "Female Birth Place"}
              </Typography>
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
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personSelectorContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 6,
    marginBottom: 20,
    gap: 8,
  },
  personSelectorTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderIconBg: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    marginBottom: 20,
    padding: 16,
  },
  personCard: {
    marginBottom: 20,
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)',
    paddingBottom: 10,
  },
  genderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
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
  textInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  inputIconWrapper: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  ayanamsaCard: {
    marginBottom: 24,
  },
  ayanamsaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  ayanamsaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ayanamsaChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1.5,
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
  scoreCard: {
    marginBottom: 24,
  },
  scoreCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2.5,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreRingInner: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreDetailColumn: {
    flex: 1,
    marginLeft: 20,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bioDivider: {
    height: 1,
    marginVertical: 16,
  },
  bioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bioDividerVertical: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(150,150,150,0.2)',
  },
  filterSection: {
    marginBottom: 18,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    marginRight: 8,
  },
  predictionCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.15)',
  },
  predictionTrigger: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  predictionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scorePointBadge: {
    marginLeft: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
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
    gap: 14,
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
  ashtakootaCard: {
    marginBottom: 24,
    padding: 16,
  },
  ashtakootaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)',
    paddingBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  tableHeaderRow: {
    paddingBottom: 6,
    borderBottomWidth: 1.5,
    marginBottom: 4,
  },
  tableTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 14,
  },
  minPassBadge: {
    alignSelf: 'flex-end',
    borderRadius: 6,
    marginTop: 4,
  },
  conclusionBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(150,150,150,0.05)',
    borderRadius: 16,
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

  /* Parameter Comparison Styling */
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
  }
});
