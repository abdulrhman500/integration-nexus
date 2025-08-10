import React, { useEffect } from 'react';
import IntegrationForm from '../components/IntegrationForm';
import DataList from '../components/DataList';
import StatusAlert from '../components/StatusAlert';
import { useIntegrationState } from '../hooks/useIntegrationState';
import { useUrlParams } from '../hooks/useUrlParams';
import { IntegrationPlatform, AuthorizeRequest } from '../types';

const IntegrationsPage = () => {
  const { state, actions } = useIntegrationState();
  const { params, clearParams } = useUrlParams();

  useEffect(() => {
    // Check for existing credentials from URL params
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <StatusAlert status={params.status} onDismiss={handleStatusDismiss} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Integration Form */}
        <div className="space-y-6">
          <IntegrationForm onSubmit={handleAuthorize} loading={state.loading} />
          
          {state.credentials && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Session</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">User ID:</span> {state.credentials.userId}</p>
                <p><span className="font-medium">Org ID:</span> {state.credentials.orgId}</p>
                <p><span className="font-medium">Platform:</span> {state.currentPlatform}</p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={state.dataLoading}
                className="mt-4 w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 transition-colors"
              >
                {state.dataLoading ? 'Fetching Data...' : 'Fetch Data'}
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Data Display */}
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
  );
};

export default IntegrationsPage;