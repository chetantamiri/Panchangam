import axios from './axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import type { LocationItem } from '../types';

export type { LocationItem };


const LOCATION_STORAGE_KEY = '@user_selected_location';

/**
 * Storage helpers that prioritize window.localStorage on Web
 * and fallback to AsyncStorage on native, suppressing native module missing warnings.
 */
const saveToStorage = async (key: string, value: string) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch (e) {}

  try {
    await AsyncStorage.setItem(key, value);
  } catch (e: any) {
    if (!e?.message?.includes('Native module is null')) {
      console.warn('Storage save failed:', e);
    }
  }
};

const loadFromStorage = async (key: string): Promise<string | null> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {}

  try {
    return await AsyncStorage.getItem(key);
  } catch (e: any) {
    if (!e?.message?.includes('Native module is null')) {
      console.warn('Storage load failed:', e);
    }
    return null;
  }
};

export const searchLocationSuggestions = async (query: string): Promise<LocationItem[]> => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const cleanQuery = query.trim();

  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=6`;
    const response = await axios.get(photonUrl, { timeout: 4000 });

    if (response.data && Array.isArray(response.data.features) && response.data.features.length > 0) {
      return response.data.features.map((feature: any) => {
        const props = feature.properties || {};
        const coords = feature.geometry?.coordinates || [0, 0];
        const name = props.name || props.city || props.street || cleanQuery;
        
        const parts = [
          name,
          props.city !== name ? props.city : null,
          props.state,
          props.country
        ].filter(Boolean);

        return {
          name: `${name}${props.country ? `, ${props.country}` : ''}`,
          fullName: parts.join(', '),
          latitude: Number(coords[1]),
          longitude: Number(coords[0]),
        };
      });
    }
  } catch (error) {
    console.warn('Photon API search failed, falling back to Nominatim', error);
  }

  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery)}&limit=6&addressdetails=1`;
    const response = await axios.get(nominatimUrl, {
      headers: {
        'User-Agent': 'PanchangamApp/1.0',
      },
      timeout: 4000,
    });

    if (Array.isArray(response.data)) {
      return response.data.map((item: any) => {
        const address = item.address || {};
        const cityName = address.city || address.town || address.village || address.county || item.display_name.split(',')[0];
        const country = address.country || '';
        const nameStr = country ? `${cityName}, ${country}` : item.display_name;

        return {
          name: nameStr,
          fullName: item.display_name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
        };
      });
    }
  } catch (error) {
    console.error('Location search error:', error);
  }

  return [];
};

/**
 * Reverse geocode latitude and longitude to a user-friendly city name.
 */
const reverseGeocode = async (latitude: number, longitude: number): Promise<string | null> => {
  try {
    const url = `https://photon.komoot.io/reverse?lon=${longitude}&lat=${latitude}`;
    const response = await axios.get(url, { timeout: 3000 });
    if (response.data && Array.isArray(response.data.features) && response.data.features.length > 0) {
      const props = response.data.features[0].properties || {};
      const city = props.city || props.town || props.village || props.state || '';
      const country = props.country || '';
      return city ? `${city}, ${country}` : country || null;
    }
  } catch (e) {
    console.warn('Photon reverse geocoding failed, trying Nominatim:', e);
  }
  
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'PanchangamApp/1.0' },
      timeout: 3500
    });
    if (response.data && response.data.address) {
      const addr = response.data.address;
      const city = addr.city || addr.town || addr.village || addr.county || '';
      const country = addr.country || '';
      return city ? `${city}, ${country}` : country || null;
    }
  } catch (e) {
    console.error('Reverse geocoding failed:', e);
  }
  return null;
};

/**
 * Requests device GPS coordinates, supporting both native expo-location and HTML5 fallbacks.
 */
const getCoordsFromGps = async (): Promise<{ latitude: number; longitude: number } | null> => {
  // 1. Try Expo native Location API (for iOS/Android phones in Expo Go)
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (locationData && locationData.coords) {
        return {
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
        };
      }
    } else {
      console.warn('GPS location permission denied by user.');
    }
  } catch (error) {
    console.warn('Native Location permission/fetching failed, trying standard browser API:', error);
  }

  // 2. HTML5 standard browser geolocation fallback (for web browsers)
  return new Promise((resolve) => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('HTML5 Geolocation warning:', error.message);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
      );
    } else {
      resolve(null);
    }
  });
};

export const getCurrentLocationByIp = async (): Promise<LocationItem | null> => {
  // Attempt 1: Precise GPS / Geolocation (Vuyyuru instead of ISP Karimnagar)
  try {
    const coords = await getCoordsFromGps();
    if (coords) {
      const name = await reverseGeocode(coords.latitude, coords.longitude);
      if (name) {
        return {
          name,
          fullName: `${name} (GPS Precise)`,
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
      }
    }
  } catch (e) {
    console.warn('GPS Geolocation failed, trying IP lookup fallbacks:', e);
  }

  // Attempt 2: ipwho.is (Fast, HTTPS, high rate limits)
  try {
    const response = await axios.get('https://ipwho.is/', { timeout: 3500 });
    if (response.data && response.data.success && response.data.latitude && response.data.longitude) {
      const city = response.data.city || '';
      const country = response.data.country || '';
      const name = city ? `${city}, ${country}` : country || 'Detected Location';
      return {
        name,
        fullName: `${city}, ${response.data.region || ''}, ${country}`,
        latitude: parseFloat(response.data.latitude),
        longitude: parseFloat(response.data.longitude),
      };
    }
  } catch (error) {
    console.warn('Primary IP Geolocation (ipwho.is) failed, trying fallback:', error);
  }

  // Attempt 3: ipapi.co
  try {
    const response = await axios.get('https://ipapi.co/json/', { timeout: 3500 });
    if (response.data && response.data.latitude && response.data.longitude) {
      const city = response.data.city || '';
      const country = response.data.country_name || '';
      const name = city ? `${city}, ${country}` : country || 'Detected Location';
      return {
        name,
        fullName: `${city}, ${response.data.region || ''}, ${country}`,
        latitude: parseFloat(response.data.latitude),
        longitude: parseFloat(response.data.longitude),
      };
    }
  } catch (error) {
    console.warn('Fallback IP Geolocation (ipapi.co) failed, trying second fallback:', error);
  }

  // Attempt 4: ip-api.com (HTTP only)
  try {
    const response = await axios.get('http://ip-api.com/json/', { timeout: 3500 });
    if (response.data && response.data.status === 'success') {
      const city = response.data.city || '';
      const country = response.data.country || '';
      const name = city ? `${city}, ${country}` : country || 'Detected Location';
      return {
        name,
        fullName: `${city}, ${response.data.regionName || ''}, ${country}`,
        latitude: parseFloat(response.data.lat),
        longitude: parseFloat(response.data.lon),
      };
    }
  } catch (error) {
    console.error('All IP Geolocation attempts failed:', error);
  }
  return null;
};

let cachedLocation: LocationItem | null = null;
let cachedDate: string | null = null;

export const setCachedLocation = async (loc: LocationItem) => {
  cachedLocation = loc;
  await saveToStorage(LOCATION_STORAGE_KEY, JSON.stringify(loc));
};

export const getCachedLocation = (): LocationItem | null => {
  return cachedLocation;
};

export const loadStoredLocation = async (): Promise<LocationItem | null> => {
  try {
    const stored = await loadFromStorage(LOCATION_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as LocationItem;
      cachedLocation = parsed;
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to load stored location:', e);
  }
  return null;
};

export const setCachedDate = (date: string) => {
  cachedDate = date;
};

export const getCachedDate = (): string | null => {
  return cachedDate;
};
