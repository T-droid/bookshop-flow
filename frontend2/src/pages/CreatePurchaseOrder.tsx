import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, Package, Receipt, DollarSign, Eye, Search, Filter, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PurchaseOrderDetails from '@/components/PurchaseOrderDetails';
import { useCheckBookAvailability } from '@/hooks/useCheckAvailability';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import debounce from 'lodash.debounce';
import { BookData } from '@/types/books';
import { ErrorMessage } from '@/components/ValidationInputError';
import { useGetSuppliers } from '@/hooks/useGetResources';

interface BookItem {
  edition_id: string;
  cost_price: number;
  title: string;
  isbn: string;
  currentStock: number;
  quantity: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  totalAmount: number;
  totalItems: number;
  createdDate: string;
  expectedDelivery: string;
}

interface CreatePurchaseOrderFormValues {
  supplier: string;
  books: BookItem[];
}

const CreatePurchaseOrder = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [selectedPO, setSelectedPO] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bookCheckISBN, setBookCheckISBN] = useState('');
  const [triggerBookCheck, setTriggerBookCheck] = useState(false);
  const [currentCheckIndex, setCurrentCheckIndex] = useState<number | null>(null);

  // Create PO state
  // const [supplier, setSupplier] = useState('');
  // const [books, setBooks] = useState<BookItem[]>([
  //   { id: "", title: '', isbn: '', currentStock: 0, quantity: 0 }
  // ]);

  // Mock existing purchase orders
  const [purchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: '1',
      poNumber: 'A00001',
      supplier: 'Penguin Random House',
      status: 'Pending',
      totalAmount: 30300,
      totalItems: 23,
      createdDate: 'Aug 17, 2025',
      expectedDelivery: 'Aug 25, 2025'
    },
    {
      id: '2',
      poNumber: 'A00002',
      supplier: 'HarperCollins Publishers',
      status: 'Approved',
      totalAmount: 45600,
      totalItems: 35,
      createdDate: 'Aug 15, 2025',
      expectedDelivery: 'Aug 23, 2025'
    },
    {
      id: '3',
      poNumber: 'A00003',
      supplier: 'Macmillan Publishers',
      status: 'Rejected',
      totalAmount: 28900,
      totalItems: 18,
      createdDate: 'Aug 14, 2025',
      expectedDelivery: 'Aug 22, 2025'
    },
    {
      id: '4',
      poNumber: 'A00004',
      supplier: 'Scholastic Inc.',
      status: 'Pending',
      totalAmount: 52100,
      totalItems: 42,
      createdDate: 'Aug 16, 2025',
      expectedDelivery: 'Aug 24, 2025'
    }
  ]);

  // const addBook = () => {
  //   setBooks([...books, { id: books.length + 1, title: '', isbn: '', currentStock: 0, quantity: 1 }]);
  // };

  // const removeBook = (id: number) => {
  //   setBooks(books.filter(book => book.id !== id));
  // };

  // const updateBook = (id: number, field: keyof BookItem, value: string | number) => {
  //   setBooks(books.map(book => 
  //     book.id === id ? { ...book, [field]: value } : book
  //   ));
  // };

  const { data: suppliersData, isLoading: loadingSuppliers, error: suppliersError } = useGetSuppliers();

  // Handle supplier selection with actual supplier data
  const getSelectedSupplierName = () => {
    const selectedSupplierId = watch('supplier');
    if (!selectedSupplierId || !suppliersData) return '';
    
    const supplier = suppliersData.find((s: any) => s.id === selectedSupplierId);
    return supplier ? supplier.name : '';
  };

  const { register, handleSubmit, control, setValue, setError, clearErrors, watch, formState: { errors } } = useForm<CreatePurchaseOrderFormValues>({
    defaultValues: {
      supplier: '',
      books: [{ edition_id: '', cost_price: 0, title: '', isbn: '', currentStock: 0, quantity: 1 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'books'
  });

  const books = watch('books');
  const supplier = watch('supplier');

  const { data: bookData } = useCheckBookAvailability(bookCheckISBN, triggerBookCheck);

  useEffect(() => {
    if (bookData && currentCheckIndex !== null && triggerBookCheck) {
      if (bookData.book?.book_found) {
        setValue(`books.${currentCheckIndex}.title` as const, bookData.book.title);
        setValue(`books.${currentCheckIndex}.currentStock` as const, bookData.book.available_quantity);
        setValue(`books.${currentCheckIndex}.edition_id` as const, bookData.book.edition_id);
        setValue(`books.${currentCheckIndex}.cost_price` as const, Number(bookData.book.cost_price));
        clearErrors(`books.${currentCheckIndex}.isbn` as const);
      } else {
        setError(`books.${currentCheckIndex}.isbn` as const, { 
          type: 'manual', 
          message: 'Book not found' 
        });
      }
      // Reset the check state
      setTriggerBookCheck(false);
      setCurrentCheckIndex(null);
      setBookCheckISBN('');
    }
  }, [bookData, currentCheckIndex, triggerBookCheck, setValue, setError, clearErrors]);

    const checkAvailability = useCallback((isbn: string, index: number) => {
    if (isbn.trim()) {
      setBookCheckISBN(isbn.trim());
      setCurrentCheckIndex(index);
      setTriggerBookCheck(true);
    }
  }, []);

  // Updated debounced check
  const debouncedCheck = useCallback(
    (index: number) =>
      debounce((e: React.ChangeEvent<HTMLInputElement>) => {
        const isbn = e.target.value.trim();
        if (isbn) {
          checkAvailability(isbn, index);
        }
      }, 300),
    [checkAvailability]
  );  


  const totalQuantity = watch('books').reduce((sum, book) => sum + Number(book.quantity), 0);
  const estimatedCost = watch('books').reduce((sum, book) => sum + Number(book.quantity) * (book.cost_price || 0), 0);

  // Update form submission to include supplier name
  const handlePurchaseOrderSubmit = handleSubmit((data) => {
    const selectedSupplier = suppliersData?.find((s: any) => s.id === data.supplier);
    
    const formattedData = {
      ...data,
      supplierName: selectedSupplier?.name || '',
      supplierContact: selectedSupplier?.contact || '',
      // Add other supplier details as needed
    };
    
    console.log('Submitted PO:', formattedData);
    setActiveTab('list');
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
      case 'Approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'Cancelled':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = order.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (selectedPO) {
    return (
      <AppLayout>
        <div className="container mx-auto px-6 py-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedPO(null)}
              className="mb-4"
            >
              ← Back to Purchase Orders
            </Button>
          </div>
          <PurchaseOrderDetails 
            poNumber={selectedPO} 
            onClose={() => setSelectedPO(null)} 
          />
        </div>
      </AppLayout>
    );
  }

  // Add this near the top of your component, after the hook calls
  if (suppliersError) {
    return (
      <AppLayout>
        <div className="container mx-auto px-6 py-8">
          <Card className="shadow-card-soft border border-border">
            <CardContent className="p-6 text-center">
              <div className="text-destructive mb-4">
                Failed to load suppliers. Please check your connection and try again.
              </div>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Receipt className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
              <p className="text-muted-foreground">Create new orders and manage existing purchase orders</p>
            </div>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="create" className="gap-2">
              <Plus className="w-4 h-4" />
              Create Order
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <FileText className="w-4 h-4" />
              View Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-8">
            {/* Create Purchase Order Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Supplier Selection */}
              <Card className="shadow-card-soft border border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">Supplier Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="supplier" className="text-sm font-medium text-foreground">
                      Select Supplier <span className="text-accent">*</span>
                    </Label>
                    <Controller
                      name="supplier"
                      control={control}
                      rules={{ required: 'Supplier is required' }}
                      render={({ field }) => (
                        <>
                          {suppliersError ? (
                            <div className="w-full p-3 border border-destructive rounded-md bg-destructive/5 text-destructive text-sm flex items-center justify-between">
                              <span>Error loading suppliers. Please try again.</span>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => window.location.reload()}
                                className="ml-2"
                              >
                                Retry
                              </Button>
                            </div>
                          ) : (
                            <Select onValueChange={field.onChange} value={field.value} disabled={loadingSuppliers}>
                              <SelectTrigger className={`w-full ${errors.supplier ? 'border-destructive' : ''}`}>
                                <SelectValue placeholder={
                                  loadingSuppliers 
                                    ? "Loading suppliers..." 
                                    : "Select a supplier"
                                } />
                              </SelectTrigger>
                              <SelectContent>
                                {loadingSuppliers ? (
                                  <div className="px-2 py-1 text-sm text-muted-foreground flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                    Loading suppliers...
                                  </div>
                                ) : suppliersData && suppliersData.length > 0 ? (
                                  suppliersData.map((supplier: any) => (
                                    <SelectItem key={supplier.id} value={supplier.id}>
                                      {supplier.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="px-2 py-1 text-sm text-muted-foreground">
                                    No suppliers available
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
                          )}
                        </>
                      )}
                    />
                    {errors.supplier && (
                      <ErrorMessage message={errors.supplier.message || ''} />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Books Table */}
              <Card className="shadow-card-soft border border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-foreground">Order Items</CardTitle>
                    <Badge variant="outline" className="text-sm">
                      {books.length} item{books.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden rounded-md border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold text-foreground">Book Title</TableHead>
                          <TableHead className="font-semibold text-foreground">ISBN</TableHead>
                          <TableHead className="font-semibold text-foreground">Current Stock</TableHead>
                          <TableHead className="font-semibold text-foreground">Quantity to Order</TableHead>
                          <TableHead className="font-semibold text-foreground w-16">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {fields.map((book, index) => {
                            const debouncedCheckHandler = debouncedCheck(index);
                            return (
                              <motion.tr
                                key={book.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.1 }}
                                className="border-b border-border hover:bg-muted/30 transition-colors"
                              >
                                <TableCell className="p-3">
                                  <Input
                                    type="text"
                                    disabled
                                    {...register(`books.${index}.title` as const)}
                                    placeholder="Enter book title"
                                    className="w-full min-w-[200px]"
                                  />
                                </TableCell>
                                <TableCell className="p-3">
                                  <div className='space-y-1'>
                                    <Input
                                      type="text"
                                      {...register(`books.${index}.isbn` as const)}
                                      onChange={(e) => {
                                        setValue(`books.${index}.isbn` as const, e.target.value);
                                        debouncedCheckHandler(e);
                                      }}
                                      placeholder="ISBN"
                                      className="w-full min-w-[120px] font-mono text-sm"
                                    />
                                    {errors.books && errors.books[index] && errors.books[index].isbn && (
                                      <ErrorMessage message={errors.books[index].isbn?.message || '' } />
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="p-3">
                                  <Input
                                    type="number"
                                    disabled
                                    {...register(`books.${index}.currentStock` as const)}
                                    placeholder="0"
                                    className="w-full min-w-[100px] text-center"
                                    min="0"
                                  />
                                </TableCell>
                                <TableCell className="p-3">
                                  <Input
                                    type="number"
                                    {...register(`books.${index}.quantity` as const)}
                                    className="w-full min-w-[100px] text-center font-semibold"
                                    min="1"
                                  />
                                </TableCell>
                                <TableCell className="p-3">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => remove(index)}
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    disabled={fields.length === 1}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </motion.tr>
                            )})}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4"
                  >
                    <Button 
                      variant="outline" 
                      onClick={() => append({ edition_id: "", cost_price: 0, title: '', isbn: '', currentStock: 0, quantity: 1 })}
                      className="gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5"
                    >
                      <Plus className="w-4 h-4" />
                      Add Book
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>

              {/* Summary Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <Card className="shadow-card-soft border border-border bg-gradient-to-br from-accent/5 to-accent/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/20">
                        <Package className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Quantity</p>
                        <p className="text-2xl font-bold text-foreground">{totalQuantity}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card-soft border border-border bg-gradient-to-br from-gold/5 to-gold/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gold/20">
                        <DollarSign className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estimated Total Cost</p>
                        <p className="text-2xl font-bold text-foreground">Ksh {estimatedCost.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-border"
              >
                <Button 
                  variant="outline" 
                  size="lg"
                  className="order-2 sm:order-1"
                >
                  Save as Draft
                </Button>
                <Button 
                  variant="premium" 
                  size="lg"
                  onClick={handlePurchaseOrderSubmit}
                  disabled={!supplier || books.some(book => !book.title || !book.isbn)}
                  className="order-1 sm:order-2 min-w-[200px]"
                >
                  Submit for Approval
                </Button>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            {/* Search and Filter */}
            <Card className="shadow-card-soft border border-border">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by PO number or supplier..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Purchase Orders List */}
            <Card className="shadow-card-soft border border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-foreground">Purchase Orders</CardTitle>
                  <Badge variant="outline" className="text-sm">
                    {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-md border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold text-foreground">PO Number</TableHead>
                        <TableHead className="font-semibold text-foreground">Supplier</TableHead>
                        <TableHead className="font-semibold text-foreground">Status</TableHead>
                        <TableHead className="font-semibold text-foreground">Items</TableHead>
                        <TableHead className="font-semibold text-foreground">Total Amount</TableHead>
                        <TableHead className="font-semibold text-foreground">Created</TableHead>
                        <TableHead className="font-semibold text-foreground">Expected Delivery</TableHead>
                        <TableHead className="font-semibold text-foreground w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredOrders.map((order, index) => (
                          <motion.tr
                            key={order.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.1 }}
                            className="border-b border-border hover:bg-muted/30 transition-colors"
                          >
                            <TableCell className="font-mono font-medium text-foreground">
                              {order.poNumber}
                            </TableCell>
                            <TableCell className="text-foreground">{order.supplier}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell className="text-center">{order.totalItems}</TableCell>
                            <TableCell className="font-semibold">Ksh {order.totalAmount.toLocaleString()}</TableCell>
                            <TableCell className="text-muted-foreground">{order.createdDate}</TableCell>
                            <TableCell className="text-muted-foreground">{order.expectedDelivery}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedPO(order.poNumber)}
                                className="h-8 w-8"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                  
                  {filteredOrders.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No purchase orders found matching your criteria.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default CreatePurchaseOrder;