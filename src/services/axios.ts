import { Alert } from 'react-native';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface AxiosRequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
}


export interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: AxiosRequestConfig;
}

let cachedStatus: { uid: string; role: string; status: string; timestamp: number } | null = null;

const checkAccessAndBlock = async (url: string): Promise<boolean> => {
  const isAstrologyApi = url.includes('vedastro.org') || 
                        url.includes('horoscope') ||
                        url.includes('api.vedastro.org');

  if (!isAstrologyApi) return true;

  // Allow basic astronomical and public requests to bypass login restrictions
  const isPublicApi = url.includes('/SunriseTime') || 
                       url.includes('/SunsetTime') ||
                       url.includes('/PanchangaTable') ||
                       url.includes('freehoroscopeapi.com');
  if (isPublicApi) return true;

  const currentUser = auth.currentUser;
  if (!currentUser) {
    Alert.alert(
      'Authentication Required',
      'Please sign in or register to calculate Vedic results. Go to the Account tab to proceed.',
      [{ text: 'OK' }]
    );
    return false;
  }

  const now = Date.now();
  if (cachedStatus && cachedStatus.uid === currentUser.uid && (now - cachedStatus.timestamp < 15000)) {
    if (cachedStatus.role === 'admin' || cachedStatus.status === 'approved') {
      return true;
    }
  }

  try {
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userDocRef);
    
    if (userSnap.exists()) {
      const profile = userSnap.data();
      
      cachedStatus = {
        uid: currentUser.uid,
        role: profile.role || 'user',
        status: profile.status || 'pending',
        timestamp: now
      };

      if (profile.role === 'admin' || profile.status === 'approved') {
        return true;
      }

      const status = profile.status || 'pending';
      let statusMsg = 'Your registration is currently pending admin approval.';
      if (status === 'rejected') {
        statusMsg = 'Your registration request has been rejected by the administrator.';
      } else if (status === 'suspended') {
        statusMsg = 'Your account has been suspended by the administrator.';
      }

      Alert.alert(
        'Access Restricted',
        `${statusMsg} You cannot perform calculations at this time.`,
        [{ text: 'OK' }]
      );
      return false;
    } else {
      Alert.alert(
        'Registration Pending',
        'Your profile verification is in progress. You cannot perform calculations yet.',
        [{ text: 'OK' }]
      );
      return false;
    }
  } catch (err) {
    console.error('Error verifying user status in API client:', err);
    Alert.alert(
      'Verification Error',
      'Unable to verify your account status. Please check your network connection.',
      [{ text: 'OK' }]
    );
    return false;
  }
};

const axios = {

  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const isAllowed = await checkAccessAndBlock(url);
    if (!isAllowed) {
      throw new Error('Access denied: Unauthorized user status');
    }
    const controller = new AbortController();
    const timeoutId = config?.timeout ? setTimeout(() => controller.abort(), config.timeout) : null;

    // Set up headers and automatically inject x-api-key for VedAstro requests if available
    const requestHeaders: Record<string, string> = { ...(config?.headers || {}) };
    if (url.includes('vedastro.org') && process.env.EXPO_PUBLIC_VEDASTRO_API_KEY) {
      requestHeaders['x-api-key'] = process.env.EXPO_PUBLIC_VEDASTRO_API_KEY;
    }


    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: requestHeaders,
        signal: controller.signal,
      });

      if (timeoutId) clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData: any;
        try {
          const text = await response.text();
          try {
            errorData = JSON.parse(text);
          } catch {
            errorData = text;
          }
        } catch (err: any) {
          errorData = err.message || 'Unknown response read error';
        }
        const err: any = new Error(`Request failed with status code ${response.status}`);
        err.response = { status: response.status, data: errorData };
        throw err;
      }

      const responseText = await response.text();
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config: config || {},
      };
    } catch (err: any) {
      if (timeoutId) clearTimeout(timeoutId);
      throw err;
    }
  },

  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const isAllowed = await checkAccessAndBlock(url);
    if (!isAllowed) {
      throw new Error('Access denied: Unauthorized user status');
    }
    const controller = new AbortController();
    const timeoutId = config?.timeout ? setTimeout(() => controller.abort(), config.timeout) : null;

    // Set up headers and automatically inject x-api-key for VedAstro requests if available
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(config?.headers || {}),
    };
    if (url.includes('vedastro.org') && process.env.EXPO_PUBLIC_VEDASTRO_API_KEY) {
      requestHeaders['x-api-key'] = process.env.EXPO_PUBLIC_VEDASTRO_API_KEY;
    }


    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      if (timeoutId) clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData: any;
        try {
          const text = await response.text();
          try {
            errorData = JSON.parse(text);
          } catch {
            errorData = text;
          }
        } catch (err: any) {
          errorData = err.message || 'Unknown response read error';
        }
        const err: any = new Error(`Request failed with status code ${response.status}`);
        err.response = { status: response.status, data: errorData };
        throw err;
      }

      const responseText = await response.text();
      let resData: any;
      try {
        resData = JSON.parse(responseText);
      } catch {
        resData = responseText;
      }

      return {
        data: resData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config: config || {},
      };
    } catch (err: any) {
      if (timeoutId) clearTimeout(timeoutId);
      throw err;
    }
  },
};

export default axios;
