import apiClient from './api';
import { CreateSaleResponse, SaleResponse, CreateSaleData } from '@/types/sales';

// For now, we'll use a hardcoded tenant ID until we can get it from the user context
// In a real implementation, this should come from the authenticated user's data
const TENANT_ID = '6e439a65-0e33-4181-8773-7a48df2bdfdf';
const EDITION_ID = 'e78b2c19-9c42-4e3b-a965-c78b355b0e70';
const INVENTORY_ID = 'b0f77a47-03b0-495a-ba8c-d52b48da68e6'

export const salesApi = {
  // Create a new sale
  createSale: async (saleData: CreateSaleData): Promise<CreateSaleResponse> => {
    saleData.sale_items.forEach(item => {
      item.edition_id = EDITION_ID;
      item.inventory_id = INVENTORY_ID;
    });
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
    
    const response = await apiClient.get(`/tenants/${TENANT_ID}/sales?${params.toString()}`);
    return response.data;
  },

  // Print receipt for a sale
  printReceipt: async (saleId: string): Promise<void> => {
    await apiClient.post(`/tenants/${TENANT_ID}/sales/${saleId}/receipt`);
  }
};