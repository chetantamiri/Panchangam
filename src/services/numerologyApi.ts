import axios from './axios';

export interface NumerologyResponse {
  nameNumber: number;
  destinyNumber: number;
  isFallback: boolean;
  
  // Rich prediction fields from NameNumberPrediction API
  namePredictionText: string;
  namePredictionNumber: number;
  namePredictionRoot: number;
  namePredictionPlanet: string;
  predictionSummary: Record<string, number>;
}

export interface NumerologyRequest {
  firstName: string;
  fullName: string;
  birthTime: string; // standard format "HH:mm DD/MM/YYYY +05:30"
  locationName: string;
  latitude: number;
  longitude: number;
  ayanamsa: string; // defaults to 'RAMAN'
}

// Chaldean letter values mapping
const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  P: 8, F: 8
};

// Calculate Chaldean Name Number locally (fallback & verification)
export const calculateNameNumberLocally = (name: string): number => {
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '');
  let sum = 0;
  for (let i = 0; i < cleanName.length; i++) {
    sum += CHALDEAN_MAP[cleanName[i]] || 0;
  }
  return sum;
};

// Reduce number to single digit
export const reduceToSingleDigit = (num: number): number => {
  if (num === 0) return 0;
  let current = num;
  while (current > 9) {
    current = String(current)
      .split('')
      .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  return current;
};

// Calculate Destiny Number locally
export const calculateDestinyNumberLocally = (stdTimeStr: string): number => {
  const datePart = stdTimeStr.split(' ')[1] || ''; // "15/06/1990"
  const digits = datePart.replace(/[^0-9]/g, ''); // "15061990"
  if (!digits) return 7;

  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += parseInt(digits[i], 10);
  }
  return reduceToSingleDigit(sum);
};

// Chaldean Numerology Descriptions for single digit numbers
const NUMEROLOGY_DESCRIPTIONS: Record<number, { title: string; desc: string; planet: string }> = {
  1: {
    title: 'The Leader (Sun)',
    planet: 'Sun (Surya)',
    desc: 'Represents leadership, ambition, independence, and strong willpower. You are creative, confident, and have an innate desire to pioneer new projects. Sometimes prone to dominance, you excel in commanding roles.'
  },
  2: {
    title: 'The Diplomat (Moon)',
    planet: 'Moon (Chandra)',
    desc: 'Represents cooperation, intuition, sensitivity, and diplomacy. You are peaceloving, artistic, gentle, and imaginative. You work exceptionally well in partnerships, though you should guard against mood swings and over-sensitivity.'
  },
  3: {
    title: 'The Creative (Jupiter)',
    planet: 'Jupiter (Guru)',
    desc: 'Represents self-expression, communication, optimism, and joy. You are highly expressive, optimistic, social, and creative. You have an affinity for writing, teaching, and sharing wisdom, but must avoid scattering your energies.'
  },
  4: {
    title: 'The Builder (Rahu)',
    planet: 'Rahu',
    desc: 'Represents structure, discipline, stability, and hard work. You are practical, analytical, organized, and reliable. You value security and systematic progress, although you may sometimes display stubbornness or unconventional thinking.'
  },
  5: {
    title: 'The Explorer (Mercury)',
    planet: 'Mercury (Budha)',
    desc: 'Represents freedom, versatility, adaptability, and intellect. You love change, travel, and adventure. You possess a quick mind and sharp communication skills, though you can be impatient or easily distracted.'
  },
  6: {
    title: 'The Nurturer (Venus)',
    planet: 'Venus (Shukra)',
    desc: 'Represents harmony, responsibility, love, and artistic beauty. You are deeply family-oriented, artistic, responsible, and empathetic. You thrive in creation, decoration, and healing, but can sometimes become overly protective.'
  },
  7: {
    title: 'The Philosopher (Ketu)',
    planet: 'Ketu',
    desc: 'Represents analysis, spirituality, introspection, and wisdom. You are a seeker of truth, highly intuitive, analytical, and reserved. You prefer solitude to contemplate deep life questions, but should watch out for becoming aloof.'
  },
  8: {
    title: 'The Executive (Saturn)',
    planet: 'Saturn (Shani)',
    desc: 'Represents power, material success, authority, and karma. You are highly practical, realistic, ambitious, and strong-willed. You face obstacles with patience and achieve great heights in business or administration.'
  },
  9: {
    title: 'The Humanitarian (Mars)',
    planet: 'Mars (Mangal)',
    desc: 'Represents compassion, completion, courage, and selflessness. You are passionate, generous, idealistic, and courageous. You possess a strong desire to fight for justice and help the less fortunate, but must manage your temper.'
  }
};

const getSeedFromString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

export const getNumerologyReport = async (req: NumerologyRequest): Promise<NumerologyResponse> => {
  const ayanamsa = req.ayanamsa || 'RAMAN';
  const VEDASTRO_BASE_URL = 'https://api.vedastro.org/api/Calculate';

  // 1. Local Fallbacks setup
  const localNameSum = calculateNameNumberLocally(req.fullName);
  const localNameNum = reduceToSingleDigit(localNameSum);
  const localDestinyNum = calculateDestinyNumberLocally(req.birthTime);
  
  const numInfo = NUMEROLOGY_DESCRIPTIONS[localNameNum] || NUMEROLOGY_DESCRIPTIONS[1];
  
  const fallbackPredictionText = `Chaldean Numerology analysis indicates that your name number ${localNameSum} carries a strong frequency ruled by ${numInfo.planet}. Under this vibrational grid, you are likely to experience opportunities in creative and status-driven fields. In relationships, harmony thrives when boundaries are clear. Small efforts will accumulate into significant success over time.`;

  const fallbackSummary: Record<string, number> = {};
  const aspects = ['Finance', 'Romance', 'Education', 'Health', 'Family', 'Growth', 'Career', 'Reputation', 'Spirituality', 'Luck'];
  aspects.forEach((aspect) => {
    const seedVal = getSeedFromString(req.fullName + '-' + aspect + '-' + localNameSum);
    fallbackSummary[aspect] = (seedVal % 11) * 10 - 20; // values from -20 to 80
  });

  let finalNameNumber = localNameNum;
  let finalDestinyNumber = localDestinyNum;
  
  let finalPredictionText = fallbackPredictionText;
  let finalPredictionNumber = localNameSum;
  let finalPredictionRoot = localNameNum;
  let finalPredictionPlanet = numInfo.planet.split(' ')[0];
  let finalSummary: Record<string, number> = fallbackSummary;
  let isFallback = false;

  try {
    const nameNumberPromise = axios.post(`${VEDASTRO_BASE_URL}/NameNumber`, {
      InputText: req.firstName,
      Ayanamsa: ayanamsa
    }, { timeout: 10000 });

    const destinyNumberPromise = axios.post(`${VEDASTRO_BASE_URL}/DestinyNumber`, {
      BirthTime: {
        StdTime: req.birthTime,
        Location: {
          Name: req.locationName,
          Latitude: req.latitude,
          Longitude: req.longitude
        }
      },
      Ayanamsa: ayanamsa
    }, { timeout: 10000 });

    const predictionPromise = axios.post(`${VEDASTRO_BASE_URL}/NameNumberPrediction`, {
      FullName: req.fullName,
      Ayanamsa: ayanamsa
    }, { timeout: 12000 });

    const [nameRes, destinyRes, predRes] = await Promise.allSettled([
      nameNumberPromise,
      destinyNumberPromise,
      predictionPromise
    ]);

    // Parse Name Number
    if (nameRes.status === 'fulfilled') {
      const data = nameRes.value.data;
      const apiNum = data?.Payload?.NameNumber || data?.NameNumber || data?.Payload || data;
      if (typeof apiNum === 'number' || !isNaN(Number(apiNum))) {
        finalNameNumber = Number(apiNum);
      }
    }

    // Parse Destiny Number
    if (destinyRes.status === 'fulfilled') {
      const data = destinyRes.value.data;
      const apiNum = data?.Payload?.DestinyNumber || data?.DestinyNumber || data?.Payload || data;
      if (typeof apiNum === 'number' || !isNaN(Number(apiNum))) {
        finalDestinyNumber = Number(apiNum);
      }
    }

    // Parse Predictions
    if (predRes.status === 'fulfilled') {
      const data = predRes.value.data;
      const payload = data?.Payload?.NameNumberPrediction || data?.Payload || data;
      
      if (payload && typeof payload === 'object') {
        if (payload.Prediction) {
          finalPredictionText = payload.Prediction;
        }
        if (payload.Planet) {
          finalPredictionPlanet = payload.Planet;
        }
        if (payload.Number) {
          finalPredictionNumber = Number(payload.Number);
        }
        if (payload.RootNumber) {
          finalPredictionRoot = Number(payload.RootNumber);
        }
        if (payload.PredictionSummary) {
          // Verify if it contains key values
          finalSummary = payload.PredictionSummary;
        }
      }
    }

    const hasFailures = nameRes.status === 'rejected' || destinyRes.status === 'rejected' || predRes.status === 'rejected';
    isFallback = hasFailures;

  } catch (error) {
    console.warn('[NumerologyAPI] API Fetch Error, serving offline engine predictions:', error);
    isFallback = true;
  }

  return {
    nameNumber: finalNameNumber,
    destinyNumber: finalDestinyNumber,
    namePredictionText: finalPredictionText,
    namePredictionNumber: finalPredictionNumber,
    namePredictionRoot: finalPredictionRoot,
    namePredictionPlanet: finalPredictionPlanet,
    predictionSummary: finalSummary,
    isFallback
  };
};

export const getNumerologySignDetails = (num: number) => {
  const reduced = reduceToSingleDigit(num);
  return NUMEROLOGY_DESCRIPTIONS[reduced] || {
    title: 'Unknown',
    planet: 'Unknown',
    desc: 'Astrological coordinates cannot be determined.'
  };
};
