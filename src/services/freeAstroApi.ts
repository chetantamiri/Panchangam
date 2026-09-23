/**
 * Service to interact with FreeAstroAPI Vedic Panchang API
 */

export interface FreeAstroPanchangRequest {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  city: string;
  lat: number;
  lng: number;
  tz_str: string;
  ayanamsha: 'lahiri' | 'raman' | 'kp' | 'sayana';
  house_system: 'whole_sign' | 'equal_house' | 'placidus' | 'koch';
  node_type: 'mean' | 'true';
}

const parseDateComponents = (dateInput: Date | string): { year: number; month: number; day: number } => {
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
      const spaceParts = cleanStr.split(/\s+/);
      if (spaceParts.length === 3) {
        const dayNum = parseInt(spaceParts[0].replace(/[^0-9]/g, ''), 10);
        const monthStr = spaceParts[1].toLowerCase();
        const yearNum = parseInt(spaceParts[2], 10);
        const monthsMap: Record<string, number> = {
          jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
          jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
          january: 0, february: 1, march: 2, april: 3, june: 5,
          july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
        };
        const monthNum = monthsMap[monthStr] !== undefined ? monthsMap[monthStr] : 6;
        d = new Date(yearNum, monthNum, dayNum);
      } else {
        d = new Date();
      }
    }
  }

  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  };
};

const getTimezoneString = (longitude: number): string => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) return tz;
  } catch (e) {}

  if (longitude === undefined || longitude === null || isNaN(Number(longitude))) {
    return 'Asia/Kolkata';
  }
  
  const offset = Math.round((Number(longitude) / 15) * 2) / 2;
  
  const tzMap: Record<number, string> = {
    [-12]: 'Etc/GMT+12',
    [-11]: 'Pacific/Midway',
    [-10]: 'Pacific/Honolulu',
    [-9.5]: 'Pacific/Marquesas',
    [-9]: 'America/Anchorage',
    [-8]: 'America/Los_Angeles',
    [-7]: 'America/Denver',
    [-6]: 'America/Chicago',
    [-5]: 'America/New_York',
    [-4.5]: 'America/Caracas',
    [-4]: 'America/Halifax',
    [-3.5]: 'America/St_Johns',
    [-3]: 'America/Sao_Paulo',
    [-2]: 'America/Noronha',
    [-1]: 'Atlantic/Azores',
    [0]: 'Europe/London',
    [1]: 'Europe/Paris',
    [2]: 'Europe/Athens',
    [3]: 'Europe/Moscow',
    [3.5]: 'Asia/Tehran',
    [4]: 'Asia/Dubai',
    [4.5]: 'Asia/Kabul',
    [5]: 'Asia/Karachi',
    [5.5]: 'Asia/Kolkata',
    [5.75]: 'Asia/Kathmandu',
    [6]: 'Asia/Dhaka',
    [6.5]: 'Asia/Yangon',
    [7]: 'Asia/Bangkok',
    [8]: 'Asia/Singapore',
    [8.75]: 'Australia/Eucla',
    [9]: 'Asia/Tokyo',
    [9.5]: 'Australia/Adelaide',
    [10]: 'Australia/Sydney',
    [10.5]: 'Australia/Lord_Howe',
    [11]: 'Pacific/Guadalcanal',
    [11.5]: 'Pacific/Norfolk',
    [12]: 'Pacific/Auckland',
    [12.75]: 'Pacific/Chatham',
    [13]: 'Pacific/Apia',
    [14]: 'Pacific/Kiritimati'
  };
  
  return tzMap[offset] || 'Asia/Kolkata';
};

/**
 * Call FreeAstroAPI Vedic Panchang API
 */
export const getFreeAstroPanchang = async (
  date: Date | string,
  latitude: number,
  longitude: number,
  locationName: string = 'Bhimavaram'
): Promise<any> => {
  const { year, month, day } = parseDateComponents(date);
  const tz_str = getTimezoneString(longitude);

  // Extract clean city name from locationName (e.g. "Bhimavaram, India" -> "Bhimavaram")
  const city = locationName ? locationName.split(',')[0].trim() : 'Bhimavaram';

  const payload: FreeAstroPanchangRequest = {
    year,
    month,
    day,
    hour: 6, // matching 6 AM defaults
    minute: 0,
    city,
    lat: Number(latitude),
    lng: Number(longitude),
    tz_str,
    ayanamsha: 'lahiri',
    house_system: 'whole_sign',
    node_type: 'mean'
  };

  const apiKey = process.env.EXPO_PUBLIC_FREEASTRO_API_KEY || '501a5af526385b8ec9990082a044814d1532334a186d1a5f7f26f5600691ed4a';
  const baseUrl = 'https://api.freeastroapi.com/api/v2/vedic/panchang';
  
  const url = (typeof window !== 'undefined' && window.document)
    ? `https://corsproxy.io/?${encodeURIComponent(baseUrl)}`
    : baseUrl;

  try {
    console.log(`[FreeAstroAPI] Request: POST ${url} with body:`, JSON.stringify(payload));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[FreeAstroAPI] Server returned error status ${response.status}:`, errorText);
      throw new Error(`FreeAstroAPI error: Status ${response.status}. Details: ${errorText}`);
    }

    const data = await response.json();
    console.log('[FreeAstroAPI] Success response received.');
    return data;
  } catch (error: any) {
    console.error('[FreeAstroAPI] Request failed:', error.message || error);
    throw error;
  }
};
