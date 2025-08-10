import { IntegrationItem, OAuthCredentials, AuthorizeRequest, IntegrationPlatform } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/v1";
console
  .log(`API Base URL: ${API_BASE_URL}`);

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }
  async authorizeHubspot(data: AuthorizeRequest): Promise<void> {
    // Build the GET URL with query params
    const url = new URL(`${API_BASE_URL}/hubspot/oauth2/authorize`);
    url.searchParams.append('org_id', data.org_id);
    url.searchParams.append('user_id', data.user_id);

    // Redirect the browser to start the OAuth flow
    window.location.href = url.toString();
  }

  async getHubspotCredentials(userId: string, orgId: string): Promise<OAuthCredentials> {
    return this.makeRequest<OAuthCredentials>(
      `/hubspot/credentials?user_id=${encodeURIComponent(userId)}&org_id=${encodeURIComponent(orgId)}`
    );
  }

  async getHubspotContacts(userId: string, orgId: string): Promise<IntegrationItem[]> {
    return this.makeRequest<IntegrationItem[]>(
      `/hubspot/items?user_id=${encodeURIComponent(userId)}&org_id=${encodeURIComponent(orgId)}`
    );
  }

  // Future integrations
  async authorizeNotion(data: AuthorizeRequest): Promise<void> {
    throw new Error('Notion integration not yet implemented');
  }

  async authorizeAirtable(data: AuthorizeRequest): Promise<void> {
    throw new Error('Airtable integration not yet implemented');
  }

  async getNotionItems(userId: string, orgId: string): Promise<IntegrationItem[]> {
    throw new Error('Notion integration not yet implemented');
  }

  async getAirtableItems(userId: string, orgId: string): Promise<IntegrationItem[]> {
    throw new Error('Airtable integration not yet implemented');
  }

  // Generic method for all integrations
  async authorizeIntegration(platform: IntegrationPlatform, data: AuthorizeRequest): Promise<void> {
    switch (platform) {
      case 'hubspot':
        return this.authorizeHubspot(data);
      case 'notion':
        return this.authorizeNotion(data);
      case 'airtable':
        return this.authorizeAirtable(data);
      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
  }

  async getIntegrationItems(
    platform: IntegrationPlatform,
    userId: string,
    orgId: string
  ): Promise<IntegrationItem[]> {
    switch (platform) {
      case 'hubspot':
        return this.getHubspotContacts(userId, orgId);
      case 'notion':
        return this.getNotionItems(userId, orgId);
      case 'airtable':
        return this.getAirtableItems(userId, orgId);
      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
  }

  // Health check method
  async healthCheck(): Promise<{ status: string }> {
    return this.makeRequest<{ status: string }>('/health');
  }
}

export const apiService = new ApiService();