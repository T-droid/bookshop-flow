import apiClient from "@/api/api";
import { salesApi } from "@/api/salesApi";
import { NewTaxRate } from "@/schemas/taxSchema";
import { CreateSaleData } from "@/types/sales";
import { CreateSupplierInput } from "@/types/supplier";
import { CreateBookshopUserInput, ResetBookshopUserPasswordInput } from "@/types/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateTaxRate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: NewTaxRate) => {
        const response = await apiClient.post("/taxes", data);
        return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["taxRates"] });
            queryClient.invalidateQueries({ queryKey: ["defaultTaxRate"] });
            toast.success("Tax rate created successfully");
        },
        onError: (error: any) => {
            const message = error.response?.data?.detail || "Failed to create tax rate";
            toast.error(message);
        }
    });
}


export const useCreatePurchaseOrder = () => {
    return useMutation({
        mutationFn: async (data: { supplier_id: string; books: { edition_id: string; quantity_ordered: number; unit_cost: number; }[] }) => {
        const response = await apiClient.post("/purchase-orders", data);
        return response.data;
        },
        onSuccess: () => {
            toast.success("Purchase order created successfully");
        },
        onError: (error: any) => {
            const message = error.response?.data?.detail || "Failed to create purchase order";
            toast.error(message);
        }
    });
}

export const useUpdatePurchaseOrderStatus = () => {
    return useMutation({
        mutationFn: async ({ poId, status }: { poId: string; status: string }) => {
            const response = await apiClient.patch(`/purchase-orders/${poId}/status`, { new_status: status });
            return response.data;
        },
        onSuccess: (data, variables) => {
            toast.success(`Purchase order ${variables.status === 'approved' ? 'approved' : 'rejected'} successfully`);
        },
        onError: (error: any) => {
            const message = error.response?.data?.detail || "Failed to update purchase order status";
            toast.error(message);
        }
    });
}

export const useCreateSale = () => {
    return useMutation({
        mutationFn: async (data: CreateSaleData) => {
            const response = await salesApi.createSale(data)
            return response;
        },
        onSuccess: (saleId) => {
            toast.success("Sale created successfully");
        },
        onError: (error: any) => {
            const message = error.response?.data?.detail || "Failed to create sale";
            toast.error(message);
        }
    })
}

export const useCreateSupplier = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateSupplierInput) => {
            const response = await apiClient.post("/suppliers/", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["supplierDashboard"] });
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
            toast.success("Supplier created successfully");
        },
        onError: (error: any) => {
            const message = error.response?.data?.detail || "Failed to create supplier";
            toast.error(message);
        }
    });
}

export const useCreateBookshopUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateBookshopUserInput) => {
            const response = await apiClient.post("/users", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookshopUsers"] });
            toast.success("User created successfully");
        },
        onError: (error: any) => {
            const message = error.response?.data?.detail || "Failed to create user";
            toast.error(message);
        }
    });
}

export const useResetBookshopUserPassword = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ user_id, new_password }: ResetBookshopUserPasswordInput) => {
            const response = await apiClient.patch(`/users/${user_id}/reset-password`, { new_password });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookshopUsers"] });
            toast.success("Password reset successfully");
        },
        onError: (error: any) => {
            const message = error.response?.data?.detail || "Failed to reset password";
            toast.error(message);
        }
    });
}
