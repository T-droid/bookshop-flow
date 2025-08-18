import React, { useState } from 'react';
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

interface BookItem {
  id: number;
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

const CreatePurchaseOrder = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [selectedPO, setSelectedPO] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Create PO state
  const [supplier, setSupplier] = useState('');
  const [books, setBooks] = useState<BookItem[]>([
    { id: 1, title: '', isbn: '', currentStock: 0, quantity: 1 }
  ]);

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

  const addBook = () => {
    setBooks([...books, { id: books.length + 1, title: '', isbn: '', currentStock: 0, quantity: 1 }]);
  };

  const removeBook = (id: number) => {
    setBooks(books.filter(book => book.id !== id));
  };

  const updateBook = (id: number, field: keyof BookItem, value: string | number) => {
    setBooks(books.map(book => 
      book.id === id ? { ...book, [field]: value } : book
    ));
  };

  const totalQuantity = books.reduce((sum, book) => sum + Number(book.quantity), 0);
  const estimatedCost = books.reduce((sum, book) => sum + Number(book.quantity) * 100, 0);

  const handleSubmit = () => {
    console.log('Submitted PO:', { supplier, books });
    // After successful submission, switch to list view
    setActiveTab('list');
    // Reset form
    setSupplier('');
    setBooks([{ id: 1, title: '', isbn: '', currentStock: 0, quantity: 1 }]);
  };

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
                    <Select value={supplier} onValueChange={setSupplier}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supplier1">Penguin Random House</SelectItem>
                        <SelectItem value="supplier2">HarperCollins Publishers</SelectItem>
                        <SelectItem value="supplier3">Macmillan Publishers</SelectItem>
                        <SelectItem value="supplier4">Scholastic Inc.</SelectItem>
                      </SelectContent>
                    </Select>
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
                          {books.map((book, index) => (
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
                                  value={book.title}
                                  onChange={(e) => updateBook(book.id, 'title', e.target.value)}
                                  placeholder="Enter book title"
                                  className="w-full min-w-[200px]"
                                />
                              </TableCell>
                              <TableCell className="p-3">
                                <Input
                                  type="text"
                                  value={book.isbn}
                                  onChange={(e) => updateBook(book.id, 'isbn', e.target.value)}
                                  placeholder="ISBN"
                                  className="w-full min-w-[120px] font-mono text-sm"
                                />
                              </TableCell>
                              <TableCell className="p-3">
                                <Input
                                  type="number"
                                  value={book.currentStock}
                                  onChange={(e) => updateBook(book.id, 'currentStock', parseInt(e.target.value) || 0)}
                                  placeholder="0"
                                  className="w-full min-w-[100px] text-center"
                                  min="0"
                                />
                              </TableCell>
                              <TableCell className="p-3">
                                <Input
                                  type="number"
                                  value={book.quantity}
                                  onChange={(e) => updateBook(book.id, 'quantity', parseInt(e.target.value) || 1)}
                                  className="w-full min-w-[100px] text-center font-semibold"
                                  min="1"
                                />
                              </TableCell>
                              <TableCell className="p-3">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeBook(book.id)}
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  disabled={books.length === 1}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </motion.tr>
                          ))}
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
                      onClick={addBook}
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
                  onClick={handleSubmit}
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