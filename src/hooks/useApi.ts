import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';

interface ApiOptions<T> {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  dependencies?: any[];
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  requiresAuth?: boolean;
}

export function useApi<T>({
  endpoint,
  method = 'GET',
  body,
  dependencies = [],
  immediate = true,
  onSuccess,
  onError,
  requiresAuth = true
}: ApiOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the token with the constant name from auth context
      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (requiresAuth) {
        if (!token && requiresAuth) {
          throw new Error('Authentication required');
        }
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      
      const options: RequestInit = {
        method,
        headers,
      };
      
      if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
      }
      
      // Handle both absolute and relative URLs
      const url = endpoint.startsWith('/api/') 
        ? endpoint 
        : `/api/${endpoint}`;
        
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'API request failed');
      }
      
      const result = await response.json();
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(err.message || 'Unknown error');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error, refetch: fetchData, setData };
}