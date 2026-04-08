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

export interface SalesDashboardSummary {
  today_sales_count: number;
  today_revenue: number;
  monthly_revenue: number;
  recent_sales: SaleResponse[];
}

export interface MonthlySalesReportItem {
  month: string;
  revenue: number;
  transactions: number;
}

export interface BestSellerReportItem {
  title: string;
  isbn: string;
  units_sold: number;
  revenue: number;
}

export interface SalesReportsSummary {
  total_revenue: number;
  total_transactions: number;
  average_order_value: number;
  monthly_sales: MonthlySalesReportItem[];
  best_sellers: BestSellerReportItem[];
}

// --- KCB Buni M-Pesa STK Push Types ---

export interface STKPushRequest {
  phone_number: string;
  amount: number;
  sale_data: CreateSaleData;
}

export interface STKPushResponse {
  checkout_request_id: string;
  invoice_number: string;
  status: string;
  message: string;
}

export interface STKPushStatusResponse {
  checkout_request_id: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  message?: string;
  sale_id?: string;
}
