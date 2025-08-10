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

  const handleFetchData = () => {
    console.log('Fetch Data button clicked!');
    actions.fetchData();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
        gap: '30px'
      }}>
        <StatusAlert status={params.status} onDismiss={handleStatusDismiss} />
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <IntegrationForm onSubmit={handleAuthorize} loading={state.loading} />
          
          {/* Always Visible Fetch Data Section */}
          <div style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            borderRadius: '20px',
            padding: '25px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1), 0 1px 8px rgba(0,0,0,0.05)',
            border: '1px solid rgba(255,255,255,0.8)'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#2d3748',
                margin: '0 0 8px 0'
              }}>
                🚀 Data Operations
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#718096',
                margin: '0'
              }}>
                Fetch data from your connected platform
              </p>
            </div>
            
            {/* Fetch Data Button - Always Visible */}
            <button
              onClick={handleFetchData}
              disabled={state.dataLoading}
              style={{
                width: '100%',
                padding: '15px 20px',
                background: state.dataLoading 
                  ? 'linear-gradient(45deg, #9ca3af, #6b7280)' 
                  : 'linear-gradient(45deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: state.dataLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: state.dataLoading 
                  ? 'none' 
                  : '0 4px 15px rgba(16, 185, 129, 0.3)',
                transform: 'scale(1)',
              }}
              onMouseEnter={(e) => {
                if (!state.dataLoading) {
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = 'scale(1.02)';
                  target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!state.dataLoading) {
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = 'scale(1)';
                  target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                }
              }}
            >
              {state.dataLoading ? '⏳ Fetching Data...' : '📊 Fetch Data'}
            </button>
          </div>

          {/* Credentials Section - Only shows when credentials exist */}
          {actions.hasCredentials() && (
            <div style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%)',
              borderRadius: '20px',
              padding: '25px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
              border: '1px solid rgba(99, 102, 241, 0.1)'
            }}>
              {/* Active Session Header */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#1a202c',
                  margin: '0 0 8px 0'
                }}>
                  ✅ Active Session
                </h3>
                <p style={{
                  fontSize: '13px',
                  color: '#4a5568',
                  margin: '0'
                }}>
                  Connected and ready to fetch data
                </p>
              </div>
              
              {/* Credentials */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'rgba(99, 102, 241, 0.05)',
                  borderRadius: '10px',
                  border: '1px solid rgba(99, 102, 241, 0.1)'
                }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    👤 User ID
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    background: 'white',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    color: '#1f2937'
                  }}>
                    {actions.getCurrentCredentials()?.userId}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'rgba(99, 102, 241, 0.05)',
                  borderRadius: '10px',
                  border: '1px solid rgba(99, 102, 241, 0.1)'
                }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    🏢 Organization ID
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    background: 'white',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    color: '#1f2937'
                  }}>
                    {actions.getCurrentCredentials()?.orgId}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'rgba(99, 102, 241, 0.05)',
                  borderRadius: '10px',
                  border: '1px solid rgba(99, 102, 241, 0.1)'
                }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    🔗 Platform
                  </span>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    textTransform: 'capitalize',
                    color: '#1a202c',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {state.currentPlatform}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <DataList
            items={state.items}
            platform={state.currentPlatform}
            loading={state.dataLoading}
            error={state.error}
            onRefresh={handleFetchData}
          />
        </div>
      </div>
    </div>
  );
}

export default IntegrationsPage;