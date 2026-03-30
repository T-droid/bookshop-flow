import apiClient from './api';
import { CreateSaleResponse, SaleResponse, CreateSaleData } from '@/types/sales';

export const salesApi = {
  // Create a new sale
  createSale: async (saleData: CreateSaleData): Promise<CreateSaleResponse> => {
    const response = await apiClient.post(`/sales`, saleData);
    return response.data;
  },

  // Get a specific sale by ID
  getSale: async (saleId: string): Promise<SaleResponse> => {
    const response = await apiClient.get(`/sales/${saleId}`);
    return response.data;
  },

  // List sales with optional filters
  listSales: async (filters?: {
    date_from?: string;
    date_to?: string;
    cashier?: string;
    payment?: string;
    status?: string;
  }): Promise<SaleResponse[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    
    const response = await apiClient.get(`/sales?${params.toString()}`);
    return response.data;
  },

  // Print receipt for a sale
  printReceipt: async (saleId: string): Promise<void> => {
    await apiClient.post(`/sales/${saleId}/receipt`);
  }
};
