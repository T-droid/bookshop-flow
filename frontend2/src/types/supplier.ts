export interface Supplier {
    name: string;
    contact_person?: string;
    contact_info?: string;
    phone_number?: string;
    address?: string;
    id: string;
    status: string;
}

export interface SupplierDashboardResponse {
    total_suppliers: number;
    total_books: number; 
    total_active_suppliers: number;
    supplier_list: Supplier[];
}