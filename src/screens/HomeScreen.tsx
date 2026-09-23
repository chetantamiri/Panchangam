import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, TextInput, Modal, ActivityIndicator, FlatList, ImageBackground } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/Typography';
import { PremiumCard } from '../components/PremiumCard';
import { AppHeader } from '../components/AppHeader';
import { AnimatedVedicFooter } from '../components/AnimatedVedicFooter';
import { LinearGradient } from 'expo-linear-gradient';
import { Menu, Sun, Moon, Calendar as CalendarIcon, MapPin, Compass, Search, Navigation, Sparkles, Star, ChevronRight, ChevronLeft, X, ArrowRight, ShieldCheck, Home, Heart } from 'lucide-react-native';
import { searchLocationSuggestions, LocationItem, getCurrentLocationByIp, setCachedLocation, getCachedLocation, setCachedDate, loadStoredLocation } from '../services/locationService';
import { getSunriseTime, getSunsetTime, getPanchangaTable } from '../services/vedAstroApi';

const { width } = Dimensions.get('window');

const CAROUSEL_ITEMS = [
  {
    id: '1',
    title: "Today's Panchang",
    subtitle: 'Shukla Dashami • Vishakha Nakshatra',
    tag: 'Auspicious Almanac',
    image: require('../../assets/pexels-renato-calsavara-51671778-8148893.jpg'),
    navTarget: 'Panchang',
    ctaText: 'View Panchang',
  },
  {
    id: '2',
    title: 'Upcoming Festivals',
    subtitle: 'Devshayani Ekadashi • In 4 Days',
    tag: 'Holy Fast & Puja',
    image: require('../../assets/pexels-kaip-1341279.jpg'),
    navTarget: 'Festivals',
    ctaText: 'Explore Festivals',
  },
  {
    id: '3',
    title: 'Good Muhurtham Today',
    subtitle: 'Abhijit Muhurat: 11:54 AM - 12:48 PM',
    tag: 'Best Divine Timing',
    image: require('../../assets/pexels-frank-cone-140140-3607542.jpg'),
    navTarget: 'Panchang',
    ctaText: 'Check Timings',
  },
  {
    id: '4',
    title: 'Daily Rashiphal',
    subtitle: 'Moon in Libra • High Spiritual Energy',
    tag: 'Vedic Predictions',
    image: require('../../assets/pexels-scott-lord-564881271-37761980.jpg'),
    navTarget: 'Menu',
    ctaText: 'Read Rashiphal',
  },
];

const DEFAULT_QUICK_LOCATIONS: LocationItem[] = [
  { name: 'New Delhi, India', fullName: 'New Delhi, Delhi, India', latitude: 28.6139, longitude: 77.2090 },
  { name: 'Mumbai, India', fullName: 'Mumbai, Maharashtra, India', latitude: 19.0760, longitude: 72.8777 },
  { name: 'Hyderabad, India', fullName: 'Hyderabad, Telangana, India', latitude: 17.3850, longitude: 78.4867 },
  { name: 'Bengaluru, India', fullName: 'Bengaluru, Karnataka, India', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Chennai, India', fullName: 'Chennai, Tamil Nadu, India', latitude: 13.0827, longitude: 80.2707 },
];

export const HomeScreen = ({ navigation }: any) => {
  const { colors, layout, spacing, isDark } = useTheme();
  const [activeSlide, setActiveSlide] = useState(0);

  const [location, setLocation] = useState('New Delhi, India');
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.2090);
  const [date, setDate] = useState(() => {
    const d = new Date();
    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const initialDate = `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
    setCachedDate(initialDate);
    return initialDate;
  });

  // Sync state date change with global cache
  useEffect(() => {
    setCachedDate(date);
  }, [date]);

  const [pickerDate, setPickerDate] = useState(new Date());
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [sunriseTime, setSunriseTime] = useState<string>('05:48 AM');
  const [sunsetTime, setSunsetTime] = useState<string>('06:52 PM');
  const [todayTithi, setTodayTithi] = useState<string>('Shukla Dashami');
  const [todayNakshatra, setTodayNakshatra] = useState<string>('Vishakha');
  const [isLoadingSunTimes, setIsLoadingSunTimes] = useState<boolean>(false);

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationInput, setLocationInput] = useState(location);
  const [suggestions, setSuggestions] = useState<LocationItem[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Load stored location or auto-detect on startup
  useEffect(() => {
    const initializeLocation = async () => {
      setIsDetectingLocation(true);
      try {
        // 1. Try to detect current location first
        const detected = await getCurrentLocationByIp();
        if (detected) {
          setLocation(detected.name);
          setLatitude(detected.latitude);
          setLongitude(detected.longitude);
          setLocationInput(detected.name);
          await setCachedLocation(detected);
          return;
        }

        // 2. Fall back to stored location if detection fails
        const stored = await loadStoredLocation();
        if (stored) {
          setLocation(stored.name);
          setLatitude(stored.latitude);
          setLongitude(stored.longitude);
          setLocationInput(stored.name);
          return;
        }
      } catch (err) {
        console.warn('Location initialization failed:', err);
      } finally {
        setIsDetectingLocation(false);
      }
    };
    initializeLocation();
  }, []);

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

  // Helper to format VedAstro Sunrise/Sunset StdTime: "07:26 31/12/1999 +08:00" -> "07:26 AM"
  const formatVedAstroTime = (stdTime: string): string => {
    if (!stdTime) return 'N/A';
    try {
      const timePart = stdTime.trim().split(/\s+/)[0];
      if (!timePart) return stdTime;
      const match = timePart.match(/^(\d{2}):(\d{2})/);
      if (match) {
        const h = parseInt(match[1], 10);
        const m = match[2];
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 || 12;
        return `${String(displayHour).padStart(2, '0')}:${m} ${ampm}`;
      }
    } catch (e) {
      console.warn('Error formatting VedAstro time:', stdTime, e);
    }
    return stdTime;
  };

  // Fetch daily Panchang details from VedAstro API (Tithi, Nakshatra, Sunrise, Sunset)
  useEffect(() => {
    let isMounted = true;
    const fetchPanchangDetails = async () => {
      setIsLoadingSunTimes(true);
      try {
        const response = await getPanchangaTable(date, latitude, longitude, location);
        
        if (isMounted && response) {
          const panchangaTable = response?.Payload?.PanchangaTable || response?.PanchangaTable || response;
          
          // Parse Sunrise/Sunset
          const sunrise = panchangaTable?.Sunrise?.StdTime ? formatVedAstroTime(panchangaTable.Sunrise.StdTime) : '05:48 AM';
          const sunset = panchangaTable?.Sunset?.StdTime ? formatVedAstroTime(panchangaTable.Sunset.StdTime) : '06:52 PM';
          setSunriseTime(sunrise);
          setSunsetTime(sunset);

          // Parse Tithi
          let tithiName = 'Shukla Dashami';
          if (panchangaTable?.Tithi?.Name) {
            const rawName = panchangaTable.Tithi.Name;
            // Capitalize first letter
            const capName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
            tithiName = panchangaTable.Tithi.Paksha 
              ? `${panchangaTable.Tithi.Paksha} ${capName}`
              : capName;
          }
          setTodayTithi(tithiName);

          // Parse Nakshatra
          let nakshatraName = 'Vishakha';
          if (panchangaTable?.Nakshatra) {
            const rawNak = panchangaTable.Nakshatra;
            nakshatraName = rawNak.charAt(0).toUpperCase() + rawNak.slice(1);
          }
          setTodayNakshatra(nakshatraName);
        }
      } catch (err) {
        console.warn('Failed to fetch daily Panchang details from VedAstro on Home:', err);
      } finally {
        if (isMounted) setIsLoadingSunTimes(false);
      }
    };

    fetchPanchangDetails();
    return () => { isMounted = false; };
  }, [location, latitude, longitude, date]);

  const handleScroll = (event: any) => {
    const slideSize = width - 80;
    const offset = event.nativeEvent.contentOffset.x;
    const activeIndex = Math.round(offset / slideSize);
    if (activeIndex >= 0 && activeIndex < CAROUSEL_ITEMS.length) {
      setActiveSlide(activeIndex);
    }
  };

  const handleCalculate = () => {
    navigation.navigate('Panchang', { location, latitude, longitude, date });
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev === CAROUSEL_ITEMS.length - 1 ? 0 : prev + 1));
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? CAROUSEL_ITEMS.length - 1 : prev - 1));
  };

  const handleCardPress = () => {
    const item = CAROUSEL_ITEMS[activeSlide];
    if (item.navTarget === 'Panchang') {
      navigation.navigate('Panchang', { location, latitude, longitude, date });
    } else {
      navigation.navigate(item.navTarget as any);
    }
  };

  const selectLocationItem = (item: LocationItem) => {
    setLocation(item.name);
    setLatitude(item.latitude);
    setLongitude(item.longitude);
    setLocationInput(item.name);
    setCachedLocation(item);
    setShowLocationModal(false);
  };

  const getCosmicGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) {
      return {
        title: "Auspicious Morning ✨",
        subtitle: "May the morning Sun bring clarity, peace, and spiritual growth to your path today.",
        icon: Sun,
        iconColor: '#EA580C',
        bgColor: isDark ? 'rgba(234, 88, 12, 0.15)' : '#FFF7ED',
      };
    } else if (hours >= 12 && hours < 17) {
      return {
        title: "Blessed Afternoon ☀️",
        subtitle: "As the Sun reaches its peak, may your energy remain aligned with the cosmic flow.",
        icon: Sun,
        iconColor: '#D4AF37',
        bgColor: isDark ? 'rgba(212, 175, 55, 0.15)' : '#FEF3C7',
      };
    } else if (hours >= 17 && hours < 21) {
      return {
        title: "Serene Evening 🌅",
        subtitle: "A time for gratitude and reflection. May the gentle evening stars bring calm to your mind.",
        icon: Moon,
        iconColor: '#F97316',
        bgColor: isDark ? 'rgba(249, 115, 22, 0.15)' : '#FFF7ED',
      };
    } else {
      return {
        title: "Sacred Night 🌙",
        subtitle: "As the universe rests under the moon's embrace, find peace in the quiet within.",
        icon: Moon,
        iconColor: '#A855F7',
        bgColor: isDark ? 'rgba(168, 85, 247, 0.15)' : '#FAF5FF',
      };
    }
  };

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

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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
    const day = selected.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    setDate(`${day} ${months[selected.getMonth()]} ${selected.getFullYear()}`);
    setShowDatePickerModal(false);
  };


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* App Header with Gold Primary Background in both Light & Dark Mode */}
      <AppHeader 
        title="Vedic Panchangam" 
        subtitle="Daily Divine Astrological Almanac"
        onMenuPress={() => navigation.navigate('Menu')}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Unified Cosmic Image Slider Card with Swiping */}
        <View style={styles.sliderContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={width - 40}
            snapToAlignment="center"
            decelerationRate="fast"
            onScroll={(event) => {
              const offset = event.nativeEvent.contentOffset.x;
              const slideWidth = width - 40;
              const index = Math.round(offset / slideWidth);
              if (index >= 0 && index < CAROUSEL_ITEMS.length && index !== activeSlide) {
                setActiveSlide(index);
              }
            }}
            scrollEventThrottle={16}
            style={styles.sliderScrollView}
          >
            {CAROUSEL_ITEMS.map((item, idx) => (
              <TouchableOpacity 
                key={item.id}
                activeOpacity={0.9} 
                onPress={() => {
                  if (item.navTarget === 'Panchang') {
                    navigation.navigate('Panchang', { location, latitude, longitude, date });
                  } else {
                    navigation.navigate(item.navTarget as any);
                  }
                }}
                style={[styles.sliderTouch, { width: width - 40 }]}
              >
                <ImageBackground 
                  source={item.image} 
                  style={styles.sliderBgImage}
                  imageStyle={{ borderRadius: 24 }}
                >
                  {/* Semi-transparent dark overlay for high text contrast */}
                  <View style={styles.sliderOverlay}>
                    {/* Header Tag */}
                    <View style={styles.sliderHeaderRow}>
                      <View style={styles.sliderTag}>
                        <Typography variant="caption" weight="semibold" style={{ color: '#FFD700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                          {item.tag}
                        </Typography>
                      </View>
                    </View>

                    {/* Text Info & CTA */}
                    <View style={styles.sliderContent}>
                      <Typography variant="title" weight="bold" style={styles.sliderTitle}>
                        {item.title}
                      </Typography>
                      <Typography variant="body" weight="medium" style={styles.sliderSubtitle}>
                        {item.subtitle}
                      </Typography>

                      <View style={styles.sliderCtaRow}>
                        <View style={styles.sliderCtaBtn}>
                          <Typography variant="caption" weight="bold" style={{ color: '#FFFFFF' }}>
                            {item.ctaText}
                          </Typography>
                          <ArrowRight color="#FFFFFF" size={14} style={{ marginLeft: 6 }} />
                        </View>
                      </View>
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Navigation Dots Indicator (Bottom Center) */}
          <View style={styles.sliderDotsRow}>
            {CAROUSEL_ITEMS.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.sliderDot,
                  idx === activeSlide && styles.sliderActiveDot
                ]}
              />
            ))}
          </View>
        </View>

        {/* Dynamic Cosmic Greeting Card */}
        {(() => {
          const greeting = getCosmicGreeting();
          const GreetingIcon = greeting.icon;
          return (
            <PremiumCard style={styles.greetingCard}>
              <View style={styles.greetingHeader}>
                <View style={[styles.greetingIconBg, { backgroundColor: greeting.bgColor }]}>
                  <GreetingIcon color={greeting.iconColor} size={16} />
                </View>
                <Typography variant="caption" color="muted" weight="bold" style={styles.greetingTag}>
                  DAILY COSMIC BLESSING
                </Typography>
              </View>
              
              <Typography variant="title" weight="bold" style={[styles.greetingTitle, { color: isDark ? '#D4AF37' : colors.primary }]}>
                {greeting.title}
              </Typography>
              <Typography variant="body" style={[styles.greetingText, { color: colors.textSecondary }]}>
                {greeting.subtitle}
              </Typography>
            </PremiumCard>
          );
        })()}

        {/* Sunrise / Sunset Section */}
        <View style={styles.welcomeSection}>
          {/* Sunrise and Sunset times card */}
          <PremiumCard style={styles.sunTimeCard}>
            <View style={styles.sunTimeRow}>
              <View style={styles.sunTimeItem}>
                <View style={[styles.sunIconBg, { backgroundColor: isDark ? 'rgba(255, 153, 51, 0.18)' : '#FEF3C7' }]}>
                  <Sun color="#EA580C" size={20} />
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Typography variant="caption" color="muted" weight="medium">Sun Rising Time</Typography>
                  {isLoadingSunTimes ? (
                    <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 2 }} />
                  ) : (
                    <Typography variant="body" weight="bold">{sunriseTime}</Typography>
                  )}
                </View>
              </View>

              <View style={[styles.sunTimeDivider, { backgroundColor: colors.border }]} />

              <View style={styles.sunTimeItem}>
                <View style={[styles.sunIconBg, { backgroundColor: isDark ? 'rgba(212, 175, 55, 0.18)' : '#FEF3C7' }]}>
                  <Moon color="#D4AF37" size={20} />
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Typography variant="caption" color="muted" weight="medium">Sun Setting Time</Typography>
                  {isLoadingSunTimes ? (
                    <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 2 }} />
                  ) : (
                    <Typography variant="body" weight="bold">{sunsetTime}</Typography>
                  )}
                </View>
              </View>
            </View>
          </PremiumCard>

          <TouchableOpacity activeOpacity={0.85} onPress={handleCalculate}>
            <PremiumCard style={styles.todayCard}>
              <View style={styles.todayRow}>
                <View>
                  <Typography variant="caption" color="muted" weight="medium">
                    {(() => {
                      const d = new Date();
                      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                      return `${weekdays[d.getDay()]}, ${date}`;
                    })()}
                  </Typography>
                  <Typography variant="subtitle" weight="bold" style={{ marginTop: 2 }}>{todayTithi}</Typography>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Typography variant="caption" color="muted" weight="medium">Nakshatra</Typography>
                  <Typography variant="subtitle" weight="bold" style={{ marginTop: 2 }}>{todayNakshatra}</Typography>
                </View>
              </View>
            </PremiumCard>
          </TouchableOpacity>
        </View>

        {/* Panchang Calculator Input Card */}
        <PremiumCard style={styles.inputCard}>
          <Typography variant="subtitle" weight="bold" style={{ marginBottom: 16 }}>
            Calculate Panchangam
          </Typography>
          
          <TouchableOpacity style={styles.inputRow} onPress={() => setShowLocationModal(true)} activeOpacity={0.7}>
            <MapPin color={colors.primary} size={20} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Typography variant="caption" color="muted" weight="medium">Place / Location</Typography>
              <Typography variant="body" weight="bold">{location}</Typography>
            </View>
            <Navigation color={colors.textSecondary} size={18} />
          </TouchableOpacity>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <TouchableOpacity 
            style={styles.inputRow} 
            onPress={() => {
              setCurrentMonth(pickerDate.getMonth());
              setCurrentYear(pickerDate.getFullYear());
              setShowDatePickerModal(true);
            }} 
            activeOpacity={0.7}
          >
            <CalendarIcon color={colors.secondary} size={20} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Typography variant="caption" color="muted" weight="medium">Selected Date</Typography>
              <Typography variant="body" weight="bold">{date}</Typography>
            </View>
            <ChevronRight color={colors.textSecondary} size={18} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.calculateBtn, { backgroundColor: colors.primary }]} 
            onPress={handleCalculate} 
            activeOpacity={0.8}
          >
            <View style={styles.calculateGradient}>
              <Typography variant="body" weight="semibold" style={{ color: '#FFFFFF' }}>
                Calculate Panchang
              </Typography>
            </View>
          </TouchableOpacity>
        </PremiumCard>

        {/* Quick Feature Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shortcutsContainer}>
          {[
            { label: 'Horoscope', target: 'Horoscope', icon: Sparkles },
            { label: 'Match Checker', target: 'MatchChecker', icon: Heart },
            { label: 'Panchang', target: 'Panchang', icon: Compass },
            { label: 'Calendar', target: 'Calendar', icon: CalendarIcon },
            { label: 'Festivals', target: 'Festivals', icon: Sun },
          ].map((item, idx) => {
            const ChipIcon = item.icon || Compass;
            return (
              <TouchableOpacity 
                key={idx} 
                onPress={() => {
                  if (item.target === 'Panchang') {
                    navigation.navigate('Panchang', { location, latitude, longitude, date });
                  } else {
                    navigation.navigate(item.target);
                  }
                }}
                activeOpacity={0.7}
                style={[
                  styles.chip, 
                  { 
                    backgroundColor: isDark ? '#1E1E26' : colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                  }
                ]}
              >
                <ChipIcon color={colors.primary} size={16} />
                <Typography variant="caption" weight="bold" style={{ marginLeft: 8, color: colors.text }}>
                  {item.label}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Premium Animated Vedic Panchang Brand Footer Section */}
        <View style={styles.animatedFooterContainer}>
          <AnimatedVedicFooter />
        </View>

        {/* Location Selector Modal with Autocomplete Suggestions */}
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
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Custom Calendar Date Picker Modal */}
        <Modal visible={showDatePickerModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
              <View style={styles.modalHeader}>
                <Typography variant="subtitle" weight="bold">Select Date</Typography>
                <TouchableOpacity onPress={() => setShowDatePickerModal(false)}>
                  <X color={colors.text} size={24} />
                </TouchableOpacity>
              </View>

              {/* Month navigation header */}
              <View style={styles.calendarNavHeader}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
                  <ChevronLeft color={colors.primary} size={24} />
                </TouchableOpacity>
                <Typography variant="body" weight="bold" style={{ fontSize: 16 }}>
                  {monthsList[currentMonth]} {currentYear}
                </Typography>
                <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
                  <ChevronRight color={colors.primary} size={24} />
                </TouchableOpacity>
              </View>

              {/* Days of week header */}
              <View style={styles.weekdaysRow}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((dayName, idx) => (
                  <View key={idx} style={styles.weekdayCell}>
                    <Typography variant="caption" color="muted" weight="bold" style={{ textAlign: 'center' }}>
                      {dayName}
                    </Typography>
                  </View>
                ))}
              </View>

              {/* Days grid */}
              <View style={styles.daysGrid}>
                {calendarDays.map((item, idx) => {
                  const isSelected = item.day !== null &&
                    pickerDate.getDate() === item.day &&
                    pickerDate.getMonth() === currentMonth &&
                    pickerDate.getFullYear() === currentYear;

                  const isToday = item.day !== null &&
                    new Date().getDate() === item.day &&
                    new Date().getMonth() === currentMonth &&
                    new Date().getFullYear() === currentYear;

                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.dayCell,
                        isSelected && { backgroundColor: colors.primary }
                      ]}
                      disabled={item.day === null}
                      onPress={() => item.day !== null && handleSelectDay(item.day)}
                    >
                      {item.day !== null ? (
                        <Typography
                          variant="body"
                          weight={isSelected ? 'bold' : isToday ? 'bold' : 'regular'}
                          style={{
                            color: isSelected ? '#FFFFFF' : isToday ? colors.primary : colors.text,
                            textAlign: 'center'
                          }}
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
  sliderContainer: {
    width: '100%',
    marginBottom: 24,
  },
  sliderScrollView: {
    width: '100%',
    height: 230,
  },
  sliderTouch: {
    borderRadius: 24,
    overflow: 'hidden',
    height: 230,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  sliderBgImage: {
    flex: 1,
    justifyContent: 'space-between',
  },
  sliderOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: 20,
    justifyContent: 'space-between',
  },
  sliderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sliderContent: {
    marginTop: 'auto',
    marginBottom: 10,
  },
  sliderTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  sliderSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    marginBottom: 14,
  },
  sliderCtaRow: {
    flexDirection: 'row',
  },
  sliderCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  sliderDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  sliderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    marginHorizontal: 3,
  },
  sliderActiveDot: {
    width: 18,
    backgroundColor: '#D4AF37',
  },
  greetingCard: {
    marginBottom: 16,
    padding: 18,
  },
  greetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  greetingIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingTag: {
    marginLeft: 10,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  greetingText: {
    fontSize: 13,
    lineHeight: 18,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  sunTimeCard: {
    marginTop: 12,
    paddingVertical: 14,
  },
  sunTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sunTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sunIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sunTimeDivider: {
    width: 1,
    height: 32,
    marginHorizontal: 12,
  },
  todayCard: {
    marginTop: 14,
  },
  todayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputCard: {
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  calculateBtn: {
    marginTop: 18,
    borderRadius: 24,
    overflow: 'hidden',
  },
  calculateGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  shortcutsContainer: {
    marginBottom: 24,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  animatedFooterContainer: {
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 28,
    overflow: 'hidden',
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
  modalApplyBtn: {
    marginTop: 20,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detectLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    height: 44,
    borderRadius: 22,
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
