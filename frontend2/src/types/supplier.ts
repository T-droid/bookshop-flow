export interface Supplier {
    id: string;
    name: string;
    contact_person?: string;
    contact_info?: string;
    phone_number?: string;
    address?: string;
    status: string;
}

export interface CreateSupplierInput {
    name: string;
    contact_person: string;
    contact_info: string;
    phone_number: string;
    address?: string;
    category: string;
    payment_terms?: string;
    status: string;
}

export interface AddSupplierFormData {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    notes: string;
    category: string;
    paymentTerms: string;
    status: string;
}

export interface SupplierDashboardResponse {
    total_suppliers: number;
    total_books: number; 
    total_active_suppliers: number;
    supplier_list: Supplier[];
}
