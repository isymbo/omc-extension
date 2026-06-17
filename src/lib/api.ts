import type { ApiEnvelope, AuthResponse, Stock, StockPreferences, StockSearchResult } from './types';

type TokenUpdateCallback = (accessToken: string, refreshToken: string) => void;

class ApiClient {
  private serverUrl: string = '';
  private accessToken: string = '';
  private refreshToken: string = '';
  private onTokenUpdate: TokenUpdateCallback | null = null;

  setServerUrl(url: string) {
    this.serverUrl = url.replace(/\/$/, '');
  }

  setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
  }

  setTokenUpdateCallback(callback: TokenUpdateCallback) {
    this.onTokenUpdate = callback;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.serverUrl}/api/v1${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        const retryResponse = await fetch(url, { ...options, headers });
        const retryData: ApiEnvelope<T> = await retryResponse.json();
        if (retryData.code !== 0) {
          throw new Error(retryData.message);
        }
        return retryData.data;
      }
    }

    const data: ApiEnvelope<T> = await response.json();
    if (data.code !== 0) {
      throw new Error(data.message);
    }
    return data.data;
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const url = `${this.serverUrl}/api/v1/auth/refresh`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      const data: ApiEnvelope<AuthResponse> = await response.json();
      if (data.code === 0 && data.data) {
        this.accessToken = data.data.token || data.data.access_token;
        this.refreshToken = data.data.refresh_token;

        // Persist new tokens to storage
        if (this.onTokenUpdate) {
          this.onTokenUpdate(this.accessToken, this.refreshToken);
        }

        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.accessToken = data.token || data.access_token;
    this.refreshToken = data.refresh_token;
    return data;
  }

  async searchStocks(query: string): Promise<StockSearchResult[]> {
    return this.request<StockSearchResult[]>(
      `/stocks/search?q=${encodeURIComponent(query)}`
    );
  }

  async addStock(stock: {
    symbol: string;
    name: string;
    market: string;
    quantity: number;
    purchasePrice: number;
    currentPrice: number;
  }): Promise<Stock> {
    return this.request<Stock>('/stocks', {
      method: 'POST',
      body: JSON.stringify(stock),
    });
  }

  async getPreferences(): Promise<StockPreferences> {
    return this.request<StockPreferences>('/stocks/preferences');
  }

  async updatePreferences(prefs: StockPreferences): Promise<StockPreferences> {
    return this.request<StockPreferences>('/stocks/preferences', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    });
  }
}

export const api = new ApiClient();
