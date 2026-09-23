/**
 * Service to interact with Navamsha Astrology API
 */

export interface NavamshaSettings {
  observation_point: 'topocentric' | 'geocentric';
  ayanamsha: 'lahiri' | 'raman' | 'kp' | 'sayana';
  language: 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml';
  node_type: 'mean' | 'true';
}

export interface NavamshaPanchangRequest {
  year: number;
  month: number;
  date: number;
  hours: number;
  minutes: number;
  seconds: number;
  latitude: number;
  longitude: number;
  timezone: number;
  settings: NavamshaSettings;
}

/**
 * Parses date input into numeric year, month, date components
 */
const parseDateComponents = (dateInput: Date | string): { year: number; month: number; date: number } => {
  let d: Date;
  if (!dateInput) {
    d = new Date();
  } else if (dateInput instanceof Date) {
    d = dateInput;
  } else {
    const cleanStr = String(dateInput).trim();
    const parsed = new Date(cleanStr);
    if (!isNaN(parsed.getTime())) {
      d = parsed;
    } else {
      // Manual parse for space separated formats e.g. "23 Jul 2026"
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
        d = new Date(year, month, day);
      } else {
        d = new Date();
      }
    }
  }

  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1, // 1-indexed
    date: d.getDate(), // 1-indexed
  };
};

/**
 * Call Navamsha Advanced Panchang API
 */
export const getAdvancedPanchang = async (
  date: Date | string,
  latitude: number,
  longitude: number
): Promise<any> => {
  const { year, month, date: dayNum } = parseDateComponents(date);

  // Timezone calculation rounded to nearest 0.25 (15 mins) for precision
  let timezone = 5.5; // default to India
  if (longitude !== undefined && longitude !== null && !isNaN(Number(longitude))) {
    timezone = Math.round((Number(longitude) / 15) * 4) / 4;
  }

  const payload: NavamshaPanchangRequest = {
    year,
    month,
    date: dayNum,
    hours: 6, // fixed 6 o'clock
    minutes: 0,
    seconds: 0,
    latitude: Number(latitude),
    longitude: Number(longitude),
    timezone,
    settings: {
      observation_point: 'topocentric',
      ayanamsha: 'lahiri',
      language: 'en',
      node_type: 'mean'
    }
  };

  const apiKey = process.env.EXPO_PUBLIC_NAVAMSHA_API_KEY || 'vda_live_5d1fffcc_SeojvUTE-rsBFEd64XYhZhysSVXpxOMbeoEUeIoDNyE';
  const baseUrl = 'https://api.navamsha.in/api/v1/astrology/panchang/advanced';
  
  const url = (typeof window !== 'undefined' && window.document)
    ? `https://corsproxy.io/?${encodeURIComponent(baseUrl)}`
    : baseUrl;

  try {
    console.log(`[Navamsha API] Request: POST ${url} with body:`, JSON.stringify(payload));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Navamsha API] Server returned error status ${response.status}:`, errorText);
      throw new Error(`Navamsha API error: Status ${response.status}. Details: ${errorText}`);
    }

    const data = await response.json();
    console.log('[Navamsha API] Success response received.');
    return data;
  } catch (error: any) {
    console.error('[Navamsha API] Request failed:', error.message || error);
    throw error;
  }
};
