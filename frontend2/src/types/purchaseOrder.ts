export interface BookItem {
  edition_id: string;
  cost_price: number;
  title: string;
  isbn: string;
  currentStock: number;
  quantity: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  totalAmount: number;
  totalItems: number;
  createdDate: string;
  expectedDelivery: string;
}

export interface PurchaseOrderBook {
    id: string;
    title: string;
    isbn: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}


export interface PurchaseOrderDetails {
  supplier: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  },
  books: PurchaseOrderBook[];
};

export interface CreatePurchaseOrderFormValues {
  supplier: string;
  books: BookItem[];
}