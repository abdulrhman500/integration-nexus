import { useState, useEffect, useCallback } from 'react';
import { IntegrationItem, IntegrationPlatform, AuthorizeRequest } from '../types';
import { apiService } from '../services/apiService';

interface IntegrationState {
  loading: boolean;
  dataLoading: boolean;
  items: IntegrationItem[];
  error: string;
  currentPlatform: IntegrationPlatform;
  credentials: { userId: string; orgId: string } | null;
}

export const useIntegrationState = () => {
  const [state, setState] = useState<IntegrationState>({
    loading: false,
    dataLoading: false,
    items: [],
    error: '',
    currentPlatform: 'hubspot',
    credentials: null
  });

  const updateState = useCallback((updates: Partial<IntegrationState>) => {
    setState(prevState => ({ ...prevState, ...updates }));
  }, []);

  const setError = useCallback((error: string) => {
    updateState({ error });
  }, [updateState]);

  const clearError = useCallback(() => {
    updateState({ error: '' });
  }, [updateState]);

  const authorize = useCallback(async (platform: IntegrationPlatform, data: AuthorizeRequest) => {
    updateState({ loading: true, error: '' });
    
    try {
      updateState({ 
        credentials: { userId: data.user_id, orgId: data.org_id },
        currentPlatform: platform 
      });
      
      await apiService.authorizeIntegration(platform, data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authorization failed');
    } finally {
      updateState({ loading: false });
    }
  }, [updateState, setError]);

  const fetchData = useCallback(async (platform?: IntegrationPlatform) => {
    if (!state.credentials) return;
    
    const targetPlatform = platform || state.currentPlatform;
    updateState({ dataLoading: true, error: '' });
    
    try {
      const fetchedItems = await apiService.getIntegrationItems(
        targetPlatform,
        state.credentials.userId,
        state.credentials.orgId
      );
      updateState({ items: fetchedItems, currentPlatform: targetPlatform });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
      updateState({ items: [] });
    } finally {
      updateState({ dataLoading: false });
    }
  }, [state.credentials, state.currentPlatform, updateState, setError]);

  const checkExistingCredentials = useCallback(async (userId: string, orgId: string) => {
    updateState({ dataLoading: true, credentials: { userId, orgId } });
    
    try {
      await apiService.getHubspotCredentials(userId, orgId);
      const fetchedItems = await apiService.getHubspotContacts(userId, orgId);
      updateState({ items: fetchedItems });
      return true;
    } catch (error) {
      console.log('No valid credentials found');
      return false;
    } finally {
      updateState({ dataLoading: false });
    }
  }, [updateState]);

  const resetState = useCallback(() => {
    setState({
      loading: false,
      dataLoading: false,
      items: [],
      error: '',
      currentPlatform: 'hubspot',
      credentials: null
    });
  }, []);

  return {
    state,
    actions: {
      authorize,
      fetchData,
      checkExistingCredentials,
      setError,
      clearError,
      resetState
    }
  };
};