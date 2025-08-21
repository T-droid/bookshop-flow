// Types for sales API matching backend models

export interface Customer {
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
}

export interface Payment {
  payment_method: string;
  amount_received: number;
  change_given: number;
}

export interface SaleItem {
  edition_id: string;
  inventory_id: string;
  isbn: string;
  title: string;
  author?: string;
  quantity_sold: number;
  price_per_unit: number;
  total_price: number;
  tax_amount?: number;
  discount_amount?: number;
}

export interface SalesRequestBody {
  customer?: Customer;
  sale_items: SaleItem[];
  payment: Payment;
  total_amount: number;
  sale_status?: string;
  sale_date?: string;
}

export interface SaleResponse {
  sale_id: string;
  tenant_id: string;
  customer?: Customer;
  sale_items: SaleItem[];
  subtotal: number;
  total: number;
  tax?: number;
  discount?: number;
  sale_date: string;
  payment_method: string;
  status: string;
}

export interface CreateSaleResponse {
  sale_id: string;
}