import apiClient from "@/api/api";
import { PurchaseOrder, PurchaseOrderDetails } from "@/types/purchaseOrder";
import { SaleResponse } from "@/types/sales";
import { useQuery, UseQueryResult } from "@tanstack/react-query";


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

export const useGetInventory = (limit: number = 10) => {
    return useQuery({
        queryKey: ['inventory', limit],
        queryFn: async () => {
            const response = await apiClient.get(`/inventory?limit=${limit}`);
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export const useGetPurchaseOrders = (skip = 0, limit = 100): UseQueryResult<PurchaseOrder[]> => {
    return useQuery<PurchaseOrder[] | null, Error>({
        queryKey: ['purchaseOrders', skip, limit],
        queryFn: async () => {
            const response = await apiClient.get(`/purchase-orders?limit=${limit}`);
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export const useGetPurchaseOrderDetails = (po_id: string): UseQueryResult<PurchaseOrderDetails | null, Error> => {
    return useQuery<PurchaseOrderDetails | null, Error>({
        queryKey: ['purchaseOrder', po_id],
        queryFn: async () => {
            const response = await apiClient.get(`/purchase-orders/order-details/${po_id}`);
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!po_id,
    })
}


export const useGetSales = (limit: number = 100): UseQueryResult<SaleResponse[] | null, Error> => {
    return useQuery<SaleResponse[] | null, Error>({
        queryKey: ["sales"],
        queryFn: async () => {
            const response = await apiClient.get(`/sales?limit=${limit}`);
            return response.data;
        },
        staleTime: 5 * 60 * 1000
    })
}