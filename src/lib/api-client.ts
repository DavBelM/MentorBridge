// This is a utility to make authenticated API calls

import { toast } from "@/components/ui/use-toast";

// Utility function to get token from localStorage
const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

// API client function with authentication
export async function apiClient<T = any>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  const token = getAuthToken();
  
  // Modified to be more precise with the endpoints that don't need authentication
  const isAuthEndpoint = 
    endpoint.includes('/api/auth/login') || 
    endpoint.includes('/api/auth/register') || 
    endpoint.includes('/api/auth/reset-password');
  
  // Only redirect if not an auth endpoint and no token
  if (!token && !isAuthEndpoint) {
    window.location.href = '/login';
    return null;
  }
  
  // Add authorization header if token exists
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });
    
    // If unauthorized, clear token and redirect to login
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login?sessionExpired=true';
      return null;
    }
    
    // For successful requests with no content
    if (response.status === 204) {
      return {} as T;
    }
    
    // Handle errors
    if (!response.ok) {
      // Try to parse error response as JSON
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || response.statusText);
    }
    
    // For empty responses, return empty object
    if (response.status === 204) {
      return {} as T;
    }
    
    // For JSON responses
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Something went wrong",
      variant: "destructive"
    });
    throw error;
  }
}

// Convenience methods
export const get = <T>(endpoint: string, config?: RequestInit) => 
  apiClient<T>(endpoint, { ...config, method: 'GET' });

// Update post to handle FormData correctly
export const post = <T>(endpoint: string, body: any, config?: RequestInit) => {
  const isFormData = body instanceof FormData;
  
  return apiClient<T>(endpoint, { 
    ...config, 
    method: 'POST', 
    // Don't manually set the content type for FormData
    // The browser will set the appropriate boundary
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    body 
  });
}

export const put = <T>(endpoint: string, body: any, config?: RequestInit) => 
  apiClient<T>(endpoint, { ...config, method: 'PUT', body });

export const del = <T>(endpoint: string, config?: RequestInit) => 
  apiClient<T>(endpoint, { ...config, method: 'DELETE' });

export async function patch<T>(url: string, data: any): Promise<T> {
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}