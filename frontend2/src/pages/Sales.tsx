import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Receipt, 
  Scan, 
  DollarSign, 
  CreditCard, 
  Smartphone, 
  Clock, 
  User, 
  Settings, 
  Pause, 
  Play,
  X,
  Minus,
  Search,
  AlertTriangle,
  CheckCircle,
  QrCode,
  Camera,
  Wifi,
  WifiOff,
  Banknote,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import debounce from 'lodash.debounce';
import { useCheckBookAvailability } from '@/hooks/useCheckAvailability';
import { FieldError, set, useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { BookData, BookResponse, CartItem } from '@/types/books';
import { ErrorMessage, SuccessMessage } from '@/components/ValidationInputError';
import { salesApi } from '@/api/salesApi';
import { SalesRequestBody, Customer, Payment, SaleItem } from '@/types/sales';
import { toast } from 'sonner';



interface PaymentMethod {
  type: 'cash' | 'card' | 'mpesa';
  amount: number;
  reference?: string;
  status?: 'pending' | 'completed' | 'failed';
}

interface QRPaymentStatus {
  isGenerating: boolean;
  qrCode: string | null;
  status: 'idle' | 'generating' | 'pending' | 'success' | 'failed' | 'expired';
  countdown: number;
  amount: number;
}

export default function Sales() {
  // State management
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isbnInput, setIsbnInput] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [shiftOpen, setShiftOpen] = useState(true);
  const [cashierName] = useState('John Cashier');
  const [activePaymentTab, setActivePaymentTab] = useState('cash');
  const [cashReceived, setCashReceived] = useState(0);
  const [cartDiscount, setCartDiscount] = useState(0);
  const [cartNotes, setCartNotes] = useState('');
  const [heldSales, setHeldSales] = useState<any[]>([]);
  const [showHeldSales, setShowHeldSales] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [qrPaymentStatus, setQrPaymentStatus] = useState<'idle' | 'generating' | 'ready' | 'processing'>('idle');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [qrPayment, setQrPayment] = useState<QRPaymentStatus>({
    isGenerating: false,
    qrCode: null,
    status: 'idle',
    countdown: 0,
    amount: 0
  });
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const isbnInputRef = useRef<HTMLInputElement>(null);

  // Mock data for available books
  // const [availableBooks] = useState([
  //   {
  //     isbn: '9780743273565',
  //     title: 'The Great Gatsby',
  //     author: 'F. Scott Fitzgerald',
  //     unitPrice: 1200,
  //     stockLevel: 15,
  //     vatRate: 16
  //   },
  //   {
  //     isbn: '9780061120084',
  //     title: 'To Kill a Mockingbird',
  //     author: 'Harper Lee',
  //     unitPrice: 1500,
  //     stockLevel: 3,
  //     vatRate: 16
  //   },
  //   {
  //     isbn: '9780452284234',
  //     title: '1984',
  //     author: 'George Orwell',
  //     unitPrice: 1350,
  //     stockLevel: 0,
  //     vatRate: 16
  //   },
  //   {
  //     isbn: '9780134685991',
  //     title: 'Effective Java',
  //     author: 'Joshua Bloch',
  //     unitPrice: 4500,
  //     stockLevel: 8,
  //     vatRate: 16
  //   }
  // ]);
  const [availableBook, setAvailableBook] = useState<BookData | null>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-focus ISBN input
  useEffect(() => {
    if (isbnInputRef.current) {
      isbnInputRef.current.focus();
    }
  }, []);

  // QR Payment countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (qrPayment.status === 'pending' && qrPayment.countdown > 0) {
      interval = setInterval(() => {
        setQrPayment(prev => ({
          ...prev,
          countdown: prev.countdown - 1
        }));
      }, 1000);
    } else if (qrPayment.countdown === 0 && qrPayment.status === 'pending') {
      setQrPayment(prev => ({ ...prev, status: 'expired' }));
    }
    return () => clearInterval(interval);
  }, [qrPayment.status, qrPayment.countdown]);

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => {
    const lineTotal = item.quantity * item.price;
    const discountedTotal = lineTotal - item.lineDiscount;
    return sum + discountedTotal;
  }, 0);

  const discountedSubtotal = subtotal - cartDiscount;
  const taxAmount = cartItems.reduce((sum, item) => {
    const lineTotal = (item.quantity * item.price) - item.lineDiscount;
    return sum + (lineTotal * item.vatRate) / (100 + item.vatRate);
  }, 0);
  const grandTotal = discountedSubtotal;
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const changeDue = Math.max(0, cashReceived - grandTotal);
  const remainingBalance = Math.max(0, grandTotal - totalPaid);

  // Additional calculations for POS interface
  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const cartVAT = cartItems.reduce((sum, item) => {
    const lineTotal = item.quantity * item.price;
    return sum + (lineTotal * item.vatRate) / 100;
  }, 0);
  const cartTotal = cartSubtotal + cartVAT - cartDiscount;

  // Mock books data for search
  // const mockBooks = availableBooks.map(book => ({
  //   id: book.isbn,
  //   isbn: book.isbn,
  //   title: book.title,
  //   author: book.author,
  //   price: book.unitPrice,
  //   stockLevel: book.stockLevel
  // }));

  // Functions
  // const findBookByISBN = (isbn: string) => {
  //   return availableBooks.find(book => book.isbn === isbn);
  // };

  const addItemByISBN = () => {
    if (!availableBook || !availableBook.book_found) return;

    // Check if book is already in cart
    const existingItem = cartItems.find(item => item.isbn === availableBook.isbn_number);

    if (existingItem) {
      // Check if we can add more (don't exceed available quantity)
      if (existingItem.quantity < availableBook.available_quantity) {
        updateQuantity(existingItem.id, existingItem.quantity + 1);
      } else {
        // Show error - insufficient stock
        setError('isbn', { 
          type: 'manual', 
          message: `Cannot add more - only ${availableBook.available_quantity} in stock` 
        });
        return;
      }
    } else {
      // Add new item to cart
      const newItem: CartItem = {
        id: Math.random().toString(36).substring(2),
        title: availableBook.title,
        author: availableBook.author,
        isbn: availableBook.isbn_number,
        StockLevel: availableBook.available_quantity,
        price: availableBook.sale_price,
        quantity: 1,
        lineDiscount: 0,
        vatRate: 16 // Default VAT rate
      };
      setCartItems([...cartItems, newItem]);
    }
    
    // Clear the form and reset validation
    setValue('isbn', '');
    clearErrors('isbn');
    setAvailableBook(null);
    
    // Focus back to input for next scan
    if (isbnInputRef.current) {
      isbnInputRef.current.focus();
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    setCartItems(items => 
      items.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const holdSale = () => {
    if (cartItems.length === 0) return;
    
    const heldSale = {
      id: Date.now().toString(),
      items: [...cartItems],
      discount: cartDiscount,
      notes: cartNotes,
      timestamp: new Date().toLocaleString()
    };
    setHeldSales([...heldSales, heldSale]);
    clearCart();
  };

  const resumeSale = (heldSale: any) => {
    setCartItems(heldSale.items);
    setCartDiscount(heldSale.discount);
    setCartNotes(heldSale.notes);
    setHeldSales(heldSales.filter(sale => sale.id !== heldSale.id));
    setShowHeldSales(false);
  };

  const clearCart = () => {
    setCartItems([]);
    setCartDiscount(0);
    setCartNotes('');
    setPayments([]);
    setCashReceived(0);
    setQrPayment({
      isGenerating: false,
      qrCode: null,
      status: 'idle',
      countdown: 0,
      amount: 0
    });
  };

  const processCashPayment = async () => {
    if (cashReceived >= cartTotal && cartItems.length > 0) {
      setIsProcessingSale(true);
      
      try {
        // Transform cart items to sale items format
        const saleItems: SaleItem[] = cartItems.map(item => ({
          // For now using placeholder IDs - in production these should come from the book API
          edition_id: `edition-${item.id}`,
          inventory_id: `inventory-${item.id}`,
          isbn: item.isbn,
          title: item.title,
          author: item.author,
          quantity_sold: item.quantity,
          price_per_unit: item.price,
          total_price: item.price * item.quantity,
          tax_amount: (item.price * item.quantity * (item.vatRate || 16)) / 100,
          discount_amount: item.lineDiscount || 0
        }));

        // Prepare customer data
        const customer: Customer | undefined = customerInfo.name ? {
          customer_name: customerInfo.name,
          customer_email: customerInfo.email || undefined,
          customer_phone: customerInfo.phone || undefined
        } : undefined;

        // Prepare payment data
        const payment: Payment = {
          payment_method: 'cash',
          amount_received: cashReceived,
          change_given: Math.max(0, cashReceived - cartTotal)
        };

        // Prepare sale data
        const saleData: SalesRequestBody = {
          customer,
          sale_items: saleItems,
          payment,
          total_amount: cartTotal,
          sale_status: 'completed'
        };

        // Create the sale via API
        const result = await salesApi.createSale(saleData);
        
        toast.success(`Sale completed successfully! Sale ID: ${result.sale_id}`);
        console.log('Sale created:', result);
        
        // Clear the cart after successful sale
        clearCart();
        setCashReceived(0);
        
      } catch (error) {
        console.error('Error processing sale:', error);
        toast.error('Failed to process sale. Please try again.');
      } finally {
        setIsProcessingSale(false);
      }
    }
  };

  const generateMpesaQR = async () => {
    if (cartItems.length === 0 || !mpesaPhone) return;
    
    setQrPaymentStatus('generating');
    
    // Simulate QR generation for 2 seconds, then allow payment processing
    setTimeout(() => {
      setQrPaymentStatus('ready');
    }, 2000);
  };

  const processMpesaPayment = async () => {
    if (cartItems.length === 0) return;
    
    setIsProcessingSale(true);
    setQrPaymentStatus('processing');
    
    try {
      // Transform cart items to sale items format
      const saleItems: SaleItem[] = cartItems.map(item => ({
        edition_id: `edition-${item.id}`,
        inventory_id: `inventory-${item.id}`,
        isbn: item.isbn,
        title: item.title,
        author: item.author,
        quantity_sold: item.quantity,
        price_per_unit: item.price,
        total_price: item.price * item.quantity,
        tax_amount: (item.price * item.quantity * (item.vatRate || 16)) / 100,
        discount_amount: item.lineDiscount || 0
      }));

      // Prepare customer data
      const customer: Customer | undefined = customerInfo.name ? {
        customer_name: customerInfo.name,
        customer_email: customerInfo.email || undefined,
        customer_phone: customerInfo.phone || mpesaPhone
      } : {
        customer_name: 'M-Pesa Customer',
        customer_phone: mpesaPhone
      };

      // Prepare payment data
      const payment: Payment = {
        payment_method: 'mpesa',
        amount_received: cartTotal,
        change_given: 0
      };

      // Prepare sale data
      const saleData: SalesRequestBody = {
        customer,
        sale_items: saleItems,
        payment,
        total_amount: cartTotal,
        sale_status: 'completed'
      };

      // Create the sale via API
      const result = await salesApi.createSale(saleData);
      
      toast.success(`M-Pesa payment completed! Sale ID: ${result.sale_id}`);
      console.log('M-Pesa sale created:', result);
      
      // Clear the cart after successful sale
      clearCart();
      setMpesaPhone('');
      setQrPaymentStatus('idle');
      
    } catch (error) {
      console.error('Error processing M-Pesa sale:', error);
      toast.error('Failed to process M-Pesa payment. Please try again.');
      setQrPaymentStatus('ready');
    } finally {
      setIsProcessingSale(false);
    }
  };

  const processCardPayment = async () => {
    if (cartItems.length === 0) return;
    
    setIsProcessingSale(true);
    
    try {
      // Transform cart items to sale items format
      const saleItems: SaleItem[] = cartItems.map(item => ({
        edition_id: `edition-${item.id}`,
        inventory_id: `inventory-${item.id}`,
        isbn: item.isbn,
        title: item.title,
        author: item.author,
        quantity_sold: item.quantity,
        price_per_unit: item.price,
        total_price: item.price * item.quantity,
        tax_amount: (item.price * item.quantity * (item.vatRate || 16)) / 100,
        discount_amount: item.lineDiscount || 0
      }));

      // Prepare customer data
      const customer: Customer | undefined = customerInfo.name ? {
        customer_name: customerInfo.name,
        customer_email: customerInfo.email || undefined,
        customer_phone: customerInfo.phone || undefined
      } : undefined;

      // Prepare payment data
      const payment: Payment = {
        payment_method: 'card',
        amount_received: cartTotal,
        change_given: 0
      };

      // Prepare sale data
      const saleData: SalesRequestBody = {
        customer,
        sale_items: saleItems,
        payment,
        total_amount: cartTotal,
        sale_status: 'completed'
      };

      // Create the sale via API
      const result = await salesApi.createSale(saleData);
      
      toast.success(`Card payment completed! Sale ID: ${result.sale_id}`);
      console.log('Card sale created:', result);
      
      // Clear the cart after successful sale
      clearCart();
      
    } catch (error) {
      console.error('Error processing card sale:', error);
      toast.error('Failed to process card payment. Please try again.');
    } finally {
      setIsProcessingSale(false);
    }
  };

  const deleteSale = (saleId: string) => {
    setHeldSales(heldSales.filter(sale => sale.id !== saleId));
  };

  // const simulateQRPayment = () => {
  //   // Simulate successful payment after 3 seconds
  //   setTimeout(() => {
  //     setQrPayment(prev => ({ ...prev, status: 'success' }));
  //     setPayments(prev => [...prev, {
  //       type: 'mpesa',
  //       amount: qrPayment.amount,
  //       reference: `MP${Date.now()}`,
  //       status: 'completed'
  //     }]);
  //   }, 3000);
  // };

  // const completeSale = () => {
  //   if (remainingBalance > 0) return;
    
  //   // Simulate sale completion
  //   console.log('Sale completed:', {
  //     items: cartItems,
  //     total: grandTotal,
  //     payments: payments,
  //     timestamp: new Date()
  //   });
    
  //   // Show receipt and clear cart
  //   alert('Sale completed successfully! Receipt generated.');
  //   clearCart();
  // };

  const { register, handleSubmit, setValue, setError, clearErrors, watch, formState: { errors } } = useForm()

  const isbnValue = watch('isbn');

  const [triggerBookCheck, setTriggerBookCheck] = useState(false);

  const { data: bookData } = useCheckBookAvailability(isbnValue, triggerBookCheck);


  // Update the useEffect for ISBN validation and book checking
  useEffect(() => {
    const debounced = debounce(() => {
      if (isbnValue && isbnValue.length >= 10) {
        // Clear any existing errors when we start checking
        clearErrors('isbn');
        const existingItem = cartItems.find(item => item.isbn === isbnValue);
        if (existingItem) {
          setAvailableBook({ ...existingItem, book_found: true, available_quantity: existingItem.StockLevel, isbn_number: existingItem.isbn });
        }
        setTriggerBookCheck(true);
      } else if (isbnValue && isbnValue.length < 10) {
        // Set validation error for short ISBN
        setError('isbn', { 
          type: 'manual', 
          message: 'ISBN must be at least 10 characters' 
        });
        setTriggerBookCheck(false);
      } else {
        // Clear errors when input is empty
        clearErrors('isbn');
        setTriggerBookCheck(false);
      }
    }, 300);

    debounced();
    
    return () => {
      debounced.cancel();
    };
  }, [isbnValue, setError, clearErrors]);

  // Update the useEffect for handling book data response
  useEffect(() => {
    if (bookData && triggerBookCheck) {
      setTriggerBookCheck(false);
      
      if (bookData.success && bookData.book.book_found) {
        // Book found - clear any errors and add to cart
        clearErrors('isbn');
        setAvailableBook(bookData.book);
        addItemByISBN();
      } else if (bookData.success && !bookData.book.book_found) {
        // Book not found - show appropriate error
        setError('isbn', { 
          type: 'manual', 
          message: 'Book not found - search catalog?' 
        });
      } else if (!bookData.success) {
        console.log(bookData);
        // API error - show server error
        setError('isbn', { 
          type: 'manual', 
          message: 'Server error - please try again' 
        });
      }
    }
  }, [bookData, clearErrors, setError, triggerBookCheck]);

  const getStockBadge = (stockLevel: number, quantity: number) => {
    if (stockLevel === 0) {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Out of Stock</Badge>;
    } else if (stockLevel < quantity) {
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Insufficient Stock</Badge>;
    } else if (stockLevel <= 5) {
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Low Stock</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">In Stock</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-page">
        {/* Top Bar */}
        <div className="bg-card border-b border-border shadow-card-soft px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Shop Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">Cozy Corner Books</h1>
                  <p className="text-sm text-muted-foreground">Point of Sale System</p>
                </div>
              </div>
              
              <Separator orientation="vertical" className="h-8" />
              
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{cashierName}</span>
                <Badge variant={shiftOpen ? "outline" : "secondary"} className="text-xs">
                  {shiftOpen ? 'Shift Open' : 'Shift Closed'}
                </Badge>
              </div>
            </div>

            {/* Center: Date/Time */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{currentDateTime.toLocaleDateString()}</span>
              <span>{currentDateTime.toLocaleTimeString()}</span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 mr-3">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-600" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-600" />
                )}
                <span className="text-xs text-muted-foreground">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              
              <Button variant="outline" size="sm" onClick={() => setShowHeldSales(true)}>
                <Pause className="w-4 h-4 mr-1" />
                Held Sales ({heldSales.length})
              </Button>
              
              <Button variant="outline" size="sm">
                <Receipt className="w-4 h-4 mr-1" />
                Reprint
              </Button>
              
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            
            {/* Left Panel: Item Entry & Cart */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* ISBN Entry */}
              <Card className="shadow-card-soft border border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Scan className="w-5 h-5" />
                    ISBN Entry & Scanning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        ref={isbnInputRef}
                        {...register('isbn')}
                        type="text"
                        placeholder="Enter ISBN or scan barcode..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit(addItemByISBN)}
                        className="text-lg"
                      />
                    </div>
                    <Button 
                      variant="accent" 
                      onClick={handleSubmit(addItemByISBN)}
                      disabled={!isbnValue}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setValue('isbn', '')}
                    >
                      Clear
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowScanner(true)}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowSearch(true)}
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                  {errors.isbn && (
                    <ErrorMessage message={errors.isbn.message as FieldError} />
                  )}
                  {!errors.isbn && availableBook?.book_found && (
                    <SuccessMessage message={`Book found: ${availableBook.title}`}>
                      {getStockBadge(availableBook.available_quantity, 1)}
                    </SuccessMessage>
                  )}
                  
                  {/* {isbnInput && (
                    <div className="mt-3">
                      {findBookByISBN(isbnInput) ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-700">Book found: {findBookByISBN(isbnInput)?.title}</span>
                          {getStockBadge(findBookByISBN(isbnInput)?.stockLevel || 0, 1)}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span className="text-sm text-amber-700">Book not found - search catalog?</span>
                        </div>
                      )}
                    </div>
                  )} */}
                </CardContent>
              </Card>

              {/* Cart Items */}
              <Card className="shadow-card-soft border border-border flex-1">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Cart ({cartItems.length} items)
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={holdSale}
                        disabled={cartItems.length === 0}
                      >
                        <Pause className="w-4 h-4 mr-1" />
                        Hold Sale
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={clearCart}
                        disabled={cartItems.length === 0}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Clear
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg mb-2">Cart is empty</p>
                      <p className="text-sm">Scan or enter ISBN to add items</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.author}</p>
                            <p className="text-xs text-muted-foreground font-mono">{item.isbn}</p>
                            {getStockBadge(item.StockLevel, item.quantity)}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.StockLevel}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">@ Ksh {item.price.toLocaleString()}</p>
                            <p className="font-semibold text-foreground">
                              Ksh {(item.quantity * item.price).toLocaleString()}
                            </p>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                      
                      {/* Cart Notes */}
                      <div className="pt-4 border-t">
                        <Label className="text-sm font-medium text-foreground">Order Notes</Label>
                        <Input
                          placeholder="Add notes to this sale..."
                          value={cartNotes}
                          onChange={(e) => setCartNotes(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Panel: Payment & Summary */}
            <div className="space-y-6">
              
              {/* Order Summary */}
              <Card className="shadow-card-soft border border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)}):</span>
                      <span className="text-foreground">Ksh {cartSubtotal.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount:</span>
                      <span className="text-green-600">-Ksh {cartDiscount.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">VAT (16%):</span>
                      <span className="text-foreground">Ksh {cartVAT.toLocaleString()}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-foreground">Total:</span>
                      <span className="text-foreground">Ksh {cartTotal.toLocaleString()}</span>
                    </div>
                    
                    {customerInfo.name && (
                      <div className="mt-4 p-3 bg-muted/30 rounded-lg border">
                        <p className="text-sm font-medium text-foreground">{customerInfo.name}</p>
                        {customerInfo.phone && (
                          <p className="text-xs text-muted-foreground">{customerInfo.phone}</p>
                        )}
                        {customerInfo.email && (
                          <p className="text-xs text-muted-foreground">{customerInfo.email}</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card className="shadow-card-soft border border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="cash" className="flex items-center gap-1">
                        <Banknote className="w-4 h-4" />
                        Cash
                      </TabsTrigger>
                      <TabsTrigger value="mpesa" className="flex items-center gap-1">
                        <Smartphone className="w-4 h-4" />
                        M-Pesa
                      </TabsTrigger>
                      <TabsTrigger value="card" className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        Card
                      </TabsTrigger>
                    </TabsList>

                    {/* Cash Payment */}
                    <TabsContent value="cash" className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-foreground">Amount Received</Label>
                        <Input
                          type="number"
                          placeholder="Enter amount received..."
                          value={cashReceived}
                          onChange={(e) => setCashReceived(Number(e.target.value))}
                          className="mt-1 text-lg"
                        />
                        {cashReceived > 0 && (
                          <div className="mt-2 p-2 bg-muted/30 rounded border">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Change:</span>
                              <span className={`font-medium ${cashReceived >= cartTotal ? 'text-green-600' : 'text-red-600'}`}>
                                Ksh {Math.max(0, cashReceived - cartTotal).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="premium" 
                        className="w-full" 
                        size="lg"
                        onClick={processCashPayment}
                        disabled={cartItems.length === 0 || cashReceived < cartTotal || isProcessingSale}
                      >
                        {isProcessingSale ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing Sale...
                          </>
                        ) : (
                          <>
                            <Receipt className="w-4 h-4 mr-2" />
                            Complete Cash Sale
                          </>
                        )}
                      </Button>
                    </TabsContent>

                    {/* M-Pesa Payment */}
                    <TabsContent value="mpesa" className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-foreground">Customer Phone Number</Label>
                        <Input
                          type="tel"
                          placeholder="254XXXXXXXXX"
                          value={mpesaPhone}
                          onChange={(e) => setMpesaPhone(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      {qrPaymentStatus === 'idle' && (
                        <Button 
                          variant="accent" 
                          className="w-full" 
                          size="lg"
                          onClick={generateMpesaQR}
                          disabled={cartItems.length === 0 || !mpesaPhone}
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          Generate M-Pesa QR Code
                        </Button>
                      )}
                      
                      {qrPaymentStatus === 'generating' && (
                        <div className="text-center py-4">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-accent" />
                          <p className="text-sm text-muted-foreground">Generating QR Code...</p>
                        </div>
                      )}
                      
                      {qrPaymentStatus === 'ready' && (
                        <div className="text-center space-y-4">
                          <div className="bg-white p-4 rounded-lg border-2 border-accent inline-block">
                            <QrCode className="w-32 h-32 text-foreground mx-auto" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">Scan QR Code to Pay</p>
                            <p className="text-xs text-muted-foreground">Customer should scan with M-Pesa app</p>
                            <p className="text-lg font-bold text-accent">Ksh {cartTotal.toLocaleString()}</p>
                          </div>
                          <div className="space-y-2">
                            <Button 
                              variant="accent" 
                              className="w-full"
                              onClick={processMpesaPayment}
                              disabled={isProcessingSale}
                            >
                              {isProcessingSale ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Processing Payment...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Complete M-Pesa Payment
                                </>
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setQrPaymentStatus('idle')}
                              disabled={isProcessingSale}
                            >
                              Cancel QR Payment
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {qrPaymentStatus === 'processing' && (
                        <div className="text-center py-4">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-accent" />
                          <p className="text-sm text-muted-foreground">Processing payment...</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => setQrPaymentStatus('idle')}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </TabsContent>

                    {/* Card Payment */}
                    <TabsContent value="card" className="space-y-4">
                      <div className="text-center py-8 text-muted-foreground">
                        <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-sm">Insert or swipe card</p>
                        <p className="text-xs">Follow prompts on card reader</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        size="lg"
                        onClick={processCardPayment}
                        disabled={cartItems.length === 0 || isProcessingSale}
                      >
                        {isProcessingSale ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing Payment...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Process Card Payment
                          </>
                        )}
                      </Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Customer Info */}
              <Card className="shadow-card-soft border border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-foreground">Name (Optional)</Label>
                    <Input
                      placeholder="Customer name..."
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-foreground">Phone (Optional)</Label>
                    <Input
                      placeholder="Customer phone..."
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-foreground">Email (Optional)</Label>
                    <Input
                      placeholder="Customer email..."
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Search Modal */}
        {/* <Dialog open={showSearch} onOpenChange={setShowSearch}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Search Books</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Search by title, author, or ISBN..."
                className="text-lg"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {mockBooks.map(book => (
                  <div key={book.id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <h4 className="font-medium">{book.title}</h4>
                    <p className="text-sm text-muted-foreground">{book.author}</p>
                    <p className="text-xs text-muted-foreground font-mono">{book.isbn}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm font-medium">Ksh {book.price.toLocaleString()}</span>
                      {getStockBadge(book.stockLevel, 1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog> */}

        {/* Scanner Modal */}
        <Dialog open={showScanner} onOpenChange={setShowScanner}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Barcode Scanner</DialogTitle>
            </DialogHeader>
            <div className="text-center py-8">
              <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Scanner would be initialized here</p>
              <p className="text-sm text-muted-foreground mt-2">
                In a real implementation, this would access the device camera
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Held Sales Modal */}
        <Dialog open={showHeldSales} onOpenChange={setShowHeldSales}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Held Sales</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {heldSales.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Pause className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No held sales</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {heldSales.map(sale => (
                    <div key={sale.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{sale.items.length} items</p>
                          <p className="text-sm text-muted-foreground">{sale.timestamp.toLocaleString()}</p>
                        </div>
                        <p className="text-lg font-bold">Ksh {sale.total.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => resumeSale(sale.id)}>
                          Resume
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteSale(sale.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};