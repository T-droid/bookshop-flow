import apiClient from "@/api/api";
import { useQuery } from "@tanstack/react-query";


export const useGetSuppliers = (skip = 0, limit = 100) => {
    return useQuery({
        queryKey: ['suppliers', skip, limit],
        queryFn: async () => {
            const response = await apiClient.get(`/suppliers?skip=${skip}&limit=${limit}`);
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
};
