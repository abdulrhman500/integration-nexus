import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UrlParams {
  userId?: string;
  orgId?: string;
  status?: string;
}

export const useUrlParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [params, setParams] = useState<UrlParams>({});

  useEffect(() => {
    const userId = searchParams.get('user_id') || undefined;
    const orgId = searchParams.get('org_id') || undefined;
    const status = searchParams.get('status') || undefined;

    setParams({ userId, orgId, status });
  }, [searchParams]);

  const updateParams = (newParams: Partial<UrlParams>) => {
    const currentParams = new URLSearchParams(searchParams);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined) {
        const paramKey = key === 'userId' ? 'user_id' : key === 'orgId' ? 'org_id' : key;
        currentParams.set(paramKey, value);
      }
    });

    setSearchParams(currentParams);
  };

  const clearParams = (paramsToClear?: (keyof UrlParams)[]) => {
    const currentParams = new URLSearchParams(searchParams);
    
    if (paramsToClear) {
      paramsToClear.forEach(param => {
        const paramKey = param === 'userId' ? 'user_id' : param === 'orgId' ? 'org_id' : param;
        currentParams.delete(paramKey);
      });
    } else {
      currentParams.forEach((_, key) => currentParams.delete(key));
    }

    setSearchParams(currentParams);
  };

  return {
    params,
    updateParams,
    clearParams
  };
};