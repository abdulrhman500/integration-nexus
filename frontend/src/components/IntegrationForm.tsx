import React, { useState } from 'react';
import { IntegrationPlatform, AuthorizeRequest } from '../types';
import { integrationService } from '../services/IntegrationService';

interface IntegrationFormProps {
  onSubmit: (platform: IntegrationPlatform, data: AuthorizeRequest) => void;
  loading: boolean;
}

const IntegrationForm: React.FC<IntegrationFormProps> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState<AuthorizeRequest>({
    org_id: '',
    user_id: ''
  });
  const [selectedPlatform, setSelectedPlatform] = useState<IntegrationPlatform>('hubspot');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlatform(e.target.value as IntegrationPlatform);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.org_id.trim() && formData.user_id.trim()) {
      onSubmit(selectedPlatform, formData);
    }
  };

  const isFormValid = formData.org_id.trim() && formData.user_id.trim();
  const integrations = integrationService.getAllIntegrations();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Connect Integration
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-2">
            Integration Platform
          </label>
          <select
            id="platform"
            value={selectedPlatform}
            onChange={handlePlatformChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {integrations.map((integration) => (
              <option key={integration.name} value={integration.name}>
                {integration.icon} {integration.displayName}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-600">
            {integrationService.getIntegrationConfig(selectedPlatform).description}
          </p>
        </div>

        <div>
          <label htmlFor="org_id" className="block text-sm font-medium text-gray-700 mb-2">
            Organization ID
          </label>
          <input
            type="text"
            id="org_id"
            name="org_id"
            value={formData.org_id}
            onChange={handleInputChange}
            placeholder="Enter your organization ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-2">
            User ID
          </label>
          <input
            type="text"
            id="user_id"
            name="user_id"
            value={formData.user_id}
            onChange={handleInputChange}
            placeholder="Enter your user ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
            !isFormValid || loading
              ? 'bg-gray-400 cursor-not-allowed'
              : `${integrationService.getIntegrationConfig(selectedPlatform).color} hover:opacity-90`
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </span>
          ) : (
            `Connect to ${integrationService.getIntegrationConfig(selectedPlatform).displayName}`
          )}
        </button>
      </form>
    </div>
  );
};

export default IntegrationForm;