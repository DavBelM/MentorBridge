import useSWR from 'swr'

// Create a custom fetcher with auth token
const fetcher = async (url: string) => {
  const token = localStorage.getItem('token')
  const res = await fetch(url, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  })
  
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    // Attach extra info to the error object
    const data = await res.json()
    error.message = data.message || error.message
    throw error
  }
  
  return res.json()
}

export function useFetch(url: string) {
  const { data, error, isLoading, mutate } = useSWR(url, fetcher)
  
  return {
    data,
    isLoading,
    isError: error,
    mutate
  }
}