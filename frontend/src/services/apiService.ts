// src/services/apiService.ts
import { IntegrationItem, AuthorizeRequest, IntegrationPlatform } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/v1";

class ApiService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      return text ? JSON.parse(text) : ({} as T);

    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async authorizeIntegration(platform: IntegrationPlatform, data: AuthorizeRequest): Promise<void> {
    if (platform !== 'hubspot') {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    const url = new URL(`${API_BASE_URL}/hubspot/oauth2/authorize`);
    url.searchParams.append('org_id', data.org_id);
    url.searchParams.append('user_id', data.user_id);
    
    window.location.href = url.toString();
  }

  async getIntegrationItems(platform: IntegrationPlatform, userId: string, orgId: string): Promise<IntegrationItem[]> {
    if (platform !== 'hubspot') {
        throw new Error(`Unsupported platform: ${platform}`);
    }

    const endpoint = `/hubspot/items?user_id=${encodeURIComponent(userId)}&org_id=${encodeURIComponent(orgId)}`;
    return this.makeRequest<IntegrationItem[]>(endpoint);
  }
}

export const apiService = new ApiService();