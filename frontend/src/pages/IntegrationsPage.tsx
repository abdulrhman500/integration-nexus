// src/pages/IntegrationsPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import IntegrationForm from '../components/IntegrationForm';
import DataList from '../components/DataList';
import StatusAlert from '../components/StatusAlert';
import { apiService } from '../services/apiService';
import { IntegrationPlatform, AuthorizeRequest, IntegrationItem } from '../types';

const getCredentials = (platform: IntegrationPlatform) => {
  const userId = localStorage.getItem(`${platform}_user_id`);
  const orgId = localStorage.getItem(`${platform}_org_id`);
  if (userId && orgId) {
    return { userId, orgId };
  }
  return null;
};

const setCredentials = (platform: IntegrationPlatform, creds: { userId: string, orgId: string }) => {
  localStorage.setItem(`${platform}_user_id`, creds.userId);
  localStorage.setItem(`${platform}_org_id`, creds.orgId);
};


function IntegrationsPage() {
  // --- State Management ---
  const [authLoading, setAuthLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [items, setItems] = useState<IntegrationItem[]>([]);
  const [error, setError] = useState('');
  const [platform, setPlatform] = useState<IntegrationPlatform>('hubspot');
  const [currentCredentials, setCurrentCredentials] = useState<{ userId: string; orgId: string } | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // --- Core Logic ---

  // Fetches data using credentials from localStorage
  const handleFetchData = useCallback(async (currentPlatform: IntegrationPlatform) => {
    const creds = getCredentials(currentPlatform);
    if (!creds) {
      setError('No credentials found. Please authorize first.');
      return;
    }

    setDataLoading(true);
    setError('');
    setCurrentCredentials(creds);
    setPlatform(currentPlatform);

    try {
      const fetchedItems = await apiService.getIntegrationItems(currentPlatform, creds.userId, creds.orgId);
      setItems(fetchedItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setItems([]); // Clear items on error
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Effect to handle initial load (from OAuth redirect or existing session)
  useEffect(() => {
    const userId = searchParams.get('user_id');
    const orgId = searchParams.get('org_id');
    const status = searchParams.get('status');
    let shouldFetch = false;

    // Case 1: Coming back from an OAuth redirect
    if (userId && orgId) {
      setCredentials(platform, { userId, orgId });
      shouldFetch = true;

      // Clean up the URL
      searchParams.delete('user_id');
      searchParams.delete('org_id');
      setSearchParams(searchParams, { replace: true });
    } 
    // Case 2: Page is loaded with a pre-existing session in localStorage
    else if (getCredentials(platform)) {
      shouldFetch = true;
    }

    if (shouldFetch) {
        handleFetchData(platform);
    }

    if (status) {
        setError(`Authorization failed: ${status}`);
    }

  }, [platform, handleFetchData, searchParams, setSearchParams]);

  // Starts the OAuth authorization flow
  const handleAuthorize = async (selectedPlatform: IntegrationPlatform, data: AuthorizeRequest) => {
    setAuthLoading(true);
    setError('');
    setPlatform(selectedPlatform);
    
    try {
      await apiService.authorizeIntegration(selectedPlatform, data);
      // User is redirected away by the apiService, so no need to set loading to false here.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authorization failed');
      setAuthLoading(false);
    }
  };

  // Clears any error/status message from the UI and URL
  const handleStatusDismiss = () => {
    setError('');
    searchParams.delete('status');
    setSearchParams(searchParams, { replace: true });
  };

  // --- Render (UI is unchanged) ---
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
        <StatusAlert status={error} onDismiss={handleStatusDismiss} />
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <IntegrationForm onSubmit={handleAuthorize} loading={authLoading} />
          
          <div style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            borderRadius: '20px',
            padding: '25px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1), 0 1px 8px rgba(0,0,0,0.05)',
            border: '1px solid rgba(255,255,255,0.8)'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d3748', margin: '0 0 8px 0' }}>
                🚀 Data Operations
              </h3>
              <p style={{ fontSize: '14px', color: '#718096', margin: '0' }}>
                Fetch data from your connected platform
              </p>
            </div>
            
            <button
              onClick={() => handleFetchData(platform)}
              disabled={dataLoading || !currentCredentials}
              style={{
                width: '100%',
                padding: '15px 20px',
                background: (dataLoading || !currentCredentials) ? 'linear-gradient(45deg, #9ca3af, #6b7280)' : 'linear-gradient(45deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: (dataLoading || !currentCredentials) ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              {dataLoading ? '⏳ Fetching Data...' : '📊 Fetch Data'}
            </button>
          </div>

          {currentCredentials && (
            <div style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%)',
              borderRadius: '20px',
              padding: '25px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
              border: '1px solid rgba(99, 102, 241, 0.1)'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a202c', margin: '0 0 8px 0' }}>
                  ✅ Active Session
                </h3>
                <p style={{ fontSize: '13px', color: '#4a5568', margin: '0' }}>
                  Connected and ready to fetch data
                </p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>👤 User ID</span>
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', background: 'white', padding: '4px 8px', borderRadius: '6px' }}>{currentCredentials.userId}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>🏢 Organization ID</span>
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', background: 'white', padding: '4px 8px', borderRadius: '6px' }}>{currentCredentials.orgId}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>🔗 Platform</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'capitalize', color: '#6366f1' }}>{platform}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <DataList
            items={items}
            platform={platform}
            loading={dataLoading}
            error={error}
            onRefresh={() => handleFetchData(platform)}
          />
        </div>
      </div>
    </div>
  );
}

export default IntegrationsPage;