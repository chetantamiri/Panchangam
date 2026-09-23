import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Dimensions, 
  Share, 
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/Typography';
import { PremiumCard } from '../components/PremiumCard';
import { ArrowLeft, Sparkles, Share2, Compass, Heart, Calendar, Flame, Droplet, Wind, Globe } from 'lucide-react-native';
import { getHoroscope, ZODIAC_SIGNS, HoroscopeResponse, HoroscopeType } from '../services/freeHoroscopeApi';

const { width } = Dimensions.get('window');

export const DailyHoroscopeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const getElementIcon = (element: string, color: string, size = 12) => {
    switch (element) {
      case 'Fire': return <Flame color={color} size={size} />;
      case 'Water': return <Droplet color={color} size={size} />;
      case 'Earth': return <Globe color={color} size={size} />;
      case 'Air': return <Wind color={color} size={size} />;
      default: return <Sparkles color={color} size={size} />;
    }
  };

  // State
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<HoroscopeType>('daily');
  const [horoscopeData, setHoroscopeData] = useState<HoroscopeResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch horoscope when selected sign or tab changes
  useEffect(() => {
    if (selectedSign) {
      const fetchHoroscopeData = async () => {
        setIsLoading(true);
        const data = await getHoroscope(selectedSign, activeTab);
        setHoroscopeData(data);
        setIsLoading(false);
      };
      fetchHoroscopeData();
    }
  }, [selectedSign, activeTab]);

  // Get active sign details
  const activeSignDetails = ZODIAC_SIGNS.find(s => s.id === selectedSign);

  // Color mapping for elements
  const getElementColor = (element: string) => {
    switch (element) {
      case 'Fire': return '#EF4444'; // Red
      case 'Water': return '#3B82F6'; // Blue
      case 'Earth': return '#10B981'; // Green
      case 'Air': return '#F59E0B'; // Orange/Yellow
      default: return colors.primary;
    }
  };

  // Safe color codes for lucky colors
  const getLuckyColorHex = (colorName: string) => {
    const name = colorName.toLowerCase();
    if (name.includes('gold')) return '#D4AF37';
    if (name.includes('saffron') || name.includes('orange')) return '#FF9933';
    if (name.includes('red') || name.includes('crimson')) return '#890303';
    if (name.includes('blue')) return '#1D4ED8';
    if (name.includes('green') || name.includes('emerald')) return '#047857';
    if (name.includes('lilac') || name.includes('purple')) return '#7C3AED';
    if (name.includes('copper') || name.includes('brown')) return '#B45309';
    if (name.includes('turquoise') || name.includes('teal')) return '#0F766E';
    if (name.includes('indigo')) return '#4338CA';
    return colors.primary;
  };

  // Share handler
  const handleShare = async () => {
    if (!horoscopeData || !activeSignDetails) return;
    
    try {
      const shareMessage = `${activeSignDetails.emoji} ${activeSignDetails.name} ${
        activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
      } Horoscope:\n\n"${horoscopeData.horoscope}"\n\nLucky Number: ${horoscopeData.luckyNumber}\nLucky Color: ${horoscopeData.luckyColor}\nCompatibility: ${horoscopeData.compatibility}\n\nShared via Vedic Panchang App`;

      await Share.share({
        message: shareMessage,
        title: `${activeSignDetails.name} Horoscope`,
      });
    } catch (error: any) {
      Alert.alert('Error', 'Unable to share horoscope at this time.');
    }
  };

  // Header render helpers
  const textColor = colors.onPrimary || (isDark ? '#FFFFFF' : '#000000');
  const subTextColor = colors.onPrimary === '#FFFFFF' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.75)';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom App Header with Back Button */}
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
          {selectedSign && (
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)' }]} 
              onPress={() => setSelectedSign(null)}
              activeOpacity={0.7}
            >
              <ArrowLeft color={textColor} size={22} />
            </TouchableOpacity>
          )}

          <View style={styles.headerTitleContainer}>
            <Typography 
              variant="display" 
              style={[styles.headerTitleText, { color: textColor }]}
            >
              Daily Horoscope
            </Typography>
            <Typography 
              variant="caption" 
              style={[styles.headerSubtitleText, { color: subTextColor }]}
            >
              {selectedSign && activeSignDetails 
                ? `${activeSignDetails.emoji} ${activeSignDetails.name} Readings`
                : 'Choose your Zodiac sign to read prediction'
              }
            </Typography>
          </View>
        </View>
      </View>

      {/* Main Content Area */}
      {!selectedSign ? (
        /* ==================== SCREEN A: ZODIAC SELECTION GRID ==================== */
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.welcomeSection}>
            <Sparkles color={colors.primary} size={32} style={{ marginBottom: 12 }} />
            <Typography variant="title" weight="bold" style={{ textAlign: 'center', marginBottom: 8 }}>
              Discover Your Destiny
            </Typography>
            <Typography variant="body" color="muted" style={{ textAlign: 'center', paddingHorizontal: 20 }}>
              Select your astrological zodiac sign below to unlock daily, weekly, and monthly cosmic readings.
            </Typography>
          </View>

          <View style={styles.gridContainer}>
            {ZODIAC_SIGNS.map((sign) => {
              const elementColor = getElementColor(sign.element);
              return (
                <TouchableOpacity
                  key={sign.id}
                  style={styles.gridItem}
                  activeOpacity={0.75}
                  onPress={() => setSelectedSign(sign.id)}
                >
                  <PremiumCard 
                    style={[
                      styles.zodiacCard, 
                      { 
                        borderTopWidth: 4, 
                        borderTopColor: elementColor,
                        backgroundColor: isDark ? 'rgba(30, 30, 38, 0.95)' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                      }
                    ]}
                  >
                    <View style={styles.zodiacCardHeader}>
                      <Typography style={styles.zodiacEmoji}>{sign.emoji}</Typography>
                      <View style={[styles.elementBadge, { backgroundColor: elementColor + '15', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2 }]}>
                        {getElementIcon(sign.element, elementColor, 10)}
                        <Typography variant="caption" style={{ color: elementColor, fontSize: 9, fontWeight: 'bold', marginLeft: 4 }}>
                          {sign.element}
                        </Typography>
                      </View>
                    </View>
                    
                    <View style={{ marginTop: 10 }}>
                      <Typography variant="body" weight="bold" style={{ fontSize: 15 }}>
                        {sign.name}
                      </Typography>
                      <Typography variant="caption" color="muted" style={{ fontSize: 10, marginTop: 2 }}>
                        {sign.dateRange}
                      </Typography>
                    </View>
                  </PremiumCard>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      ) : (
        /* ==================== SCREEN B: HOROSCOPE READINGS & DETAILS ==================== */
        <View style={{ flex: 1 }}>
          {/* Horizontal Quick-Select Zodiac Sign Bar */}
          <View style={[styles.quickBar, { borderBottomColor: colors.border }]}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.quickBarContent}
            >
              {ZODIAC_SIGNS.map((sign) => {
                const isCurrent = sign.id === selectedSign;
                const elementColor = getElementColor(sign.element);
                return (
                  <TouchableOpacity
                    key={sign.id}
                    style={[
                      styles.quickSignChip,
                      { 
                        borderColor: isCurrent ? elementColor : colors.border,
                        backgroundColor: isCurrent ? elementColor + '15' : 'transparent',
                        borderWidth: isCurrent ? 2 : 1,
                      }
                    ]}
                    onPress={() => setSelectedSign(sign.id)}
                    activeOpacity={0.75}
                  >
                    <Typography style={{ fontSize: 16, marginRight: 4 }}>{sign.emoji}</Typography>
                    <Typography variant="caption" weight={isCurrent ? "bold" : "semibold"} style={{ color: isCurrent ? elementColor : colors.textSecondary }}>
                      {sign.name}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <ScrollView 
            contentContainerStyle={styles.detailsScrollContent} 
            showsVerticalScrollIndicator={false}
          >
            {/* Horoscope Type Tabs Selector */}
            <View style={[styles.tabsContainer, { backgroundColor: isDark ? '#1E1E26' : '#E2E8F0' }]}>
              {(['daily', 'weekly', 'monthly'] as HoroscopeType[]).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[
                      styles.tabItem,
                      isActive && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => setActiveTab(tab)}
                    activeOpacity={0.7}
                  >
                    <Typography 
                      variant="caption" 
                      weight="semibold"
                      style={{ 
                        color: isActive 
                          ? (colors.onPrimary || '#FFFFFF') 
                          : colors.textSecondary 
                      }}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* main reading card */}
            {isLoading ? (
              <PremiumCard style={styles.readingCardLoading}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Typography variant="body" color="muted" style={{ marginTop: 16 }}>
                  Consulting cosmic alignments...
                </Typography>
              </PremiumCard>
            ) : (
              <PremiumCard 
                style={[
                  styles.readingCard, 
                  { 
                    borderLeftWidth: 4, 
                    borderLeftColor: activeSignDetails ? getElementColor(activeSignDetails.element) : colors.primary 
                  }
                ]}
              >
                <View style={styles.readingHeader}>
                  <View style={[
                    styles.iconCircle, 
                    { 
                      backgroundColor: activeSignDetails 
                        ? getElementColor(activeSignDetails.element) + '15' 
                        : 'rgba(212, 175, 55, 0.15)' 
                    }
                  ]}>
                    {activeSignDetails 
                      ? getElementIcon(activeSignDetails.element, getElementColor(activeSignDetails.element), 20)
                      : <Sparkles color={colors.primary} size={20} />
                    }
                  </View>
                  <View style={{ marginLeft: 14 }}>
                    <Typography variant="subtitle" weight="bold" style={{ fontSize: 16 }}>
                      {activeSignDetails?.emoji} {activeSignDetails?.name} Predictions
                    </Typography>
                    <Typography variant="caption" color="muted">
                      {activeTab === 'daily' && 'Today\'s Reading'}
                      {activeTab === 'weekly' && 'Weekly Forecast'}
                      {activeTab === 'monthly' && 'Monthly Outlook'}
                    </Typography>
                  </View>
                </View>

                <Typography variant="body" style={styles.readingText}>
                  {horoscopeData?.horoscope}
                </Typography>
                
                {horoscopeData?.isFallback && (
                  <View style={styles.fallbackNotice}>
                    <Typography variant="caption" color="muted" style={{ fontSize: 11, fontStyle: 'italic' }}>
                      Offline predictions optimized based on local transit readings.
                    </Typography>
                  </View>
                )}
              </PremiumCard>
            )}

            {/* Lucky Parameters & Attributes */}
            {horoscopeData && !isLoading && (
              <View style={styles.attributesSection}>
                <Typography variant="subtitle" weight="bold" style={{ marginBottom: 14 }}>
                  Celestial Affinities
                </Typography>

                <View style={styles.attributesRow}>
                  {/* Lucky Number */}
                  <PremiumCard style={styles.attributeCard}>
                    <Compass color={colors.primary} size={20} style={{ marginBottom: 8 }} />
                    <Typography variant="caption" color="muted" style={{ fontSize: 11 }}>
                      Lucky Number
                    </Typography>
                    <Typography variant="body" weight="bold" style={{ fontSize: 18, marginTop: 4 }}>
                      {horoscopeData.luckyNumber}
                    </Typography>
                  </PremiumCard>

                  {/* Lucky Color */}
                  <PremiumCard style={styles.attributeCard}>
                    <View 
                      style={[
                        styles.colorDot, 
                        { backgroundColor: getLuckyColorHex(horoscopeData.luckyColor) }
                      ]} 
                    />
                    <Typography variant="caption" color="muted" style={{ fontSize: 11, marginTop: 8 }}>
                      Lucky Color
                    </Typography>
                    <Typography variant="body" weight="bold" style={{ fontSize: 15, marginTop: 4 }}>
                      {horoscopeData.luckyColor}
                    </Typography>
                  </PremiumCard>

                  {/* Compatibility */}
                  <PremiumCard style={styles.attributeCard}>
                    <Heart color="#EF4444" size={20} style={{ marginBottom: 8 }} />
                    <Typography variant="caption" color="muted" style={{ fontSize: 11 }}>
                      Compatible Sign
                    </Typography>
                    <Typography variant="body" weight="bold" style={{ fontSize: 15, marginTop: 4 }}>
                      {horoscopeData.compatibility}
                    </Typography>
                  </PremiumCard>
                </View>
              </View>
            )}

            {/* Action Row */}
            {horoscopeData && !isLoading && (
              <View style={styles.actionsContainer}>
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                  onPress={handleShare}
                  activeOpacity={0.8}
                >
                  <Share2 color={textColor} size={18} style={{ marginRight: 10 }} />
                  <Typography variant="body" weight="semibold" style={{ color: textColor }}>
                    Share Reading
                  </Typography>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.outlineBtn, { borderColor: colors.border }]}
                  onPress={() => setSelectedSign(null)}
                  activeOpacity={0.8}
                >
                  <Calendar color={colors.primary} size={18} style={{ marginRight: 10 }} />
                  <Typography variant="body" weight="semibold">
                    Change Zodiac Sign
                  </Typography>
                </TouchableOpacity>
              </View>
            )}
            <View style={{ height: 100 }} />
          </ScrollView>
        </View>
      )}
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
  scrollContainer: {
    padding: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: (width - 50) / 2, // half width minus spacing
    marginBottom: 14,
  },
  zodiacCard: {
    padding: 16,
    minHeight: 120,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  zodiacCardHeader: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zodiacEmoji: {
    fontSize: 32,
  },
  elementBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  quickBar: {
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  quickBarContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickSignChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  detailsScrollContent: {
    padding: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  readingCard: {
    padding: 20,
    marginBottom: 20,
  },
  readingCardLoading: {
    padding: 40,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  readingText: {
    fontSize: 16,
    lineHeight: 24,
  },
  fallbackNotice: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingTop: 12,
    marginTop: 16,
  },
  attributesSection: {
    marginBottom: 20,
  },
  attributesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  attributeCard: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  actionsContainer: {
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
});
