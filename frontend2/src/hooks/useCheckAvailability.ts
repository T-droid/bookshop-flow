import { useQuery, UseQueryResult } from '@tanstack/react-query';
import apiClient from '@/api/api';
import { BookResponse } from '@/types/books';


export const useCheckTenantName = (name: string, enabled: boolean) => {
  return useQuery({
    queryKey: ['checkTenantName', name],
    queryFn: async () => {
      const { data } = await apiClient.get(`/onboarding/check-tenant-name?name=${name}`);
      return data.exists;
    },
    enabled: enabled && !!name, // only run when enabled and name is not empty
  });
};

export const useCheckAdminEmail = (email: string, enabled: boolean) => {
  return useQuery({
    queryKey: ['checkAdminEmail', email],
    queryFn: async () => {
      const { data } = await apiClient.get(`/onboarding/check-admin-email?email=${email}`);
      return data.exists;
    },
    enabled: enabled && !!email,
  });
};

export const useCheckBookAvailability = (
  isbn: string,
  enabled: boolean
): UseQueryResult<BookResponse | null, Error> => {
  return useQuery<BookResponse | null, Error>({
    queryKey: ['checkBookAvailability', isbn],
    queryFn: async () => {
      const { data } = await apiClient.get(`books/isbn/${isbn}`);
      return data ? data : null;
    },
    enabled: enabled && !!isbn,
  });
};

export const useCheckTaxNameAvailability = (name: string, enabled: boolean) => {
  return useQuery({
    queryKey: ['checkTaxName', name],
    queryFn: async () => {
      const { data } = await apiClient.get(`/taxes/check-tax-name?name=${name}`);
      return data.is_unique;
    },
    enabled: enabled && !!name,
  });
}
