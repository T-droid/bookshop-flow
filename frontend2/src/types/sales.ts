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

export interface CreateSaleData {
  customer?: Customer;
  sale_items: SaleItem[];
  payment: Payment;
  total_amount: number;
  sale_status?: string;
  sale_date?: string;
}

export interface SaleResponse {
  sale_id: string;
  date: string;
  total_amount: number;
  sale_status: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  payment_method: string;
  items: number;
}

export interface CreateSaleResponse {
  sale_id: string;
}