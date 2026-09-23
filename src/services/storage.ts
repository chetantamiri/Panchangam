/**
 * storage.ts
 * Cross-platform safe storage utility.
 * Priority: localStorage (web) → Cookie (sandboxed web) → SecureStore (native) → AsyncStorage (native fallback) → Memory
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// ─── Cookie helpers (for sandboxed web iframes) ────────────────────────────

const getCookie = (name: string): string | null => {
  try {
    if (typeof document !== 'undefined') {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        const rawVal = parts.pop()?.split(';').shift() || null;
        return rawVal ? decodeURIComponent(rawVal) : null;
      }
    }
  } catch (_) {}
  return null;
};

const setCookie = (name: string, value: string, days = 365) => {
  try {
    if (typeof document !== 'undefined') {
      const d = new Date();
      d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
      document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Strict`;
    }
  } catch (_) {}
};

const removeCookie = (name: string) => {
  try {
    if (typeof document !== 'undefined') {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }
  } catch (_) {}
};

// ─── Memory fallback ────────────────────────────────────────────────────────

const memoryStore: Record<string, string> = {};

// ─── Public API ─────────────────────────────────────────────────────────────

export const safeStorage = {
  async getItem(key: string): Promise<string | null> {
    // 1. localStorage (fast web path)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch (_) {}

    // 2. Cookie (sandboxed web fallback)
    try {
      const val = getCookie(key);
      if (val !== null) return val;
    } catch (_) {}

    // 3. SecureStore (native)
    try {
      const val = await SecureStore.getItemAsync(key);
      if (val !== null) return val;
    } catch (_) {}

    // 4. AsyncStorage (native fallback)
    try {
      return await AsyncStorage.getItem(key);
    } catch (_) {}

    // 5. Memory
    return memoryStore[key] ?? null;
  },

  async setItem(key: string, value: string): Promise<void> {
    let saved = false;

    // 1. localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        saved = true;
      }
    } catch (_) {}

    // 2. Cookie
    try {
      setCookie(key, value);
      saved = true;
    } catch (_) {}

    // 3. SecureStore
    try {
      await SecureStore.setItemAsync(key, value);
      saved = true;
    } catch (_) {
      // 4. AsyncStorage
      try {
        await AsyncStorage.setItem(key, value);
        saved = true;
      } catch (_) {}
    }

    // 5. Memory fallback
    if (!saved) {
      memoryStore[key] = value;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (_) {}

    try { removeCookie(key); } catch (_) {}

    await Promise.allSettled([
      SecureStore.deleteItemAsync(key),
      AsyncStorage.removeItem(key),
    ]);

    delete memoryStore[key];
  },
};
