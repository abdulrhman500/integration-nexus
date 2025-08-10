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
    <div className="bg-gradient-to-br from-white via-slate-50 to-indigo-50 rounded-2xl shadow-2xl p-8 border border-slate-200/60 backdrop-blur-sm relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-400/10 to-purple-600/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-400/10 to-blue-600/10 rounded-full translate-y-12 -translate-x-12"></div>
      
      <div className="text-center mb-8 relative">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-violet-700 to-indigo-600 bg-clip-text text-transparent mb-2">
          Connect Integration
        </h2>
        <p className="text-slate-600">Choose your platform and enter your credentials</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 relative">
        <div>
          <label htmlFor="platform" className="block text-sm font-semibold text-slate-700 mb-3">
            Integration Platform
          </label>
          <select
            id="platform"
            value={selectedPlatform}
            onChange={handlePlatformChange}
            className="w-full pl-4 pr-4 py-3 border-2 border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400 transition-all duration-200 bg-white/70 hover:bg-white cursor-pointer backdrop-blur-sm"
          >
            {integrations.map((integration) => (
              <option key={integration.name} value={integration.name}>
                {integration.displayName}
              </option>
            ))}
          </select>
          <div className="mt-3 p-3 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 rounded-lg border border-violet-200/50 backdrop-blur-sm">
            <p className="text-sm text-slate-700">
              {integrationService.getIntegrationConfig(selectedPlatform).description}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="org_id" className="block text-sm font-semibold text-slate-700 mb-3">
              Organization ID
            </label>
            <input
              type="text"
              id="org_id"
              name="org_id"
              value={formData.org_id}
              onChange={handleInputChange}
              placeholder="e.g., org_12345"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400 transition-all duration-200 bg-white/70 hover:bg-white placeholder-slate-400 backdrop-blur-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="user_id" className="block text-sm font-semibold text-slate-700 mb-3">
              User ID
            </label>
            <input
              type="text"
              id="user_id"
              name="user_id"
              value={formData.user_id}
              onChange={handleInputChange}
              placeholder="e.g., user_67890"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400 transition-all duration-200 bg-white/70 hover:bg-white placeholder-slate-400 backdrop-blur-sm"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`w-full py-4 px-6 rounded-xl text-white font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
            !isFormValid || loading
              ? 'bg-slate-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-600 hover:from-violet-600 hover:via-purple-700 hover:to-indigo-700 shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40'
          }`}
        >
          {loading ? 'Connecting...' : `Connect to ${integrationService.getIntegrationConfig(selectedPlatform).displayName}`}
        </button>
      </form>
      
      <div className="mt-4 flex items-center justify-center space-x-2 relative">
        <div className={`w-2 h-2 rounded-full transition-colors ${formData.org_id ? 'bg-emerald-400 shadow-emerald-400/50 shadow-sm' : 'bg-slate-300'}`}></div>
        <div className={`w-2 h-2 rounded-full transition-colors ${formData.user_id ? 'bg-emerald-400 shadow-emerald-400/50 shadow-sm' : 'bg-slate-300'}`}></div>
        <span className="text-xs text-slate-500 ml-2">
          {isFormValid ? 'Ready to connect' : 'Fill in all fields'}
        </span>
      </div>
    </div>
  );
};

export default IntegrationForm;