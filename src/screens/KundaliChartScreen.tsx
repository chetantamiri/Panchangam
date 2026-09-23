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
  Share
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/Typography';
import { PremiumCard } from '../components/PremiumCard';
import { AppHeader } from '../components/AppHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgXml } from 'react-native-svg';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  ChevronDown, 
  X, 
  Search, 
  AlertCircle, 
  Info,
  Sliders,
  Grid,
  Share2,
  Navigation,
  Download
} from 'lucide-react-native';
import { searchLocationSuggestions, LocationItem, getCachedLocation } from '../services/locationService';
import { getSouthIndianChart, SouthIndianChartRequest } from '../services/vedAstroApi';

const { width } = Dimensions.get('window');

// divisional chart types with human-readable descriptions
const CHART_TYPES = [
  { label: 'Rasi (D1) - Main Birth Chart', value: 'RasiD1', desc: 'Core life path, personality & destiny promise' },
  { label: 'Hora (D2) - Wealth & Finance', value: 'HoraD2', desc: 'Wealth, assets, values & material savings' },
  { label: 'Drekkana (D3) - Siblings & Karma', value: 'DrekkanaD3', desc: 'Siblings, energy, courage & action' },
  { label: 'Chaturthamsha (D4) - Luck & Property', value: 'ChaturthamshaD4', desc: 'Net fortune, real estate, homes & assets' },
  { label: 'Saptamsha (D7) - Children & Legacy', value: 'SaptamshaD7', desc: 'Progeny, children, legacy & physical creation' },
  { label: 'Navamsha (D9) - Spouse & Dharma', value: 'NavamshaD9', desc: 'Marriage, spouse, dharma & late-life potential' },
  { label: 'Dashamsha (D10) - Career & Profession', value: 'DashamshaD10', desc: 'Career, achievements, status & fame' },
  { label: 'Dwadamsha (D12) - Parents & Lineage', value: 'DwadamshaD12', desc: 'Parents, heritage, ancestors & lineage karma' },
  { label: 'Shodashamsha (D16) - Vehicles & Comforts', value: 'ShodashamshaD16', desc: 'Vehicles, physical pleasures & home comforts' },
  { label: 'Vimshamsha (D20) - Spiritual Progress', value: 'VimshamshaD20', desc: 'Spirituality, religious practices & devotion' },
  { label: 'Chaturvimshamsha (D24) - Education', value: 'ChaturvimshamshaD24', desc: 'Higher learning, academic skills & wisdom' },
  { label: 'Saptavimshamsha (D27) - Strengths', value: 'SaptavimshamshaD27', desc: 'Vitality, physical strength & mental power' },
  { label: 'Trimshamsha (D30) - Evil & Misfortunes', value: 'TrimshamshaD30', desc: 'Internal enemies, disease & obstacles' },
  { label: 'Khavedamsha (D40) - Auspiciousness', value: 'KhavedamshaD40', desc: 'General auspiciousness, mother\'s blessings' },
  { label: 'Akshavedamsha (D45) - Character', value: 'AkshavedamshaD45', desc: 'Innate character, integrity & general fortune' },
  { label: 'Shashtyamsha (D60) - Past Karma & Soul', value: 'ShashtyamshaD60', desc: 'All-encompassing soul path & past life karma' },
  { label: 'Sun D1 Chart', value: 'SunD1', desc: 'Soul purpose, authority & physical health' },
  { label: 'Moon D1 Chart', value: 'MoonD1', desc: 'Mind, emotions, mental peace & mother' },
  { label: 'Mars D1 Chart', value: 'MarsD1', desc: 'Courage, drive, physical strength & siblings' },
  { label: 'Mercury D1 Chart', value: 'MercuryD1', desc: 'Intellect, communication, business & speech' },
  { label: 'Jupiter D1 Chart', value: 'JupiterD1', desc: 'Wisdom, wealth, children & good fortune' },
  { label: 'Venus D1 Chart', value: 'VenusD1', desc: 'Love, luxury, relationships & creativity' },
  { label: 'Saturn D1 Chart', value: 'SaturnD1', desc: 'Discipline, career longevity & life lessons' },
  { label: 'KP Chart', value: 'KP', desc: 'Krishnamurti Paddhati sub-lord cusp system' },
  { label: 'Bhava Chalit Chart', value: 'BhavaChalit', desc: 'Actual planetary house positions in space' },
  { label: 'South Indian Chart Style', value: 'SouthIndian', desc: 'South Indian rectangular fixed-sign format' },
  { label: 'North Indian Chart Style', value: 'NorthIndian', desc: 'North Indian diamond fixed-house format' }
];

// Mapping to VedAstro API expected names
const CHART_TYPE_API_MAP: Record<string, string> = {
  RasiD1: 'RasiD1',
  HoraD2: 'HoraD2',
  DrekkanaD3: 'DrekkanaD3',
  ChaturthamshaD4: 'ChaturthamshaD4',
  SaptamshaD7: 'SaptamshaD7',
  NavamshaD9: 'NavamshaD9',
  DashamshaD10: 'DashamshaD10',
  DwadamshaD12: 'DwadamshaD12',
  ShodashamshaD16: 'ShodashamshaD16',
  VimshamshaD20: 'VimshamshaD20',
  ChaturvimshamshaD24: 'ChaturvimshamshaD24',
  SaptavimshamshaD27: 'SaptavimshamshaD27',
  TrimshamshaD30: 'TrimshamshaD30',
  KhavedamshaD40: 'KhavedamshaD40',
  AkshavedamshaD45: 'AkshavedamshaD45',
  ShashtyamshaD60: 'ShashtyamshaD60',
  SunD1: 'SunD1',
  MoonD1: 'MoonD1',
  MarsD1: 'MarsD1',
  MercuryD1: 'MercuryD1',
  JupiterD1: 'JupiterD1',
  VenusD1: 'VenusD1',
  SaturnD1: 'SaturnD1',
  KP: 'KP',
  BhavaChalit: 'BhavaChalit',
  SouthIndian: 'SouthIndian',
  NorthIndian: 'NorthIndian'
};

const AYANAMSAS = [
  { label: 'Raman', value: 'RAMAN' },
  { label: 'Lahiri', value: 'LAHIRI' },
  { label: 'KP', value: 'KP' },
  { label: 'Yukteshwar', value: 'YUKTESHWAR' },
  { label: 'Sayana', value: 'SAYANA' }
];

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
            Select Date of Birth
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
                    !isPm && { backgroundColor: colors.primary }
                  ]}
                >
                  <Typography variant="body" weight={!isPm ? "bold" : "regular"} style={{ color: !isPm ? '#FFF' : colors.text }}>AM</Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsPm(true)}
                  style={[
                    styles.pickerItem,
                    isPm && { backgroundColor: colors.primary }
                  ]}
                >
                  <Typography variant="body" weight={isPm ? "bold" : "regular"} style={{ color: isPm ? '#FFF' : colors.text }}>PM</Typography>
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
                          MAIN COMPONENT
   ========================================================================= */
export const KundaliChartScreen = ({ navigation }: any) => {
  const { colors, spacing, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Load default options or auto-detected locations
  const cachedLoc = getCachedLocation();
  const defaultLoc = cachedLoc || {
    name: 'Bhimavaram, Andhra Pradesh, India',
    fullName: 'Bhimavaram, Andhra Pradesh, India',
    latitude: 16.561,
    longitude: 81.52
  };

  const [dob, setDob] = useState('15/06/1990');
  const [tob, setTob] = useState('12:00');
  const [locationName, setLocationName] = useState(defaultLoc.name);
  const [latitude, setLatitude] = useState(defaultLoc.latitude);
  const [longitude, setLongitude] = useState(defaultLoc.longitude);
  
  const [chartType, setChartType] = useState('RasiD1');
  const [ayanamsa, setAyanamsa] = useState('LAHIRI');

  // Modal controls
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showChartTypeModal, setShowChartTypeModal] = useState(false);
  const [showAyanamsaModal, setShowAyanamsaModal] = useState(false);

  // Search variables
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationItem[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // API Call state
  const [isLoading, setIsLoading] = useState(false);
  const [svgData, setSvgData] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Location suggestions debounce
  useEffect(() => {
    if (!locationQuery || locationQuery.trim().length < 2) {
      setLocationSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLocation(true);
      const results = await searchLocationSuggestions(locationQuery);
      setLocationSuggestions(results);
      setIsSearchingLocation(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [locationQuery]);

  const selectLocation = (item: LocationItem) => {
    setLocationName(item.name);
    setLatitude(item.latitude);
    setLongitude(item.longitude);
    setLocationQuery(item.name);
    setShowLocationModal(false);
  };

  const triggerAutoDetectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data && data.latitude && data.longitude) {
        const city = data.city || '';
        const country = data.country_name || '';
        const name = city ? `${city}, ${country}` : country || 'Detected Location';
        setLocationName(name);
        setLatitude(parseFloat(data.latitude));
        setLongitude(parseFloat(data.longitude));
        setLocationQuery(name);
        setShowLocationModal(false);
      }
    } catch (e) {
      console.warn('IP Geolocation failed inside KundaliChartScreen:', e);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleGenerateChart = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSvgData(null);

    const getTzOffset = (lng: number) => {
      if (lng === undefined || lng === null || isNaN(Number(lng))) {
        return '+05:30';
      }
      const longNum = Number(lng);
      const offsetHours = longNum / 15;
      const totalMins = Math.round(offsetHours * 60);
      const sign = totalMins >= 0 ? '+' : '-';
      const absMins = Math.abs(totalMins);
      const h = String(Math.floor(absMins / 60)).padStart(2, '0');
      const m = String(absMins % 60).padStart(2, '0');
      return `${sign}${h}:${m}`;
    };

    const formattedStdTime = `${tob} ${dob} ${getTzOffset(longitude)}`;
    const apiChartType = CHART_TYPE_API_MAP[chartType] || 'ChaturthamshaD4';

    const requestBody: SouthIndianChartRequest = {
      Time: {
        StdTime: formattedStdTime,
        Location: {
          Name: locationName,
          Latitude: latitude,
          Longitude: longitude
        }
      },
      ChartType: apiChartType,
      Ayanamsa: ayanamsa
    };

    try {
      const svg = await getSouthIndianChart(requestBody);
      const processedSvg = inlineSvgStyles(svg);
      setSvgData(processedSvg);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error?.message || 'Failed to connect to astrology server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareChart = async () => {
    if (!svgData) return;
    try {
      await Share.share({
        message: `Vedic divisional Kundali Chart (${chartType}) generated for ${dob} ${tob}. Location: ${locationName}. Ayanamsa: ${ayanamsa}.`,
      });
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* App Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text} size={22} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Typography variant="subtitle" weight="bold">Divisional D-Charts</Typography>
          <Typography variant="caption" color="muted">South Indian Kundali Chart Generator</Typography>
        </View>
        <Grid color={colors.primary} size={22} style={{ marginRight: 16 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Main Inputs Form */}
        <PremiumCard style={styles.inputCard}>
          <Typography variant="body" weight="bold" color="primary" style={{ marginBottom: 16 }}>
            Astrological Birth Credentials
          </Typography>

          {/* Date of Birth Input */}
          <TouchableOpacity 
            style={[styles.formRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]} 
            onPress={() => setShowDatePicker(true)}
          >
            <CalendarIcon color={colors.primary} size={20} />
            <View style={styles.formInputContainer}>
              <Typography variant="caption" color="muted">Date of Birth</Typography>
              <Typography variant="body" weight="semibold">{dob}</Typography>
            </View>
            <ChevronDown color={colors.textSecondary} size={16} />
          </TouchableOpacity>

          {/* Time of Birth Input */}
          <TouchableOpacity 
            style={[styles.formRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]} 
            onPress={() => setShowTimePicker(true)}
          >
            <Clock color={colors.secondary} size={20} />
            <View style={styles.formInputContainer}>
              <Typography variant="caption" color="muted">Time of Birth</Typography>
              <Typography variant="body" weight="semibold">{tob}</Typography>
            </View>
            <ChevronDown color={colors.textSecondary} size={16} />
          </TouchableOpacity>

          {/* Location Input */}
          <TouchableOpacity 
            style={[styles.formRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]} 
            onPress={() => setShowLocationModal(true)}
          >
            <MapPin color={colors.primary} size={20} />
            <View style={styles.formInputContainer}>
              <Typography variant="caption" color="muted">Birth Place / Location</Typography>
              <Typography variant="body" weight="semibold" numberOfLines={1}>{locationName}</Typography>
            </View>
            <ChevronDown color={colors.textSecondary} size={16} />
          </TouchableOpacity>

          {/* Chart Type Selector */}
          <TouchableOpacity 
            style={[styles.formRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]} 
            onPress={() => setShowChartTypeModal(true)}
          >
            <Grid color={colors.secondary} size={20} />
            <View style={styles.formInputContainer}>
              <Typography variant="caption" color="muted">Chart Type (Divisional Varga)</Typography>
              <Typography variant="body" weight="semibold" numberOfLines={1}>
                {CHART_TYPES.find(c => c.value === chartType)?.label || chartType}
              </Typography>
            </View>
            <ChevronDown color={colors.textSecondary} size={16} />
          </TouchableOpacity>

          {/* Ayanamsa Selector */}
          <TouchableOpacity 
            style={styles.formRow} 
            onPress={() => setShowAyanamsaModal(true)}
          >
            <Sliders color={colors.primary} size={20} />
            <View style={styles.formInputContainer}>
              <Typography variant="caption" color="muted">Ayanamsa Degree System</Typography>
              <Typography variant="body" weight="semibold">
                {AYANAMSAS.find(a => a.value === ayanamsa)?.label || ayanamsa}
              </Typography>
            </View>
            <ChevronDown color={colors.textSecondary} size={16} />
          </TouchableOpacity>

          {/* Generate Button */}
          <TouchableOpacity 
            style={styles.generateBtn} 
            onPress={handleGenerateChart} 
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#7A1124', '#D4AF37']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              {isLoading ? (
                <View style={styles.loaderRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Typography variant="body" weight="bold" style={{ color: '#FFFFFF', marginLeft: 12 }}>
                    Calculating Celestial Coordinate...
                  </Typography>
                </View>
              ) : (
                <Typography variant="body" weight="bold" style={{ color: '#FFFFFF' }}>
                  Generate D-Chart Kundali
                </Typography>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </PremiumCard>

        {/* Display Error Message */}
        {errorMessage && (
          <View style={[styles.errorCard, { backgroundColor: colors.border + '15', borderColor: colors.primary }]}>
            <AlertCircle color={colors.primary} size={20} />
            <Typography variant="caption" color="muted" style={{ marginLeft: 10, flex: 1 }}>
              {errorMessage}
            </Typography>
          </View>
        )}

        {/* Kundali Visual Display Output */}
        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Typography variant="body" weight="semibold" style={{ marginTop: 14 }}>
              Loading Divisional Chart...
            </Typography>
            <Typography variant="caption" color="muted" style={{ marginTop: 4, textAlign: 'center', marginHorizontal: 20 }}>
              Drawing precise house lines and mapping planetary coordinate transits from VedAstro.
            </Typography>
          </View>
        ) : svgData ? (
          <PremiumCard style={styles.chartDisplayCard}>
            <View style={styles.chartHeader}>
              <View style={{ flex: 1 }}>
                <Typography variant="subtitle" weight="bold" color="primary">
                  {CHART_TYPES.find(c => c.value === chartType)?.label.split(' - ')[0] || chartType}
                </Typography>
                <Typography variant="caption" color="muted">
                  {CHART_TYPES.find(c => c.value === chartType)?.desc}
                </Typography>
              </View>
              <TouchableOpacity onPress={handleShareChart} style={styles.shareIconBtn}>
                <Share2 color={colors.primary} size={20} />
              </TouchableOpacity>
            </View>

            <View style={[styles.svgWrapper, { backgroundColor: isDark ? '#1E1E26' : '#FAF8F5', borderColor: colors.border }]}>
              {/* SvgXml parses the SVG code and renders native vectors natively on Android & iOS */}
              <SvgXml 
                xml={svgData} 
                width={width - 80} 
                height={width - 80} 
              />
            </View>

            <Typography variant="caption" color="muted" style={styles.footnote}>
              This is a South Indian style chart representation where zodiac signs are fixed in a clockwise layout and houses rotate accordingly.
            </Typography>
          </PremiumCard>
        ) : (
          <View style={styles.emptyPlaceholder}>
            <Grid color={colors.border} size={64} style={{ opacity: 0.6 }} />
            <Typography variant="body" weight="semibold" color="muted" style={{ marginTop: 14 }}>
              No Chart Generated Yet
            </Typography>
            <Typography variant="caption" color="muted" style={{ marginTop: 4, textAlign: 'center', paddingHorizontal: 30 }}>
              Fill in your birth coordinates above and click Generate to construct your divisional horoscope chart.
            </Typography>
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* 1. DOB Modal */}
      <CustomDatePickerModal 
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={(selectedDate: string) => setDob(selectedDate)}
        value={dob}
      />

      {/* 2. TOB Modal */}
      <CustomTimePickerModal 
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onSelect={(selectedTime: string) => setTob(selectedTime)}
        value={tob}
      />

      {/* 3. Location Modal */}
      <Modal visible={showLocationModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
            <View style={styles.modalHeader}>
              <Typography variant="subtitle" weight="bold">Search Birth Place</Typography>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchBox, { backgroundColor: isDark ? '#1E1E26' : '#F1F5F9', borderColor: colors.border, borderWidth: 1 }]}>
              <Search color={colors.textSecondary} size={18} />
              <TextInput
                value={locationQuery}
                onChangeText={setLocationQuery}
                placeholder="Search city (e.g. Bhimavaram, London)..."
                placeholderTextColor={colors.textSecondary}
                style={[styles.modalInput, { color: colors.text }]}
                autoFocus
              />
              {isSearchingLocation && (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 8 }} />
              )}
            </View>

            <TouchableOpacity 
              style={[styles.detectLocationBtn, { backgroundColor: colors.primary + '18', borderColor: colors.primary, borderWidth: 1 }]}
              onPress={triggerAutoDetectLocation}
              disabled={isDetectingLocation}
            >
              {isDetectingLocation ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Navigation color={colors.primary} size={16} />
                  <Typography variant="body" weight="semibold" style={{ color: colors.primary, marginLeft: 8 }}>
                    Detect & Use Current Location
                  </Typography>
                </View>
              )}
            </TouchableOpacity>

            <Typography variant="caption" color="muted" weight="bold" style={{ marginTop: 16, marginBottom: 8 }}>
              Search Results
            </Typography>

            <ScrollView style={{ maxHeight: 240 }} keyboardShouldPersistTaps="handled">
              {locationSuggestions.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                  onPress={() => selectLocation(item)}
                >
                  <MapPin color={colors.primary} size={16} style={{ marginTop: 2 }} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Typography variant="body" weight="bold">{item.name}</Typography>
                    <Typography variant="caption" color="muted">{item.fullName}</Typography>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 4. Chart Type Modal */}
      <Modal visible={showChartTypeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, maxHeight: '75%' }]}>
            <View style={styles.modalHeader}>
              <Typography variant="subtitle" weight="bold">Select Divisional Varga Chart</Typography>
              <TouchableOpacity onPress={() => setShowChartTypeModal(false)}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 8 }}>
              {CHART_TYPES.map((item, idx) => {
                const isSelected = chartType === item.value;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.choiceItem,
                      { borderBottomColor: colors.border },
                      isSelected && { backgroundColor: colors.primary + '12' }
                    ]}
                    onPress={() => {
                      setChartType(item.value);
                      setShowChartTypeModal(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Typography variant="body" weight={isSelected ? "bold" : "semibold"} color={isSelected ? "primary" : "default"}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" color="muted" style={{ marginTop: 2 }}>
                        {item.desc}
                      </Typography>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 5. Ayanamsa Modal */}
      <Modal visible={showAyanamsaModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
            <View style={styles.modalHeader}>
              <Typography variant="subtitle" weight="bold">Select Ayanamsa System</Typography>
              <TouchableOpacity onPress={() => setShowAyanamsaModal(false)}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 8 }}>
              {AYANAMSAS.map((item, idx) => {
                const isSelected = ayanamsa === item.value;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.choiceItem,
                      { borderBottomColor: colors.border },
                      isSelected && { backgroundColor: colors.primary + '12' }
                    ]}
                    onPress={() => {
                      setAyanamsa(item.value);
                      setShowAyanamsaModal(false);
                    }}
                  >
                    <Typography variant="body" weight={isSelected ? "bold" : "semibold"} color={isSelected ? "primary" : "default"}>
                      {item.label} System
                    </Typography>
                  </TouchableOpacity>
                );
              })}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  scrollContent: {
    padding: 20,
  },
  inputCard: {
    padding: 20,
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  formInputContainer: {
    flex: 1,
    marginLeft: 16,
  },
  generateBtn: {
    marginTop: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  gradientBtn: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  centerBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartDisplayCard: {
    padding: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  shareIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.12)',
  },
  svgWrapper: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    overflow: 'hidden',
  },
  footnote: {
    marginTop: 14,
    textAlign: 'center',
    lineHeight: 16,
  },
  emptyPlaceholder: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.85,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '80%',
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
    marginBottom: 12,
  },
  modalInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  detectLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 22,
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  choiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  pickerModalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    height: 380,
  },
  pickerColumnsRow: {
    flexDirection: 'row',
    flex: 1,
    marginBottom: 16,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'stretch',
  },
  pickerColHeader: {
    textAlign: 'center',
    marginBottom: 8,
  },
  pickerScrollView: {
    flex: 1,
  },
  pickerItem: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 2,
  },
  pickerActionRow: {
    flexDirection: 'row',
    height: 48,
    gap: 12,
  },
  pickerCancelBtn: {
    flex: 1,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerConfirmBtn: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  pickerBtnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
