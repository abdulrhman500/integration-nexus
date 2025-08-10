import React, { useEffect } from 'react';
import IntegrationForm from '../components/IntegrationForm';
import DataList from '../components/DataList';
import StatusAlert from '../components/StatusAlert';
import { useIntegrationState } from '../hooks/useIntegrationState';
import { useUrlParams } from '../hooks/useUrlParams';
import { IntegrationPlatform, AuthorizeRequest } from '../types';

function IntegrationsPage() {
  const { state, actions } = useIntegrationState();
  const { params, clearParams } = useUrlParams();

  useEffect(() => {
    if (params.userId && params.orgId) {
      actions.checkExistingCredentials(params.userId, params.orgId);
    }
  }, [params.userId, params.orgId, actions]);

  const handleAuthorize = (platform: IntegrationPlatform, data: AuthorizeRequest) => {
    actions.authorize(platform, data);
  };

  const handleStatusDismiss = () => {
    clearParams(['status']);
  };

  const handleRefresh = () => {
    actions.fetchData();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatusAlert status={params.status} onDismiss={handleStatusDismiss} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <IntegrationForm onSubmit={handleAuthorize} loading={state.loading} />
            {state.credentials && (
              <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
                {/* Active Session Header */}
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-gray-900">Active Session</h3>
                  <p className="text-xs text-gray-600">
                    Connected and ready to fetch data
                  </p>
                </div>
                {/* Credentials */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-xs font-medium text-gray-700">User ID</span>
                    <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border">
                      {state.credentials.userId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-xs font-medium text-gray-700">Organization ID</span>
                    <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border">
                      {state.credentials.orgId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-xs font-medium text-gray-700">Platform</span>
                    <span className="text-xs font-semibold capitalize text-gray-900">
                      {state.currentPlatform}
                    </span>
                  </div>
                </div>
                {/* Fetch Data Button */}
                <button
                  onClick={handleRefresh}
                  disabled={state.dataLoading}
                  className="w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 text-sm transition-all transform hover:scale-105 active:scale-95 shadow hover:shadow-md"
                >
                  {state.dataLoading ? 'Fetching Data...' : 'Fetch Data'}
                </button>
              </div>
            )}
          </div>
          {/* Right Column */}
          <div className="space-y-6">
            <DataList
              items={state.items}
              platform={state.currentPlatform}
              loading={state.dataLoading}
              error={state.error}
              onRefresh={handleRefresh}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default IntegrationsPage;