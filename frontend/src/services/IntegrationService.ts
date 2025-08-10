import { IntegrationConfig, IntegrationPlatform } from '../types';

class IntegrationService {
  private integrations: Record<IntegrationPlatform, IntegrationConfig> = {
    hubspot: {
      name: 'hubspot',
      displayName: 'HubSpot',
      color: 'bg-orange-500',
      icon: '🚀',
      description: 'Connect your HubSpot CRM to access contacts and data'
    },
    notion: {
      name: 'notion',
      displayName: 'Notion',
      color: 'bg-gray-800',
      icon: '📝',
      description: 'Sync with your Notion workspace and pages'
    },
    airtable: {
      name: 'airtable',
      displayName: 'Airtable',
      color: 'bg-blue-500',
      icon: '📊',
      description: 'Access your Airtable bases and records'
    }
  };

  getIntegrationConfig(platform: IntegrationPlatform): IntegrationConfig {
    return this.integrations[platform];
  }

  getAllIntegrations(): IntegrationConfig[] {
    return Object.values(this.integrations);
  }

  isValidPlatform(platform: string): platform is IntegrationPlatform {
    return platform in this.integrations;
  }
}

export const integrationService = new IntegrationService();