export interface BookResponse {
  success: boolean;
  book: BookData | null;
  message?: string; // Optional message for success or error
}

export interface BookData {
  cost_price?: number;
  edition_id?: string;
  book_found: boolean;
  isbn_number: string;
  title?: string;
  author?: string;
  available_quantity?: number;
  sale_price?: number;
  lineDiscount?: number; // Optional line-level discount
  vatRate?: number; // Optional VAT rate
}

export interface CartItem {
  id: string;
  title: string;
  author: string;
  isbn: string;
  StockLevel: number;
  price: number;
  quantity: number; // Quantity selected in cart
  lineDiscount?: number; // Optional line-level discount
  vatRate?: number; // Optional VAT rate
}