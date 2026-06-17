export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
  tier: 'free' | 'pro' | 'vip';
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  market: string;
}

export interface Stock {
  id: number;
  user_id: number;
  symbol: string;
  name: string;
  market: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  created_at: string;
  updated_at: string;
}

export interface StockGroup {
  id: string;
  name?: string;
  type: 'system' | 'custom';
}

export interface StockPreferences {
  groups: StockGroup[];
  stockOrder: number[];
  groupAssignments: Record<string, number[]>;
}

export interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}
