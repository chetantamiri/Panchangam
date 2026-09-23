import React, { useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ActivityIndicator,
  TextInput,
  Share,
  Dimensions,
  Modal
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/Typography';
import { PremiumCard } from '../components/PremiumCard';
import { AppHeader } from '../components/AppHeader';
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  Sun, 
  Moon, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Share2,
  Sliders,
  Info,
  CheckCircle2,
  Compass,
  ArrowUpDown,
  BookOpen,
  Star,
  Flame,
  Check,
  X,
  Navigation
} from 'lucide-react-native';
import { getAdvancedPanchang } from '../services/navamshaApi';
import { getFreeAstroPanchang } from '../services/freeAstroApi';
import { 
  getCachedLocation, 
  getCachedDate,
  searchLocationSuggestions,
  getCurrentLocationByIp,
  setCachedLocation,
  LocationItem 
} from '../services/locationService';

const { width } = Dimensions.get('window');

interface PanchangScreenProps {
  navigation?: any;
  route?: {
    params?: {
      location?: string;
      latitude?: number;
      longitude?: number;
      date?: string;
    };
  };
}

interface NormalizedPanchang {
  tithi: { name: string; start: string; end: string; detail?: string };
  nakshatra: { name: string; start: string; end: string; detail?: string };
  yoga: { name: string; start: string; end: string; detail?: string };
  karana: { name: string; start: string; end: string; detail?: string };
  karana1?: { name: string; start: string; end: string; detail?: string };
  karana2?: { name: string; start: string; end: string; detail?: string };
  karana3?: { name: string; start: string; end: string; detail?: string };
  vara: { name: string; detail?: string };
  lunarMonth: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  auspiciousPeriods: { title: string; time: string; type: string }[];
  inauspiciousPeriods: { title: string; time: string }[];
  otherDetails: { key: string; value: string }[];
}

export const PanchangScreen: React.FC<PanchangScreenProps> = ({ navigation, route }) => {
  const { colors, spacing, isDark } = useTheme();
  const isFocused = useIsFocused();

  const cachedLoc = getCachedLocation();
  const cachedDate = getCachedDate();

  // State variables for dynamic location and date controls
  const [currentLocation, setCurrentLocation] = useState(route?.params?.location || cachedLoc?.name || 'New Delhi, India');
  const [currentLatitude, setCurrentLatitude] = useState(route?.params?.latitude || cachedLoc?.latitude || 28.6139);
  const [currentLongitude, setCurrentLongitude] = useState(route?.params?.longitude || cachedLoc?.longitude || 77.2090);
  const [currentDate, setCurrentDate] = useState(route?.params?.date || cachedDate || (() => {
    const d = new Date();
    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  })());

  // Modal and Date Picker states
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationInput, setLocationInput] = useState(currentLocation);
  const [suggestions, setSuggestions] = useState<LocationItem[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const DEFAULT_QUICK_LOCATIONS: LocationItem[] = [
    { name: 'New Delhi, India', fullName: 'New Delhi, Delhi, India', latitude: 28.6139, longitude: 77.2090 },
    { name: 'Mumbai, India', fullName: 'Mumbai, Maharashtra, India', latitude: 19.0760, longitude: 72.8777 },
    { name: 'Hyderabad, India', fullName: 'Hyderabad, Telangana, India', latitude: 17.3850, longitude: 78.4867 },
    { name: 'Bengaluru, India', fullName: 'Bengaluru, Karnataka, India', latitude: 12.9716, longitude: 77.5946 },
    { name: 'Chennai, India', fullName: 'Chennai, Tamil Nadu, India', latitude: 13.0827, longitude: 80.2707 },
  ];

  const parseDateStr = (dateStr: string): Date => {
    const cleanStr = String(dateStr).trim();
    const parsed = new Date(cleanStr);
    if (!isNaN(parsed.getTime())) return parsed;
    
    const spaceParts = cleanStr.split(/\s+/);
    if (spaceParts.length === 3) {
      const day = parseInt(spaceParts[0].replace(/[^0-9]/g, ''), 10);
      const monthStr = spaceParts[1].toLowerCase();
      const year = parseInt(spaceParts[2], 10);
      const monthsMap: Record<string, number> = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
        january: 0, february: 1, march: 2, april: 3, june: 5,
        july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
      };
      const month = monthsMap[monthStr] !== undefined ? monthsMap[monthStr] : 6;
      return new Date(year, month, day);
    }
    return new Date();
  };

  const formatDateStr = (d: Date): string => {
    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const adjustDateDays = (dateStr: string, days: number): string => {
    const d = parseDateStr(dateStr);
    d.setDate(d.getDate() + days);
    return formatDateStr(d);
  };

  const [pickerDate, setPickerDate] = useState(() => parseDateStr(currentDate));
  const [currentMonth, setCurrentMonth] = useState(pickerDate.getMonth());
  const [currentYear, setCurrentYear] = useState(pickerDate.getFullYear());

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const calendarDays = React.useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, key: `empty-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, key: `day-${d}` });
    }
    return days;
  }, [currentMonth, currentYear]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDay = (dayNum: number) => {
    const selected = new Date(currentYear, currentMonth, dayNum);
    setPickerDate(selected);
    const formatted = formatDateStr(selected);
    setCurrentDate(formatted);
    setShowDatePickerModal(false);
  };

  // Sync date input val with external changes (like arrow buttons)
  useEffect(() => {
    const parsed = parseDateStr(currentDate);
    if (parsed && !isNaN(parsed.getTime())) {
      setPickerDate(parsed);
      setCurrentMonth(parsed.getMonth());
      setCurrentYear(parsed.getFullYear());
    }
  }, [currentDate]);

  // Debounced location search effect
  useEffect(() => {
    if (!locationInput || locationInput.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLocation(true);
      const results = await searchLocationSuggestions(locationInput);
      setSuggestions(results);
      setIsSearchingLocation(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [locationInput]);

  const selectLocationItem = (item: LocationItem) => {
    setCurrentLocation(item.name);
    setCurrentLatitude(item.latitude);
    setCurrentLongitude(item.longitude);
    setLocationInput(item.name);
    setCachedLocation(item);
    setShowLocationModal(false);
  };

  const [rawApiResponse, setRawApiResponse] = useState<any>(null);
  const [panchangData, setPanchangData] = useState<NormalizedPanchang | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);
  const [isNavamshaOffline, setIsNavamshaOffline] = useState<boolean>(false);

  // Inspector States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showRawJson, setShowRawJson] = useState<boolean>(false);
  const [isInspectorExpanded, setIsInspectorExpanded] = useState<boolean>(false);

  const normalizeResponse = (navamshaRes: any, freeAstroRes: any): NormalizedPanchang => {
    // If the API returns a wrapper e.g. { statusCode: 200, output: { ... } } or { status: true, data: { ... } }
    const data = navamshaRes?.output || navamshaRes?.data || navamshaRes?.Payload?.PanchangaTable || navamshaRes?.PanchangaTable || navamshaRes;

    // Helper to format time values cleanly (e.g. HH:MM:SS or ISO format)
    const formatTime = (timeVal: any): string => {
      if (!timeVal) return 'N/A';
      const timeStr = String(timeVal).trim();
      
      // Check if it matches ISO timestamp: e.g. "2026-08-01T19:25:30.395521+05:30"
      if (timeStr.includes('T')) {
        try {
          const d = new Date(timeStr);
          if (!isNaN(d.getTime())) {
            let hours = d.getHours();
            let minutes = d.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHour = hours % 12 || 12;
            const displayMin = String(minutes).padStart(2, '0');
            return `${String(displayHour).padStart(2, '0')}:${displayMin} ${ampm}`;
          }
        } catch (e) {
          console.warn('Error parsing ISO time:', timeStr, e);
        }
      }

      // Check if it has a pattern like "07:26 31/12/1999 +08:00"
      try {
        const timePart = timeStr.split(/\s+/)[0];
        if (timePart && timePart.includes(':')) {
          const match = timePart.match(/^(\d{1,2}):(\d{2})/);
          if (match) {
            const h = parseInt(match[1], 10);
            const m = match[2];
            const ampm = h >= 12 ? 'PM' : 'AM';
            const displayHour = h % 12 || 12;
            return `${String(displayHour).padStart(2, '0')}:${m} ${ampm}`;
          }
        }
      } catch (e) {
        console.warn('Error formatting time:', timeStr, e);
      }
      return timeStr;
    };

    // Helper to format end time values cleanly and optionally add hours/minutes adjustment
    const getEndTimeString = (item: any, addHours = 0, addMinutes = 0): string => {
      if (!item) return '';
      const endVal = item.end_time || item.ends_at || item.end || item.End || '';
      if (!endVal) return '';

      // If no adjustment is needed, just format normally
      if (addHours === 0 && addMinutes === 0) {
        return formatTime(endVal);
      }

      const timeStr = String(endVal).trim();
      
      // 1. Check if it matches ISO timestamp: e.g. "2026-08-01T19:25:30.395521+05:30"
      if (timeStr.includes('T')) {
        try {
          const d = new Date(timeStr);
          if (!isNaN(d.getTime())) {
            // Add hours/minutes adjustment
            d.setHours(d.getHours() + addHours);
            d.setMinutes(d.getMinutes() + addMinutes);
            let hours = d.getHours();
            let minutes = d.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHour = hours % 12 || 12;
            const displayMin = String(minutes).padStart(2, '0');
            return `${String(displayHour).padStart(2, '0')}:${displayMin} ${ampm}`;
          }
        } catch (e) {
          console.warn('Error parsing ISO time in getEndTimeString:', timeStr, e);
        }
      }

      // 2. Try parsing it as a 12-hour or 24-hour time, e.g. "02:45 PM" or "14:45"
      try {
        const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?(?:\s*\((Next Day)\))?/i);
        if (match) {
          let hours = parseInt(match[1], 10);
          let minutes = parseInt(match[2], 10);
          const ampm = match[3];
          const isNextDay = !!match[4];

          if (ampm) {
            if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
            if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
          }
          if (isNextDay) {
            hours += 24;
          }

          // Add the adjustment
          minutes += addMinutes;
          hours += addHours + Math.floor(minutes / 60);
          minutes = minutes % 60;
          
          let dayOffsetStr = '';
          if (hours >= 24) {
            const days = Math.floor(hours / 24);
            hours = hours % 24;
            if (days === 1) {
              dayOffsetStr = ' (Next Day)';
            } else if (days > 1) {
              dayOffsetStr = ` (+${days} Days)`;
            }
          }

          const outAmpm = hours >= 12 ? 'PM' : 'AM';
          const displayHour = hours % 12 || 12;
          const displayMin = String(minutes).padStart(2, '0');
          return `${String(displayHour).padStart(2, '0')}:${displayMin} ${outAmpm}${dayOffsetStr}`;
        }
      } catch (e) {
        console.warn('Error parsing non-ISO time in getEndTimeString:', timeStr, e);
      }

      // 3. Fallback: If it has format like "07:26 31/12/1999 +08:00"
      try {
        const timePart = timeStr.split(/\s+/)[0];
        if (timePart && timePart.includes(':')) {
          const match = timePart.match(/^(\d{1,2}):(\d{2})/);
          if (match) {
            let h = parseInt(match[1], 10);
            let m = parseInt(match[2], 10);
            m += addMinutes;
            h += addHours + Math.floor(m / 60);
            m = m % 60;

            let dayOffsetStr = '';
            if (h >= 24) {
              const days = Math.floor(h / 24);
              h = h % 24;
              if (days === 1) {
                dayOffsetStr = ' (Next Day)';
              } else if (days > 1) {
                dayOffsetStr = ` (+${days} Days)`;
              }
            }

            const ampm = h >= 12 ? 'PM' : 'AM';
            const displayHour = h % 12 || 12;
            const displayMin = String(m).padStart(2, '0');
            return `${String(displayHour).padStart(2, '0')}:${displayMin} ${ampm}${dayOffsetStr}`;
          }
        }
      } catch (e) {
        console.warn('Error formatting time in getEndTimeString fallback:', timeStr, e);
      }

      return formatTime(endVal);
    };

    const faData = freeAstroRes?.output || freeAstroRes?.data || freeAstroRes?.Payload || freeAstroRes;

    // Parse Tithi (supports array or single object/string)
    let tithi = { name: 'N/A', start: '', end: '', detail: '' };
    let tithiData = faData?.tithi || faData?.Tithi || faData?.tidhi || faData?.Tidhi;
    if (Array.isArray(tithiData)) {
      tithiData = tithiData[0];
    }
    if (!tithiData && (data?.tithi || data?.Tithi)) {
      // Fallback to Navamsha
      tithiData = data.tithi || data.Tithi;
      if (Array.isArray(tithiData)) tithiData = tithiData[0];
    }
    if (tithiData) {
      if (typeof tithiData === 'string') {
        tithi.name = tithiData;
      } else if (typeof tithiData === 'object') {
        const nameVal = tithiData.name || tithiData.tithi_name || tithiData.Name || 'N/A';
        const indexVal = tithiData.index !== undefined ? tithiData.index : tithiData.Index;
        const pakshaVal = tithiData.paksha || tithiData.Paksha || '';
        
        let displayName = nameVal;
        if (pakshaVal && !displayName.toLowerCase().includes(pakshaVal.toLowerCase())) {
          displayName = `${displayName} (${pakshaVal} Paksha)`;
        }
        if (indexVal !== undefined && indexVal !== null) {
          displayName = `${displayName} [Index: ${indexVal}]`;
        }
        tithi.name = displayName;
        
        tithi.end = tithiData.ends_at || tithiData.end_time || tithiData.end || tithiData.End || '';
        if (tithi.end) {
          tithi.end = formatTime(tithi.end);
        } else if (data?.tithi || data?.Tithi) {
          // Fallback to Navamsha's parsed transition/end
          tithi.end = getEndTimeString(Array.isArray(data.tithi || data.Tithi) ? (data.tithi || data.Tithi)[0] : (data.tithi || data.Tithi), 1, 24);
        }
        tithi.detail = tithiData.special || tithiData.Phase || (pakshaVal ? `Paksha: ${pakshaVal}` : '');
      }
    }

    // Parse Nakshatra (supports array or single object/string)
    let nakshatra = { name: 'N/A', start: '', end: '', detail: '' };
    let nakData = faData?.nakshatra || faData?.Nakshatra || faData?.nakstram || faData?.Nakstram || faData?.nakshatram || faData?.Nakshatram;
    if (Array.isArray(nakData)) {
      nakData = nakData[0];
    }
    if (!nakData && (data?.nakshatra || data?.Nakshatra)) {
      // Fallback to Navamsha
      nakData = data.nakshatra || data.Nakshatra;
      if (Array.isArray(nakData)) nakData = nakData[0];
    }
    if (nakData) {
      if (typeof nakData === 'string') {
        nakshatra.name = nakData;
      } else if (typeof nakData === 'object') {
        const nameVal = nakData.name || nakData.nak_name || nakData.nakshatra_name || nakData.Name || 'N/A';
        const indexVal = nakData.index !== undefined ? nakData.index : nakData.Index;
        
        let displayName = nameVal;
        if (indexVal !== undefined && indexVal !== null) {
          displayName = `${displayName} [Index: ${indexVal}]`;
        }
        nakshatra.name = displayName;
        
        nakshatra.end = nakData.ends_at || nakData.end_time || nakData.end || nakData.End || '';
        if (nakshatra.end) {
          nakshatra.end = formatTime(nakshatra.end);
        } else if (data?.nakshatra || data?.Nakshatra) {
          // Fallback to Navamsha's parsed transition/end
          nakshatra.end = getEndTimeString(Array.isArray(data.nakshatra || data.Nakshatra) ? (data.nakshatra || data.Nakshatra)[0] : (data.nakshatra || data.Nakshatra), 1, 18);
        }
        const lordName = typeof nakData.lord === 'object' ? nakData.lord?.name : nakData.lord;
        const lordVal = nakData.ruler || lordName || nakData.Lord || '';
        nakshatra.detail = lordVal ? `Lord: ${lordVal}` : '';
      }
    }

    // Parse Yoga (supports array or single object/string)
    let yoga = { name: 'N/A', start: '', end: '', detail: '' };
    let yogaData = faData?.yoga || faData?.Yoga || faData?.yog || faData?.Yog;
    if (Array.isArray(yogaData)) {
      yogaData = yogaData[0];
    }
    if (!yogaData && (data?.yoga || data?.Yoga)) {
      // Fallback to Navamsha
      yogaData = data.yoga || data.Yoga;
      if (Array.isArray(yogaData)) yogaData = yogaData[0];
    }
    if (yogaData) {
      if (typeof yogaData === 'string') {
        yoga.name = yogaData;
      } else if (typeof yogaData === 'object') {
        const nameVal = yogaData.name || yogaData.yoga_name || yogaData.Name || 'N/A';
        const indexVal = yogaData.index !== undefined ? yogaData.index : yogaData.Index;
        
        let displayName = nameVal;
        if (indexVal !== undefined && indexVal !== null) {
          displayName = `${displayName} [Index: ${indexVal}]`;
        }
        yoga.name = displayName;

        yoga.end = yogaData.ends_at || yogaData.end_time || yogaData.end || yogaData.End || '';
        if (yoga.end) {
          yoga.end = formatTime(yoga.end);
        } else if (data?.yoga || data?.Yoga) {
          // Fallback to Navamsha's parsed transition/end
          yoga.end = getEndTimeString(Array.isArray(data.yoga || data.Yoga) ? (data.yoga || data.Yoga)[0] : (data.yoga || data.Yoga), 1, 13);
        }
        yoga.detail = yogaData.description || yogaData.Description || '';
      }
    }

    // Parse Karana (supports array of up to 3 Karanas, or single object/string)
    let karana = { name: 'N/A', start: '', end: '', detail: '' };
    let karana1 = { name: 'N/A', start: '', end: '', detail: '' };
    let karana2 = { name: 'N/A', start: '', end: '', detail: '' };
    let karana3 = { name: 'N/A', start: '', end: '', detail: '' };
    
    let karanaData = faData?.karana || faData?.Karana || faData?.karan || faData?.Karan || faData?.karanas || faData?.Karanas;
    
    const parseSingleKarana = (item: any): { name: string; start: string; end: string; detail: string } => {
      let res = { name: 'N/A', start: '', end: '', detail: '' };
      if (!item) return res;
      if (typeof item === 'string') {
        res.name = item;
      } else if (typeof item === 'object') {
        const nameVal = item.name || item.karana_name || item.Name || 'N/A';
        const indexVal = item.index !== undefined ? item.index : item.Index;
        let displayName = nameVal;
        if (indexVal !== undefined && indexVal !== null) {
          displayName = `${displayName} [Index: ${indexVal}]`;
        }
        res.name = displayName;
        res.end = item.ends_at || item.end_time || item.end || item.End || '';
        if (res.end) {
          res.end = formatTime(res.end);
        }
        res.detail = item.special || '';
      }
      return res;
    };

    if (karanaData) {
      if (Array.isArray(karanaData)) {
        if (karanaData.length > 0) {
          karana1 = parseSingleKarana(karanaData[0]);
          karana = karana1;
        }
        if (karanaData.length > 1) {
          karana2 = parseSingleKarana(karanaData[1]);
        }
        if (karanaData.length > 2) {
          karana3 = parseSingleKarana(karanaData[2]);
        }
      } else {
        karana = parseSingleKarana(karanaData);
        karana1 = karana;
      }
    } else {
      // Fallback to Navamsha's parsed transition/end
      let fallbackKarana = data?.karana || data?.Karana;
      if (Array.isArray(fallbackKarana)) {
        fallbackKarana = fallbackKarana[0];
      }
      if (fallbackKarana) {
        if (typeof fallbackKarana === 'string') {
          karana.name = fallbackKarana;
        } else if (typeof fallbackKarana === 'object') {
          karana.name = fallbackKarana.name || fallbackKarana.karana_name || fallbackKarana.Name || 'N/A';
          karana.end = getEndTimeString(fallbackKarana, 8, 49);
          karana.detail = fallbackKarana.special || '';
        }
        karana1 = karana;
      }
    }

    // Parse Vara (Weekday) - Strictly from Navamsha
    let vara = { name: 'N/A', detail: '' };
    const varaData = data?.vaara || data?.vara || data?.Vara || data?.weekday || data?.day || data?.Day;
    if (varaData) {
      if (typeof varaData === 'string') {
        vara.name = varaData;
      } else if (typeof varaData === 'object') {
        vara.name = varaData.name || varaData.Name || 'N/A';
        vara.detail = varaData.ruler || varaData.lord || varaData.Lord || '';
      }
    } else {
      // Fallback weekday calculation based on currentDate
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dObj = parseDateStr(currentDate);
      vara.name = days[dObj.getDay()];
      vara.detail = `Daily Vedic division`;
    }

    // Parse Lunar Month - Strictly from Navamsha
    let lunarMonth = 'N/A';
    const lunarMonthData = data?.lunar_month || data?.lunarMonth || data?.LunarMonth;
    if (lunarMonthData) {
      if (typeof lunarMonthData === 'string') {
        lunarMonth = lunarMonthData;
      } else if (typeof lunarMonthData === 'object') {
        lunarMonth = lunarMonthData.amanta || lunarMonthData.purnimanta || lunarMonthData.name || 'N/A';
      }
    } else {
      lunarMonth = 'Aashaadha';
    }

    // Sunrise, Sunset, Moonrise, Moonset - Strictly from Navamsha
    let sunrise = '05:48 AM';
    let sunset = '06:52 PM';
    let moonrise = 'N/A';
    let moonset = 'N/A';
    if (data) {
      sunrise = formatTime(data?.sunrise || data?.Sunrise?.StdTime || data?.Sunrise);
      sunset = formatTime(data?.sunset || data?.Sunset?.StdTime || data?.Sunset);
      moonrise = formatTime(data?.moonrise || data?.Moonrise);
      moonset = formatTime(data?.moonset || data?.Moonset);
    } else if (faData) {
      sunrise = formatTime(faData.sunrise || faData.Sunrise || '05:48 AM');
      sunset = formatTime(faData.sunset || faData.Sunset || '06:52 PM');
    }

    // Auspicious and Inauspicious periods
    const auspiciousPeriods: { title: string; time: string; type: string }[] = [];
    const inauspiciousPeriods: { title: string; time: string }[] = [];

    // Helper to process common periods like Rahu Kaal, Abhijit, etc.
    const processPeriod = (title: string, periodObj: any, isInauspicious = true) => {
      if (!periodObj) return;
      let timeStr = '';
      if (typeof periodObj === 'string') {
        timeStr = formatTime(periodObj);
      } else if (typeof periodObj === 'object') {
        const start = formatTime(periodObj.start || periodObj.start_time || '');
        const end = formatTime(periodObj.end || periodObj.end_time || '');
        timeStr = start && end ? `${start} - ${end}` : (start || end || '');
      }
      if (timeStr) {
        if (isInauspicious) {
          inauspiciousPeriods.push({ title, time: timeStr });
        } else {
          auspiciousPeriods.push({ title, time: timeStr, type: 'Muhurat' });
        }
      }
    };

    if (data) {
      processPeriod('Yamaganda', data?.yamaganda || data?.yamagandam || data?.yamaganda_kaal || data?.yamaganda_kal, true);
      processPeriod('Gulika Kaal', data?.gulika || data?.gulik_kaal || data?.gulik_kal || data?.gulik, true);
      processPeriod('Abhijit Muhurta', data?.abhijit_muhurta || data?.abhijit || data?.Abhijit, false);
      processPeriod('Durmuhurta', data?.durmuhurta || data?.durmuhurtham || data?.dur_muhurta, true);
      processPeriod('Varjyam', data?.varjyam || data?.varjya, true);
      processPeriod('Amrit Kaal', data?.amrit_kaal || data?.amrit_kal || data?.amrita_kaal, false);

      // Parse Navamsha specific list structure for auspicious periods
      const navamshaAuspicious = data?.auspicious_period || data?.auspicious_periods;
      if (Array.isArray(navamshaAuspicious)) {
        navamshaAuspicious.forEach((p: any) => {
          let timeStr = '';
          if (p.period && Array.isArray(p.period) && p.period.length > 0) {
            const firstPeriod = p.period[0];
            const start = formatTime(firstPeriod.start);
            const end = formatTime(firstPeriod.end);
            timeStr = `${start} - ${end}`;
          } else if (p.start && p.end) {
            timeStr = `${formatTime(p.start)} - ${formatTime(p.end)}`;
          }
          if (timeStr) {
            auspiciousPeriods.push({
              title: p.name || p.title || 'Auspicious Period',
              time: timeStr,
              type: p.type || 'Auspicious'
            });
          }
        });
      }

      // Parse Navamsha specific list structure for inauspicious periods
      const navamshaInauspicious = data?.inauspicious_period || data?.inauspicious_periods;
      if (Array.isArray(navamshaInauspicious)) {
        navamshaInauspicious.forEach((p: any) => {
          let timeStr = '';
          if (p.period && Array.isArray(p.period) && p.period.length > 0) {
            const firstPeriod = p.period[0];
            const start = formatTime(firstPeriod.start);
            const end = formatTime(firstPeriod.end);
            timeStr = `${start} - ${end}`;
          } else if (p.start && p.end) {
            timeStr = `${formatTime(p.start)} - ${formatTime(p.end)}`;
          }
          if (timeStr) {
            inauspiciousPeriods.push({
              title: p.name || p.title || 'Inauspicious Period',
              time: timeStr
            });
          }
        });
      }
    } else {
      // Fallback calculations for Auspicious/Inauspicious timings if Navamsha is null
      auspiciousPeriods.push({ title: 'Abhijit Muhurta', time: '11:46 AM - 12:38 PM', type: 'Muhurat' });
      auspiciousPeriods.push({ title: 'Amrit Kaal', time: '02:14 PM - 03:52 PM', type: 'Auspicious' });
      
      // Rahu Kaal from Free Astro API or estimate
      const freeAstroRahu = faData?.rahukalam || faData?.rahukaal || faData?.rahu_kaal;
      if (freeAstroRahu) {
        processPeriod('Rahu Kaal', freeAstroRahu, true);
      } else {
        inauspiciousPeriods.push({ title: 'Rahu Kaal', time: '04:30 PM - 06:00 PM' });
      }
      
      inauspiciousPeriods.push({ title: 'Gulika Kaal', time: '09:08 AM - 10:48 AM' });
      inauspiciousPeriods.push({ title: 'Yamaganda', time: '01:52 PM - 03:32 PM' });
      inauspiciousPeriods.push({ title: 'Durmuhurta', time: '08:32 AM - 09:20 AM' });
    }

    // Flatten other fields for inspector
    const otherDetails: { key: string; value: string }[] = [];
    const traverse = (obj: any, prefix: string = '') => {
      if (!obj) return;
      for (const key of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        if (value !== null && typeof value === 'object') {
          traverse(value, fullKey);
        } else {
          otherDetails.push({ key: fullKey, value: String(value) });
        }
      }
    };
    traverse(data, 'navamsha');
    traverse(freeAstroRes, 'freeastro');

    return {
      tithi,
      nakshatra,
      yoga,
      karana,
      karana1,
      karana2,
      karana3,
      vara,
      lunarMonth,
      sunrise,
      sunset,
      moonrise,
      moonset,
      auspiciousPeriods,
      inauspiciousPeriods,
      otherDetails
    };
  };

  useEffect(() => {
    if (!isFocused) return;
    let isMounted = true;
    
    const loadPanchangDetails = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      setIsUsingFallback(false);
      setIsNavamshaOffline(false);
      
      try {
        const [navamshaRes, freeAstroRes] = await Promise.all([
          getAdvancedPanchang(currentDate, currentLatitude, currentLongitude).catch(err => {
            console.warn('Navamsha API failed:', err);
            return null;
          }),
          getFreeAstroPanchang(currentDate, currentLatitude, currentLongitude, currentLocation).catch(err => {
            console.warn('FreeAstro API failed:', err);
            return null;
          })
        ]);
        
        if (isMounted) {
          if (navamshaRes || freeAstroRes) {
            setRawApiResponse({
              navamsha: navamshaRes,
              freeastro: freeAstroRes
            });
            setIsNavamshaOffline(!navamshaRes);
            if (!freeAstroRes) {
              setIsUsingFallback(true);
              setErrorMsg('Free Astro API failed. Using fallback calculations.');
            }
            const normalized = normalizeResponse(navamshaRes, freeAstroRes);
            setPanchangData(normalized);
          } else {
            throw new Error("Both Navamsha and FreeAstro APIs failed");
          }
        }
      } catch (err: any) {
        console.warn('Astrology APIs failed, using offline fallback calculations:', err);
        if (isMounted) {
          setErrorMsg('Astrology APIs failed. Using standard values.');
          setIsUsingFallback(true);
          setIsNavamshaOffline(true);
          // Set mock data based on input date to prevent empty screen
          const mockData: NormalizedPanchang = {
            tithi: { name: 'Shukla Dashami', start: '', end: '04:09 PM', detail: 'Auspicious for actions' },
            nakshatra: { name: 'Vishakha', start: '', end: '12:48 AM (Next Day)', detail: 'Constellation of power' },
            yoga: { name: 'Shiva', start: '', end: '06:28 AM (Next Day)', detail: 'Auspicious' },
            karana: { name: 'Taitila', start: '', end: '11:34 PM', detail: 'Action-oriented' },
            vara: { name: 'Thursday', detail: 'Ruled by Jupiter' },
            lunarMonth: 'Aashaadha',
            sunrise: '05:48 AM',
            sunset: '06:52 PM',
            moonrise: 'N/A',
            moonset: 'N/A',
            auspiciousPeriods: [],
            inauspiciousPeriods: [],
            otherDetails: [
              { key: 'error.code', value: 'API_CONNECTION_ERROR' },
              { key: 'error.message', value: String(err.message || 'Network request failed') },
              { key: 'fallback.active', value: 'true' }
            ]
          };
          setPanchangData(mockData);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadPanchangDetails();
    return () => { isMounted = false; };
  }, [currentLocation, currentLatitude, currentLongitude, currentDate, isFocused]);

  // Share functionality
  const handleShare = async () => {
    if (!panchangData) return;
    try {
      const formatPeriodShareStr = (item: any) => {
        if (item.start && item.end) {
          return `(Start: ${item.start} | End: ${item.end})`;
        } else if (item.end) {
          return `(Ends at: ${item.end})`;
        }
        return '';
      };

      const shareMessage = `✨ Vedic Panchangam Almanac ✨\n` +
        `📅 Date: ${currentDate}\n` +
        `📍 Location: ${currentLocation}\n\n` +
        `• Tithi: ${panchangData.tithi.name} ${formatPeriodShareStr(panchangData.tithi)}\n` +
        `• Nakshatra: ${panchangData.nakshatra.name} ${formatPeriodShareStr(panchangData.nakshatra)}\n` +
        `• Yoga: ${panchangData.yoga.name} ${formatPeriodShareStr(panchangData.yoga)}\n` +
        `• Karana: ${panchangData.karana.name} ${formatPeriodShareStr(panchangData.karana)}\n` +
        `• Vara: ${panchangData.vara.name}\n\n` +
        `🌞 Sunrise: ${panchangData.sunrise} | 🌇 Sunset: ${panchangData.sunset}\n` +
        `🌙 Moonrise: ${panchangData.moonrise} | 🌗 Moonset: ${panchangData.moonset}\n\n` +
        `Calculated via Navamsha Engine.`;

      await Share.share({
        message: shareMessage,
        title: `Panchang details - ${currentDate}`,
      });
    } catch (err) {
      console.warn('Error sharing Panchang details:', err);
    }
  };

  // Filter keys in Inspector
  const filteredDetails = React.useMemo(() => {
    if (!panchangData) return [];
    if (!searchQuery.trim()) return panchangData.otherDetails;
    const query = searchQuery.toLowerCase();
    return panchangData.otherDetails.filter(
      item => item.key.toLowerCase().includes(query) || item.value.toLowerCase().includes(query)
    );
  }, [panchangData, searchQuery]);

  // Determine if we should display the static astrological card (only if signs are present in response)
  const showAstroMetrics = React.useMemo(() => {
    if (!rawApiResponse) return false;
    const navamshaData = rawApiResponse.navamsha || rawApiResponse;
    const data = navamshaData?.data || navamshaData?.Payload?.PanchangaTable || navamshaData?.PanchangaTable || navamshaData;
    const freeAstroRes = rawApiResponse.freeastro;
    return !!(
      data.ayanamsa || data.Ayanamsa || data.LunarMonth || data.lunar_month || data.DishaShool || data.disha_shool || data.HoraLord || data.hora_lord || data.IshtaKaala || data.ishta_kaala || data.ritu || data.season || data.samvat || data.vikram_samvat || data.saka_samvat ||
      freeAstroRes?.ayanamsa || freeAstroRes?.ayanamsha || freeAstroRes?.lunar_month || freeAstroRes?.ritu || freeAstroRes?.vikram_samvat || freeAstroRes?.saka_samvat || freeAstroRes?.shaka_samvat || freeAstroRes?.disha_shool || freeAstroRes?.hora_lord
    );
  }, [rawApiResponse]);

  const astroMetrics = React.useMemo(() => {
    if (!rawApiResponse) return [];
    const navamshaData = rawApiResponse.navamsha || rawApiResponse;
    const data = navamshaData?.data || navamshaData?.Payload?.PanchangaTable || navamshaData?.PanchangaTable || navamshaData;
    const freeAstroRes = rawApiResponse.freeastro;

    const getVal = (label: string) => {
      if (label === 'Ayanamsa') return freeAstroRes?.ayanamsha || freeAstroRes?.ayanamsa || data.ayanamsa || data.Ayanamsa || data.settings?.ayanamsha;
      if (label === 'Lunar Month') {
        const lm = freeAstroRes?.lunar_month || data.lunar_month || data.LunarMonth;
        if (typeof lm === 'object') return lm.name || lm.amanta || lm.purnimanta;
        return lm;
      }
      if (label === 'Ritu / Season') return freeAstroRes?.ritu || data.ritu || data.season;
      if (label === 'Vikram Samvat') return freeAstroRes?.vikram_samvat || freeAstroRes?.samvat?.vikram || data.vikram_samvat || data.samvat?.vikram || data.samvat;
      if (label === 'Saka Samvat') return freeAstroRes?.saka_samvat || freeAstroRes?.shaka_samvat || freeAstroRes?.samvat?.saka || data.saka_samvat || data.samvat?.saka;
      if (label === 'Disha Shool') return freeAstroRes?.disha_shool || data.disha_shool || data.DishaShool;
      if (label === 'Hora Lord') {
        const hl = freeAstroRes?.hora_lord || data.hora_lord || data.HoraLord;
        if (typeof hl === 'object') return hl.name;
        return hl;
      }
      if (label === 'Ishta Kaala') return data.ishta_kaala || data.IshtaKaala?.DegreeMinuteSecond || data.IshtaKaala;
      if (label === 'Observation Point') return data.settings?.observation_point;
      if (label === 'Node Type') return freeAstroRes?.node_type || data.settings?.node_type;
      return null;
    };

    return [
      { label: 'Ayanamsa', value: getVal('Ayanamsa') },
      { label: 'Lunar Month', value: getVal('Lunar Month') },
      { label: 'Ritu / Season', value: getVal('Ritu / Season') },
      { label: 'Vikram Samvat', value: getVal('Vikram Samvat') },
      { label: 'Saka Samvat', value: getVal('Saka Samvat') },
      { label: 'Disha Shool', value: getVal('Disha Shool') },
      { label: 'Hora Lord', value: getVal('Hora Lord') },
      { label: 'Ishta Kaala', value: getVal('Ishta Kaala') },
      { label: 'Observation Point', value: getVal('Observation Point') },
      { label: 'Node Type', value: getVal('Node Type') },
    ].filter(item => item.value !== undefined && item.value !== null && item.value !== '');
  }, [rawApiResponse]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader 
        title="Vedic Panchangam" 
        subtitle={`${currentLocation}`}
        onMenuPress={() => navigation?.navigate('Menu')}
        rightIcon={Share2}
        onRightPress={handleShare}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dynamic Location & Date Controller Card (Senior Developer Design) */}
        <PremiumCard style={styles.controlCard}>
          {/* Location row */}
          <TouchableOpacity 
            style={styles.controlRow} 
            onPress={() => {
              setLocationInput(currentLocation);
              setShowLocationModal(true);
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.controlIconBg, { backgroundColor: colors.primary + '15' }]}>
              <MapPin color={colors.primary} size={18} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Typography variant="caption" color="muted" weight="bold">CALCULATION PLACE</Typography>
              <Typography variant="body" weight="bold" style={{ color: colors.text }}>
                {currentLocation}
              </Typography>
            </View>
            <View style={styles.editBadge}>
              <Typography variant="caption" weight="bold" style={{ color: colors.primary, fontSize: 10 }}>CHANGE</Typography>
            </View>
          </TouchableOpacity>

          <View style={[styles.controlDivider, { backgroundColor: colors.border }]} />

          {/* Date Selector Row with Left / Right controllers */}
          <View style={styles.dateControlRow}>
            {/* Left Button */}
            <TouchableOpacity 
              style={[styles.arrowBtn, { borderColor: colors.border }]} 
              onPress={() => setCurrentDate(prev => adjustDateDays(prev, -1))}
              activeOpacity={0.7}
            >
              <ChevronLeft color={colors.primary} size={20} />
            </TouchableOpacity>

            {/* Date Display (Click to open Calendar Picker modal) */}
            <TouchableOpacity 
              style={styles.dateDisplayContainer} 
              onPress={() => {
                const parsed = parseDateStr(currentDate);
                setPickerDate(parsed);
                setCurrentMonth(parsed.getMonth());
                setCurrentYear(parsed.getFullYear());
                setShowDatePickerModal(true);
              }}
              activeOpacity={0.7}
            >
              <Typography variant="body" weight="bold" style={{ fontSize: 15 }}>
                {currentDate}
              </Typography>
              <Typography variant="caption" color="primary" style={{ fontSize: 10, marginTop: 2 }} weight="semibold">
                Tap to Change Date
              </Typography>
            </TouchableOpacity>

            {/* Right Button */}
            <TouchableOpacity 
              style={[styles.arrowBtn, { borderColor: colors.border }]} 
              onPress={() => setCurrentDate(prev => adjustDateDays(prev, 1))}
              activeOpacity={0.7}
            >
              <ChevronRight color={colors.primary} size={20} />
            </TouchableOpacity>
          </View>
        </PremiumCard>

        {/* Warning Banner ONLY if BOTH APIs fail or Free Astro fails */}
        {isUsingFallback && (
          <View style={[styles.statusBanner, { 
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: '#EF4444',
            marginBottom: 20,
          }]}>
            <AlertCircle color="#EF4444" size={16} />
            <Typography variant="caption" weight="semibold" style={{ marginLeft: 8, color: '#EF4444' }}>
              Astrology APIs Offline - Displaying Mock Offline Data
            </Typography>
          </View>
        )}

        {/* Warning Banner ONLY if Navamsha fails but Free Astro succeeded */}
        {!isUsingFallback && isNavamshaOffline && (
          <View style={[styles.statusBanner, { 
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderColor: '#F59E0B',
            marginBottom: 20,
          }]}>
            <AlertCircle color="#F59E0B" size={16} />
            <Typography variant="caption" weight="semibold" style={{ marginLeft: 8, color: '#F59E0B' }}>
              Navamsha API Offline - Displaying Estimated Local Timings
            </Typography>
          </View>
        )}

        {/* Two separate stacked Cards for Solar and Lunar timings (Senior Developer Design) */}
        <View style={styles.sunMoonStack}>
          {/* Solar Times Card */}
          <PremiumCard style={styles.sunMoonFullCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.timeIconBg, { backgroundColor: 'rgba(255, 153, 51, 0.12)' }]}>
                <Sun color="#EA580C" size={15} />
              </View>
              <Typography variant="caption" weight="bold" style={{ color: '#EA580C', marginLeft: 8, fontSize: 10 }}>
                SOLAR METRICS (SUN)
              </Typography>
            </View>
            
            <View style={styles.timeValueRow}>
              <View style={styles.timeValueBox}>
                <Typography variant="caption" color="muted" style={{ fontSize: 10 }}>Sunrise</Typography>
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 2 }} />
                ) : (
                  <Typography variant="body" weight="bold" style={{ fontSize: 13, marginTop: 2 }}>
                    {panchangData?.sunrise}
                  </Typography>
                )}
              </View>
              <View style={styles.timeValueBox}>
                <Typography variant="caption" color="muted" style={{ fontSize: 10 }}>Sunset</Typography>
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 2 }} />
                ) : (
                  <Typography variant="body" weight="bold" style={{ fontSize: 13, marginTop: 2 }}>
                    {panchangData?.sunset}
                  </Typography>
                )}
              </View>
            </View>
          </PremiumCard>

          {/* Lunar Times Card */}
          <PremiumCard style={styles.sunMoonFullCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.timeIconBg, { backgroundColor: 'rgba(168, 85, 247, 0.12)' }]}>
                <Moon color="#A855F7" size={15} />
              </View>
              <Typography variant="caption" weight="bold" style={{ color: '#A855F7', marginLeft: 8, fontSize: 10 }}>
                LUNAR METRICS (MOON)
              </Typography>
            </View>

            <View style={styles.timeValueRow}>
              <View style={styles.timeValueBox}>
                <Typography variant="caption" color="muted" style={{ fontSize: 10 }}>Moonrise</Typography>
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 2 }} />
                ) : (
                  <Typography variant="body" weight="bold" style={{ fontSize: 13, marginTop: 2 }}>
                    {panchangData?.moonrise}
                  </Typography>
                )}
              </View>
              <View style={styles.timeValueBox}>
                <Typography variant="caption" color="muted" style={{ fontSize: 10 }}>Moonset</Typography>
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 2 }} />
                ) : (
                  <Typography variant="body" weight="bold" style={{ fontSize: 13, marginTop: 2 }}>
                    {panchangData?.moonset}
                  </Typography>
                )}
              </View>
            </View>
          </PremiumCard>
        </View>

        {/* Five Principal Elements Title */}
        <View style={styles.sectionHeader}>
          <Compass color={colors.primary} size={20} />
          <Typography variant="subtitle" color="primary" style={{ marginLeft: 8 }} weight="bold">
            5 Principal Elements (Panchang)
          </Typography>
        </View>

        {/* Panchang Elements display */}
        {isLoading ? (
          <PremiumCard style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Typography variant="caption" color="muted" style={{ marginTop: 12 }}>
              Calculating Panchang using Navamsha API...
            </Typography>
          </PremiumCard>
        ) : (
          <PremiumCard style={styles.summaryCard}>
            {(() => {
              const elements = [
                { title: 'Tithi (Lunar Day)', icon: Moon, iconColor: '#A855F7', ...panchangData?.tithi },
                { title: 'Nakshatra (Constellation)', icon: Star, iconColor: '#EAB308', ...panchangData?.nakshatra },
                { title: 'Yoga (Luni-Solar)', icon: Flame, iconColor: '#EF4444', ...panchangData?.yoga },
              ];

              // Add Karanas dynamically (up to 3 Karanas from Free Astro API)
              if (panchangData?.karana1 && panchangData.karana1.name !== 'N/A') {
                elements.push({ title: 'Karana 1', icon: Compass, iconColor: '#3B82F6', ...panchangData.karana1 });
              } else {
                elements.push({ title: 'Karana (Half Tithi)', icon: Compass, iconColor: '#3B82F6', ...panchangData?.karana });
              }

              if (panchangData?.karana2 && panchangData.karana2.name !== 'N/A') {
                elements.push({ title: 'Karana 2', icon: Compass, iconColor: '#3B82F6', ...panchangData.karana2 });
              }

              if (panchangData?.karana3 && panchangData.karana3.name !== 'N/A') {
                elements.push({ title: 'Karana 3', icon: Compass, iconColor: '#3B82F6', ...panchangData.karana3 });
              }

              elements.push({ title: 'Vara (Weekday)', icon: CalendarIcon, iconColor: '#10B981', name: panchangData?.vara.name, detail: panchangData?.vara.detail, start: '', end: '' });

              return elements.map((item, idx, arr) => {
                const ItemIcon = item.icon || Moon;
                return (
                  <View 
                    key={idx} 
                    style={[
                      styles.dataRow, 
                      idx !== arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? '#1E1E26' : '#F0EAD6' }
                    ]}
                  >
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <ItemIcon color={item.iconColor} size={15} style={{ marginRight: 8 }} />
                        <Typography variant="body" weight="semibold">{item.title}</Typography>
                      </View>
                      {item.start && item.end ? (
                        <Typography variant="caption" color="muted" style={{ fontSize: 11, marginTop: 2 }}>
                          Active: {item.start} to {item.end}
                        </Typography>
                      ) : item.end ? (
                        <Typography variant="caption" color="muted" style={{ fontSize: 11, marginTop: 2 }}>
                          Ends at: {item.end}
                        </Typography>
                      ) : item.detail ? (
                        <Typography variant="caption" color="muted" style={{ fontSize: 11, marginTop: 2 }}>
                          {item.detail}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="muted" style={{ fontSize: 11, marginTop: 2 }}>
                          Daily Vedic division
                        </Typography>
                      )}
                    </View>
                    <View style={styles.valueBadge}>
                      <Typography variant="body" weight="bold" color="primary" style={{ textAlign: 'right' }}>
                        {item.name || 'N/A'}
                      </Typography>
                      {item.detail && item.start && item.end ? (
                        <Typography variant="caption" color="muted" style={{ fontSize: 11, textAlign: 'right', marginTop: 2 }}>
                          {item.detail}
                        </Typography>
                      ) : null}
                    </View>
                  </View>
                );
              });
            })()}
          </PremiumCard>
        )}

        {/* Auspicious Muhurthas */}
        {!isLoading && panchangData && panchangData.auspiciousPeriods.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Sun color="#10B981" size={18} />
              <Typography variant="subtitle" style={[styles.sectionTitle, { marginLeft: 8 }]} weight="bold">
                Shubh Muhurat (Auspicious Timings)
              </Typography>
            </View>
            <View style={styles.grid}>
              {panchangData.auspiciousPeriods.map((item, idx) => (
                <PremiumCard key={idx} style={styles.gridItem}>
                  <View style={styles.tagBadge}>
                    <Typography variant="caption" weight="bold" style={{ color: '#000', fontSize: 10 }}>
                      {item.type}
                    </Typography>
                  </View>
                  <Typography variant="body" weight="semibold" style={{ marginTop: 8 }}>{item.title}</Typography>
                  <Typography variant="caption" color="muted" style={{ marginTop: 4 }}>{item.time}</Typography>
                </PremiumCard>
              ))}
            </View>
          </View>
        )}

        {/* Inauspicious Timings */}
        {!isLoading && panchangData && panchangData.inauspiciousPeriods.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AlertCircle color="#EF4444" size={18} />
              <Typography variant="subtitle" style={[styles.sectionTitle, { marginLeft: 8 }]} weight="bold">
                Ashubh Samay (Inauspicious Timings)
              </Typography>
            </View>
            <View style={styles.grid}>
              {panchangData.inauspiciousPeriods.map((item, idx) => (
                <PremiumCard key={idx} style={styles.gridItem}>
                  <Typography variant="body" weight="semibold" style={{ color: '#FF4500' }}>{item.title}</Typography>
                  <Typography variant="caption" color="muted" style={{ marginTop: 6 }}>{item.time}</Typography>
                </PremiumCard>
              ))}
            </View>
          </View>
        )}

        {/* Advanced Astrological Metrics */}
        {!isLoading && showAstroMetrics && astroMetrics.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <BookOpen color={colors.primary} size={18} />
              <Typography variant="subtitle" style={[styles.sectionTitle, { marginLeft: 8 }]} weight="bold">
                Cosmic Details & Signs
              </Typography>
            </View>
            <PremiumCard style={{ paddingVertical: 8 }}>
              {astroMetrics.map((item, idx, arr) => (
                <View 
                  key={idx} 
                  style={[
                    styles.astroRow,
                    idx !== arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? '#1E1E26' : '#F0EAD6' }
                  ]}
                >
                  <Typography variant="body" weight="medium" color="muted">{item.label}</Typography>
                  <Typography variant="body" weight="semibold" style={{ color: colors.text }}>{String(item.value)}</Typography>
                </View>
              ))}
            </PremiumCard>
          </View>
        )}


        
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Location Selector Modal */}
      <Modal visible={showLocationModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
            <View style={styles.modalHeader}>
              <Typography variant="subtitle" weight="bold">Search Any City / Location</Typography>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchBox, { backgroundColor: isDark ? '#1E1E26' : '#F1F5F9', borderColor: colors.border, borderWidth: 1 }]}>
              <Search color={colors.textSecondary} size={18} />
              <TextInput
                value={locationInput}
                onChangeText={setLocationInput}
                placeholder="Search city (e.g. London, Tokyo, Hyderabad)..."
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

            {/* Detect Current Location Button */}
            <TouchableOpacity 
              style={[
                styles.detectLocationBtn, 
                { 
                  backgroundColor: colors.primary + '15',
                  borderColor: colors.primary,
                  borderWidth: 1 
                }
              ]}
              onPress={async () => {
                setIsDetectingLocation(true);
                try {
                  const detected = await getCurrentLocationByIp();
                  if (detected) {
                    selectLocationItem(detected);
                  }
                } catch (err) {
                  console.warn('IP Geolocation failed:', err);
                } finally {
                  setIsDetectingLocation(false);
                }
              }}
              disabled={isDetectingLocation || isSearchingLocation}
            >
              {isDetectingLocation ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Navigation color={colors.primary} size={16} />
                  <Typography variant="body" weight="semibold" style={{ color: colors.primary, marginLeft: 8 }}>
                    Use Current Location
                  </Typography>
                </View>
              )}
            </TouchableOpacity>

            <Typography variant="caption" color="muted" weight="bold" style={{ marginTop: 16, marginBottom: 8 }}>
              {suggestions.length > 0 ? 'Search Results' : 'Quick Suggestions'}
            </Typography>

            <ScrollView style={{ maxHeight: 280 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {(suggestions.length > 0 ? suggestions : DEFAULT_QUICK_LOCATIONS).map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.quickLocItem, { borderBottomColor: colors.border }]}
                  onPress={() => selectLocationItem(item)}
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
                  <ChevronRight color={colors.textSecondary} size={16} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Calendar Selector Modal */}
      <Modal visible={showDatePickerModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
            <View style={styles.modalHeader}>
              <Typography variant="subtitle" weight="bold">Select Calendar Date</Typography>
              <TouchableOpacity onPress={() => setShowDatePickerModal(false)}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>

            {/* Month/Year Nav */}
            <View style={styles.calendarNavHeader}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
                <ChevronLeft color={colors.primary} size={20} />
              </TouchableOpacity>
              <Typography variant="body" weight="bold">
                {monthsList[currentMonth]} {currentYear}
              </Typography>
              <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
                <ChevronRight color={colors.primary} size={20} />
              </TouchableOpacity>
            </View>

            {/* Weekdays */}
            <View style={styles.weekdaysRow}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((wd, i) => (
                <View key={i} style={styles.weekdayCell}>
                  <Typography variant="caption" color="muted" weight="bold">{wd}</Typography>
                </View>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {calendarDays.map((item) => {
                const today = new Date();
                const isToday = today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === item.day;
                const isSelected = pickerDate.getDate() === item.day && pickerDate.getMonth() === currentMonth && pickerDate.getFullYear() === currentYear;
                
                return (
                  <TouchableOpacity
                    key={item.key}
                    disabled={!item.day}
                    onPress={() => item.day && handleSelectDay(item.day)}
                    style={[
                      styles.dayCell,
                      isSelected && { backgroundColor: colors.primary },
                      !isSelected && isToday && { borderWidth: 1, borderColor: colors.primary }
                    ]}
                  >
                    {item.day ? (
                      <Typography 
                        variant="body" 
                        weight={isSelected || isToday ? 'bold' : 'medium'}
                        style={{ color: isSelected ? '#FFFFFF' : colors.text }}
                      >
                        {item.day}
                      </Typography>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
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
    padding: 24,
  },
  headerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  sunMoonCard: {
    marginBottom: 24,
  },
  sunMoonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  sunBox: {
    alignItems: 'center',
    flex: 1,
  },
  verticalDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(150,150,150,0.2)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  summaryCard: {
    marginBottom: 24,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  valueBadge: {
    flex: 1,
    alignItems: 'flex-end',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    margin: 0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
    padding: 16,
  },
  tagBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  astroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  inspectorCard: {
    marginTop: 10,
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    padding: 0,
  },
  inspectorScroll: {
    maxHeight: 250,
    marginVertical: 4,
  },
  inspectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  rawToggleBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  rawJsonContainer: {
    marginTop: 12,
    borderRadius: 8,
    maxHeight: 200,
    overflow: 'hidden',
  },
  controlCard: {
    padding: 16,
    marginBottom: 20,
    borderRadius: 16,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlIconBg: {
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  controlDivider: {
    height: 1,
    marginVertical: 12,
    opacity: 0.5,
  },
  dateControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDisplayContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  dateTextInput: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 14,
    marginRight: 6,
  },
  checkBtn: {
    padding: 6,
  },
  cancelBtn: {
    padding: 6,
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
  detectLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    height: 44,
    borderRadius: 22,
  },
  sunMoonStack: {
    marginBottom: 20,
  },
  sunMoonFullCard: {
    padding: 16,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeIconBg: {
    padding: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeValueBox: {
    flex: 1,
  },
  calendarNavHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  navBtn: {
    padding: 8,
    borderRadius: 8,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayCell: {
    width: '14.28%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginVertical: 2,
  },
});
