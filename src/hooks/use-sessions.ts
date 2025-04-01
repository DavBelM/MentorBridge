import useSWR from 'swr'

export function useSessions() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/sessions?role=MENTEE',
    async (url) => {
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch sessions')
      return res.json()
    },
    {
      revalidateOnFocus: false, // Don't refetch when tab gets focus
      dedupingInterval: 10000, // Cache for 10 seconds
    }
  )
  
  return {
    sessions: data,
    isLoading,
    isError: error,
    mutate // For manual revalidation
  }
}