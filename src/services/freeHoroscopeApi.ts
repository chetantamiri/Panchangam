import axios from './axios';

export interface HoroscopeResponse {
  horoscope: string;
  luckyNumber: number;
  luckyColor: string;
  compatibility: string;
  isFallback: boolean;
}

export type HoroscopeType = 'daily' | 'weekly' | 'monthly';

export const ZODIAC_SIGNS = [
  { name: 'Aries', id: 'aries', emoji: '♈', dateRange: 'Mar 21 - Apr 19', element: 'Fire' },
  { name: 'Taurus', id: 'taurus', emoji: '♉', dateRange: 'Apr 20 - May 20', element: 'Earth' },
  { name: 'Gemini', id: 'gemini', emoji: '♊', dateRange: 'May 21 - Jun 20', element: 'Air' },
  { name: 'Cancer', id: 'cancer', emoji: '♋', dateRange: 'Jun 21 - Jul 22', element: 'Water' },
  { name: 'Leo', id: 'leo', emoji: '♌', dateRange: 'Jul 23 - Aug 22', element: 'Fire' },
  { name: 'Virgo', id: 'virgo', emoji: '♍', dateRange: 'Aug 23 - Sep 22', element: 'Earth' },
  { name: 'Libra', id: 'libra', emoji: '♎', dateRange: 'Sep 23 - Oct 22', element: 'Air' },
  { name: 'Scorpio', id: 'scorpio', emoji: '♏', dateRange: 'Oct 23 - Nov 21', element: 'Water' },
  { name: 'Sagittarius', id: 'sagittarius', emoji: '♐', dateRange: 'Nov 22 - Dec 21', element: 'Fire' },
  { name: 'Capricorn', id: 'capricorn', emoji: '♑', dateRange: 'Dec 22 - Jan 19', element: 'Earth' },
  { name: 'Aquarius', id: 'aquarius', emoji: '♒', dateRange: 'Jan 20 - Feb 18', element: 'Air' },
  { name: 'Pisces', id: 'pisces', emoji: '♓', dateRange: 'Feb 19 - Mar 20', element: 'Water' },
];

// Helper to generate a deterministic pseudo-random number based on a string seed
const getSeedFromString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

// Generates high-quality fallback horoscope predictions if the API is down
export const generateFallbackHoroscope = (sign: string, type: HoroscopeType): HoroscopeResponse => {
  const currentDate = new Date();
  
  // Create a time-based seed that changes daily, weekly, or monthly
  let timeSeed = '';
  if (type === 'daily') {
    timeSeed = currentDate.toDateString(); // changes every day
  } else if (type === 'weekly') {
    // get week number
    const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const pastDaysOfYear = (currentDate.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    timeSeed = `${currentDate.getFullYear()}-W${weekNumber}`;
  } else {
    timeSeed = `${currentDate.getFullYear()}-M${currentDate.getMonth()}`; // changes every month
  }

  const signSeed = getSeedFromString(sign + '-' + type + '-' + timeSeed);

  const selectItem = <T>(arr: T[], offset = 0): T => {
    return arr[(signSeed + offset) % arr.length];
  };

  // Components for the prediction
  const careers = [
    'professional endeavors', 'financial opportunities', 'creative projects', 
    'collaborative work', 'organizational tasks', 'long-term aspirations',
    'educational goals', 'negotiations', 'leadership opportunities'
  ];

  const feelings = [
    'heightened intuition and inner clarity', 'a boost of dynamic energy and confidence',
    'a strong desire to organize and clean up your space', 'some reflective moments to plan ahead',
    'an influx of creative inspiration and unique ideas', 'a sense of harmony in your communications',
    'motivation to finish pending tasks', 'passion to explore new hobbies'
  ];

  const scenarios = [
    'an unexpected conversation with a mentor or peer', 'a sudden shift in your daily schedule',
    'a decision regarding a personal purchase or investment', 'a moment of clarity during a quiet break',
    'a collaborative effort that yields great results', 'an opportunity to showcase your unique talents',
    'a small breakthrough in a challenging project'
  ];

  const romanceTips = [
    'listen closely to what is left unsaid', 'express your appreciation openly to your loved ones',
    'give others space to share their thoughts and feelings', 'reconnect with someone you haven\'t spoken to in a while',
    'set clear, gentle boundaries in your interactions', 'allow yourself to be vulnerable with trusted partners',
    'spend quality time in a calm, soothing environment'
  ];

  const colorsList = ['Gold', 'Saffron', 'Crimson Red', 'Royal Blue', 'Emerald Green', 'Lilac', 'Warm Copper', 'Turquoise', 'Indigo'];
  
  // Create a copy list without emojis
  const signsList = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  const luckyNumber = (signSeed % 9) + 1;
  const luckyColor = selectItem(colorsList, 2);
  const compatibility = selectItem(signsList, 4);

  // Construct sentences based on the type of horoscope
  let intro = '';
  let careerSection = '';
  let loveSection = '';
  let conclusion = '';

  const capSign = sign.charAt(0).toUpperCase() + sign.slice(1);

  if (type === 'daily') {
    intro = `For ${capSign} today, the cosmic alignments suggest a day filled with ${selectItem(feelings, 1)}. You will feel drawn towards ${selectItem(careers, 2)}.`;
    careerSection = `In your surroundings, watch out for ${selectItem(scenarios, 3)}. This event could bring useful insights for your personal growth.`;
    loveSection = `When it comes to your relationships, the best advice for today is to ${selectItem(romanceTips, 4)}.`;
    conclusion = `Keep your focus balanced and remember that small efforts will accumulate into significant success.`;
  } else if (type === 'weekly') {
    intro = `This week brings a wave of renewal for ${capSign}. You will experience ${selectItem(feelings, 5)}, which will help you structure your ${selectItem(careers, 6)}.`;
    careerSection = `Mid-week, you might encounter ${selectItem(scenarios, 7)}. Embrace this with an open mind, as it holds the key to a long-standing question.`;
    loveSection = `In your personal life, make it a point to ${selectItem(romanceTips, 8)} to keep harmony thriving.`;
    conclusion = `Trust the process and allow yourself time to rest; your physical and mental well-being is your greatest asset this week.`;
  } else {
    intro = `The monthly transit highlights a major focus on ${selectItem(careers, 9)} for ${capSign}. The planetary positions signal a period of ${selectItem(feelings, 10)}.`;
    careerSection = `Throughout the month, you can expect ${selectItem(scenarios, 11)}. Your ability to adapt and lead will shine during this phase.`;
    loveSection = `Regarding relationships, this month encourages you to ${selectItem(romanceTips, 12)}. Connection with close friends will bring immense joy.`;
    conclusion = `This month is about laying down strong foundations. Take deliberate steps and rely on your intuition.`;
  }

  const horoscopeText = `${intro} ${careerSection} ${loveSection} ${conclusion}`;

  return {
    horoscope: horoscopeText,
    luckyNumber,
    luckyColor,
    compatibility,
    isFallback: true
  };
};

export const getHoroscope = async (sign: string, type: HoroscopeType): Promise<HoroscopeResponse> => {
  const normalizedSign = sign.toLowerCase();
  
  // Base URL provided by the user
  const baseUrl = 'https://freehoroscopeapi.com/api/v1/get-horoscope';
  const url = `${baseUrl}/${type}?sign=${normalizedSign}`;

  try {
    const response = await axios.get<any>(url, { timeout: 8000 });
    
    // Parse response
    let horoscopeText = '';
    if (response?.data?.data?.horoscope) {
      horoscopeText = response.data.data.horoscope;
    } else if (response?.data?.horoscope) {
      horoscopeText = response.data.horoscope;
    } else if (typeof response?.data === 'string') {
      horoscopeText = response.data;
    } else if (response?.data?.data && typeof response.data.data === 'string') {
      horoscopeText = response.data.data;
    }

    if (horoscopeText && horoscopeText.trim().length > 0) {
      // API response only contains the text. We will generate lucky details deterministically to match our premium UI
      const fallback = generateFallbackHoroscope(normalizedSign, type);
      return {
        horoscope: horoscopeText.trim(),
        luckyNumber: fallback.luckyNumber,
        luckyColor: fallback.luckyColor,
        compatibility: fallback.compatibility,
        isFallback: false
      };
    } else {
      throw new Error('Empty horoscope text received from API');
    }
  } catch (error) {
    console.warn(`[HoroscopeAPI] Error fetching ${type} horoscope for ${sign}:`, error);
    // Graceful fallback so the app works beautifully offline and under error conditions
    return generateFallbackHoroscope(normalizedSign, type);
  }
};
