import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

const QUERY_KEY = ['resumes'];

export function useResumes() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: api.listResumes });
}

export function useUploadResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => api.uploadResume(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}
