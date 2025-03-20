// Helper for making authenticated API requests

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Get the JWT token from localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Create headers with auth token
const getHeaders = () => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Generic fetch wrapper with auth
export async function apiClient<T>(
  endpoint: string, 
  { body, ...customConfig }: RequestInit & { body?: any } = {}
): Promise<T> {
  const headers = getHeaders();
  const config: RequestInit = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || response.statusText);
  }
  
  return response.json();
}

// Convenience methods
export const get = <T>(endpoint: string, config?: RequestInit) => 
  apiClient<T>(endpoint, { ...config, method: 'GET' });

export const post = <T>(endpoint: string, body: any, config?: RequestInit) => 
  apiClient<T>(endpoint, { ...config, method: 'POST', body });

export const put = <T>(endpoint: string, body: any, config?: RequestInit) => 
  apiClient<T>(endpoint, { ...config, method: 'PUT', body });

export const del = <T>(endpoint: string, config?: RequestInit) => 
  apiClient<T>(endpoint, { ...config, method: 'DELETE' });