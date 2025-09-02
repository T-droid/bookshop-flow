// Create: /src/types/inventory.ts
export interface InventoryResponse {
  total_value: number;
  out_of_stock: number;
  low_stock: number;
  total_items: number;
  top_items: TopInventoryItem[];
}

export interface TopInventoryItem {
  title: string;
  author: string;
  isbn_number: string;
  category_name: string;
  reorder_level: number;
  cost_price: number;
  sale_price: number;
  stock: number;
  status: string;
}

export interface InventoryItem {
  id: string;
  title: string;
  isbn: string;
  author: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  costPrice: number;
  salePrice: number;
  supplier: string;
  lastRestocked: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}