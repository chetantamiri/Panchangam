/**
 * types/index.ts
 * Shared TypeScript interfaces and types for the Panchangam app.
 */

// ─── Auth / User ─────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: 'admin' | 'user';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  createdAt: string;
}

// ─── Location ────────────────────────────────────────────────────────────────

export interface LocationItem {
  name: string;
  fullName: string;
  latitude: number;
  longitude: number;
}

// ─── VedAstro ────────────────────────────────────────────────────────────────

export interface VedAstroLocation {
  Name: string;
  Latitude: number;
  Longitude: number;
}

export interface VedAstroTime {
  StdTime: string;
  Location: VedAstroLocation;
}

export interface VedAstroPayload {
  Time: VedAstroTime;
  Ayanamsa: string;
}

export interface MatchReportRequest {
  MaleBirthTime: VedAstroTime;
  FemaleBirthTime: VedAstroTime;
  Ayanamsa: string;
}

export interface HoroscopePredictionsRequest {
  BirthTime: VedAstroTime;
  FilterTags: string;
  SortByWeight: string;
  Ayanamsa: string;
}

export interface NorthIndianChartRequest {
  Time: {
    StdTime: string;
    Location: {
      Name: string;
      Latitude: number;
      Longitude: number;
    };
  };
  ChartType: string;
  Ayanamsa: string;
}

export interface SouthIndianChartRequest {
  Time: {
    StdTime: string;
    Location: {
      Name: string;
      Latitude: number;
      Longitude: number;
    };
  };
  ChartType: string;
  Ayanamsa: string;
}
