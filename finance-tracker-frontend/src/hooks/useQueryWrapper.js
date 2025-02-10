import { useQuery } from '@tanstack/react-query';

export const useQueryWrapper = (queryKey, queryFn, options = {}) => {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    ...options,
  });
};
