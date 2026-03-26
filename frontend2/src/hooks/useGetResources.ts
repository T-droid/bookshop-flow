import apiClient from "@/api/api";
import { PurchaseOrder, PurchaseOrderDetails } from "@/types/purchaseOrder";
import { InventoryResponse } from "@/types/inventory";
import { SaleResponse, SalesDashboardSummary, SalesReportsSummary } from "@/types/sales";
import { SupplierDashboardResponse } from "@/types/supplier";
import { DefaultTaxResponse, TaxResponse } from "@/types/tax";
import { BookshopUser } from "@/types/user";
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

export const useGetInventory = (limit: number = 10): UseQueryResult<InventoryResponse | null, Error> => {
    return useQuery<InventoryResponse | null, Error>({
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
        queryKey: ["sales", limit],
        queryFn: async () => {
            const response = await apiClient.get(`/sales?limit=${limit}`);
            return response.data;
        },
        staleTime: 5 * 60 * 1000
    })
}

export const useGetSalesDashboardSummary = (recentLimit: number = 5): UseQueryResult<SalesDashboardSummary | null, Error> => {
    return useQuery<SalesDashboardSummary | null, Error>({
        queryKey: ["salesDashboardSummary", recentLimit],
        queryFn: async () => {
            const response = await apiClient.get(`/sales/dashboard-summary?recent_limit=${recentLimit}`);
            return response.data;
        },
        staleTime: 5 * 60 * 1000
    })
}

export const useGetSalesReportsSummary = (): UseQueryResult<SalesReportsSummary | null, Error> => {
    return useQuery<SalesReportsSummary | null, Error>({
        queryKey: ["salesReportsSummary"],
        queryFn: async () => {
            const response = await apiClient.get("/sales/reports-summary");
            return response.data;
        },
        staleTime: 5 * 60 * 1000
    })
}

export const useGetSupplierDashboard = (): UseQueryResult<SupplierDashboardResponse | null, Error> =>  {
    return useQuery<SupplierDashboardResponse | null, Error>({
        queryKey: ['supplierDashboard'],
        queryFn: async () => {
            const response = await apiClient.get(`/suppliers/dashboard`);
            return response.data;
        },
        staleTime: 5 * 60 * 1000
    })
}

export const useGetTaxRates = (limit: number = 100): UseQueryResult<TaxResponse[] | null, Error> => {
    return useQuery<TaxResponse[] | null, Error>({
        queryKey: ["taxRates", limit],
        queryFn: async () => {
            const response = await apiClient.get(`/taxes`);
            return response.data;
        },
        staleTime: 5 * 60 * 1000
    })
}

export const useGetDefaultTaxRate = (): UseQueryResult<DefaultTaxResponse | null, Error> => {
    return useQuery<DefaultTaxResponse | null, Error>({
        queryKey: ["defaultTaxRate"],
        queryFn: async () => {
            const response = await apiClient.get("/taxes/default");
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
        retry: false
    })
}

export const useGetBookshopUsers = (): UseQueryResult<BookshopUser[] | null, Error> => {
    return useQuery<BookshopUser[] | null, Error>({
        queryKey: ["bookshopUsers"],
        queryFn: async () => {
            const response = await apiClient.get("/users");
            return response.data;
        },
        staleTime: 5 * 60 * 1000
    })
}
