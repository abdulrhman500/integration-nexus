import { useState, useEffect, useCallback } from 'react';
import { IntegrationItem, IntegrationPlatform, AuthorizeRequest } from '../types';
import { apiService } from '../services/apiService';

interface IntegrationState {
  loading: boolean;
  dataLoading: boolean;
  items: IntegrationItem[];
  error: string;
  currentPlatform: IntegrationPlatform;
}

export const useIntegrationState = () => {
  const [state, setState] = useState<IntegrationState>({
    loading: false,
    dataLoading: false,
    items: [],
    error: '',
    currentPlatform: 'hubspot',
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

  // Get credentials from localStorage
  const getCredentialsFromStorage = useCallback((platform?: IntegrationPlatform) => {
    const targetPlatform = platform || state.currentPlatform;
    const orgId = localStorage.getItem(`${targetPlatform}_org_id`);
    const userId = localStorage.getItem(`${targetPlatform}_user_id`);
    
    if (orgId && userId) {
      return { userId, orgId };
    }
    return null;
  }, [state.currentPlatform]);

  const authorize = useCallback(async (platform: IntegrationPlatform, data: AuthorizeRequest) => {
    updateState({ loading: true, error: '', currentPlatform: platform });
    try {
      // Credentials are already stored in localStorage by the form
      await apiService.authorizeIntegration(platform, data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authorization failed');
    } finally {
      updateState({ loading: false });
    }
  }, [updateState, setError]);

  // Fetch data using localStorage credentials
  const fetchData = useCallback(async (platform?: IntegrationPlatform) => {
    const targetPlatform = platform || state.currentPlatform;
    
    // Get credentials from localStorage
    const credentials = getCredentialsFromStorage(targetPlatform);
    
    console.log('Fetching data for platform:', targetPlatform);
    console.log('Credentials from localStorage:', credentials);

    if (!credentials) {
      console.log('No credentials found in localStorage');
      setError('No credentials found. Please authorize first.');
      return;
    }

    updateState({ dataLoading: true, error: '', currentPlatform: targetPlatform });

    try {
      const fetchedItems = await apiService.getIntegrationItems(
        targetPlatform,
        credentials.userId,
        credentials.orgId
      );

      console.log('Fetched items:', fetchedItems);
      updateState({ items: fetchedItems });
    } catch (error) {
      console.error('Error in fetchData:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
      updateState({ items: [] });
    } finally {
      updateState({ dataLoading: false });
    }
  }, [state.currentPlatform, getCredentialsFromStorage, updateState, setError]);

  const checkExistingCredentials = useCallback(async (userId: string, orgId: string, platform?: IntegrationPlatform) => {
    const targetPlatform = platform || 'hubspot'; // Default to hubspot if not specified
    
    updateState({ dataLoading: true, currentPlatform: targetPlatform });
    
    // Store in localStorage for persistence
    localStorage.setItem(`${targetPlatform}_user_id`, userId);
    localStorage.setItem(`${targetPlatform}_org_id`, orgId);
    
    try {
      // Use the generic API method instead of hardcoded hubspot
      const fetchedItems = await apiService.getIntegrationItems(targetPlatform, userId, orgId);
      console.log(`Existing credentials check for ${targetPlatform} - fetched items:`, fetchedItems);
      updateState({ items: fetchedItems });
      return true;
    } catch (error) {
      console.log(`No valid credentials found for ${targetPlatform}`);
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
    });
  }, []);

  // Clear localStorage credentials
  const clearCredentials = useCallback((platform?: IntegrationPlatform) => {
    const targetPlatform = platform || state.currentPlatform;
    localStorage.removeItem(`${targetPlatform}_org_id`);
    localStorage.removeItem(`${targetPlatform}_user_id`);
    updateState({ items: [], error: '' });
  }, [state.currentPlatform, updateState]);

  // Check if credentials exist in localStorage
  const hasCredentials = useCallback((platform?: IntegrationPlatform) => {
    return getCredentialsFromStorage(platform) !== null;
  }, [getCredentialsFromStorage]);

  // Get current credentials for display
  const getCurrentCredentials = useCallback(() => {
    return getCredentialsFromStorage();
  }, [getCredentialsFromStorage]);

  return {
    state,
    actions: {
      authorize,
      fetchData,
      checkExistingCredentials,
      setError,
      clearError,
      resetState,
      clearCredentials,
      hasCredentials,
      getCurrentCredentials
    }
  };
};