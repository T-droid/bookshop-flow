import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/api';

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
