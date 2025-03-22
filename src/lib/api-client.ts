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
const getHeaders = (contentType = 'application/json') => {
  const headers: Record<string, string> = {};
  
  // Only set Content-Type if it's not FormData (let the browser set it)
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Generic fetch wrapper with auth
export async function apiClient<T>(
  endpoint: string, 
  { body, headers, ...customConfig }: RequestInit & { body?: any } = {}
): Promise<T> {
  const isFormData = body instanceof FormData;
  
  // Get token from localStorage
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('token') 
    : null;
  
  const config: RequestInit = {
    method: 'GET',
    ...customConfig,
    headers: {
      // For non-FormData requests
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      // Add authorization header if token exists
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...headers,
    },
  };
  
  // Handle body based on type
  if (body) {
    if (isFormData) {
      config.body = body;
    } else {
      config.body = JSON.stringify(body);
    }
  }
  
  try {
    console.log(`Fetching ${endpoint} with auth:`, token ? 'Yes' : 'No');
    
    const response = await fetch(`${endpoint}`, config);
    
    if (!response.ok) {
      // Try to parse error response as JSON
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || response.statusText);
    }
    
    // For empty responses, return empty object
    if (response.status === 204) {
      return {} as T;
    }
    
    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
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