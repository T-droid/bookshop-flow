import apiClient from "@/api/api";
import { NewTaxRate } from "@/schemas/taxSchema";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateTaxRate = () => {
    return useMutation({
        mutationFn: async (data: NewTaxRate) => {
        const response = await apiClient.post("/taxes", data);
        return response.data;
        },
        onSuccess: () => {
            toast.success("Tax rate created successfully");
        },
        onError: (error: any) => {
            const message = error.response?.data?.detail || "Failed to create tax rate";
            toast.error(message);
        }
    });
}