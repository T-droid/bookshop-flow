import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Receipt, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  DollarSign,
  Package,
  Eye,
  Download,
  Filter,
  Calendar,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PurchaseOrderDetails from '@/components/PurchaseOrderDetails';
import { useNotifications } from '@/components/NotificationProvider';
import { useGetPurchaseOrders, useGetSales } from '@/hooks/useGetResources';
import { useUpdatePurchaseOrderStatus } from '@/hooks/useCreateResource';
import { useQueryClient } from '@tanstack/react-query';
import { SaleResponse } from '@/types/sales';


interface AnalyticsData {
  totalSales: number;
  totalOrders: number;
  avgOrderValue: number;
  topBooks: Array<{ title: string; sales: number; revenue: number }>;
  monthlySales: Array<{ month: string; amount: number }>;
}

const AdminDashboard = () => {
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPO, setSelectedPO] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30days');

  // Mock sales data
  // const [salesData] = useState<SalesData[]>([
  //   {
  //     id: '1',
  //     date: 'Aug 18, 2025',
  //     customer: 'Alice Johnson',
  //     items: 3,
  //     amount: 2850,
  //     paymentMethod: 'Card',
  //     status: 'Completed'
  //   },
  //   {
  //     id: '2',
  //     date: 'Aug 18, 2025',
  //     customer: 'Bob Smith',
  //     items: 1,
  //     amount: 1200,
  //     paymentMethod: 'Cash',
  //     status: 'Completed'
  //   },
  //   {
  //     id: '3',
  //     date: 'Aug 17, 2025',
  //     customer: 'Carol Wilson',
  //     items: 5,
  //     amount: 4750,
  //     paymentMethod: 'Mobile Money',
  //     status: 'Completed'
  //   },
  //   {
  //     id: '4',
  //     date: 'Aug 17, 2025',
  //     customer: 'David Brown',
  //     items: 2,
  //     amount: 1850,
  //     paymentMethod: 'Card',
  //     status: 'Pending'
  //   }
  // ]);

  const { data: salesData, error: salesError, isLoading: loadingSales } = useGetSales(40)

  // Mock analytics data
  const [analytics] = useState<AnalyticsData>({
    totalSales: 847500,
    totalOrders: 234,
    avgOrderValue: 3620,
    topBooks: [
      { title: 'The Great Gatsby', sales: 45, revenue: 67500 },
      { title: 'To Kill a Mockingbird', sales: 38, revenue: 57000 },
      { title: '1984', sales: 42, revenue: 63000 },
      { title: 'Pride and Prejudice', sales: 35, revenue: 52500 },
      { title: 'The Catcher in the Rye', sales: 33, revenue: 49500 }
    ],
    monthlySales: [
      { month: 'Feb', amount: 145000 },
      { month: 'Mar', amount: 162000 },
      { month: 'Apr', amount: 178000 },
      { month: 'May', amount: 195000 },
      { month: 'Jun', amount: 168000 },
      { month: 'Jul', amount: 182000 },
      { month: 'Aug', amount: 210000 }
    ]
  });

  const { data: purchaseOrdersData, isLoading: loadingPurchaseOrders, error: purchaseOrdersError } = useGetPurchaseOrders();
  const updatePurchaseOrderStatus = useUpdatePurchaseOrderStatus();

  // Function to calculate priority based on dates
  const calculatePriority = (createdDate: string, expectedDelivery: string): 'High' | 'Medium' | 'Low' => {
    const created = new Date(createdDate);
    const delivery = new Date(expectedDelivery);
    const daysDifference = Math.ceil((delivery.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference <= 3) return 'High';
    if (daysDifference <= 7) return 'Medium';
    return 'Low';
  };

  const handleApprovePO = async (poId: string) => {
    const po = purchaseOrdersData?.find(p => p.id === poId);
    if (!po) return;

    try {
      await updatePurchaseOrderStatus.mutateAsync({
        poId: poId,
        status: 'approved'
      });
      
      // Refresh the purchase orders data
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Purchase Order Approved',
        message: `PO ${po.poNumber} has been approved successfully.`,
        duration: 4000
      });
    } catch (error) {
      // Error notification is handled by the mutation hook
      console.error('Failed to approve purchase order:', error);
    }
  };

  const handleRejectPO = async (poId: string) => {
    const po = purchaseOrdersData?.find(p => p.id === poId);
    if (!po) return;

    try {
      await updatePurchaseOrderStatus.mutateAsync({
        poId: poId,
        status: 'rejected'
      });
      
      // Refresh the purchase orders data
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      
      // Show rejection notification
      addNotification({
        type: 'error',
        title: 'Purchase Order Rejected',
        message: `PO ${po.poNumber} has been rejected.`,
        duration: 4000
      });
    } catch (error) {
      // Error notification is handled by the mutation hook
      console.error('Failed to reject purchase order:', error);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High</Badge>;
      case 'Medium':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Medium</Badge>;
      case 'Low':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'Pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
      case 'Refunded':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredSales = (salesData || []).filter(sale => {
    const matchesSearch = sale.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sale.sale_status.toLowerCase() === statusFilter.toLowerCase();
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
              ← Back to Admin Dashboard
            </Button>
          </div>
          <PurchaseOrderDetails 
            poNumber={selectedPO} 
            onClose={() => setSelectedPO(null)}
            onApprove={(poNumber) => {
              const po = purchaseOrdersData?.find(po => po.poNumber === poNumber);
              if (po) {
                handleApprovePO(po.id);
                setSelectedPO(null);
              }
            }}
            onReject={(poNumber) => {
              const po = purchaseOrdersData?.find(po => po.poNumber === poNumber);
              if (po) {
                handleRejectPO(po.id);
                setSelectedPO(null);
              }
            }}
            isAdminView={true}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage purchase orders, view sales analytics, and oversee bookshop operations</p>
            </div>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="purchase-orders" className="gap-2">
              <Receipt className="w-4 h-4" />
              Purchase Orders
            </TabsTrigger>
            <TabsTrigger value="sales" className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              Sales
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <Card className="shadow-card-soft border border-border bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Sales</p>
                      <p className="text-2xl font-bold text-foreground">Ksh {analytics.totalSales.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card-soft border border-border bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <ShoppingCart className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold text-foreground">{analytics.totalOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card-soft border border-border bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Order Value</p>
                      <p className="text-2xl font-bold text-foreground">Ksh {analytics.avgOrderValue.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card-soft border border-border bg-gradient-to-br from-amber-50 to-amber-100">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total POs</p>
                      <p className="text-2xl font-bold text-foreground">{purchaseOrdersData?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Purchase Orders */}
              <Card className="shadow-card-soft border border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Pending Purchase Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {purchaseOrdersData?.slice(0, 3).map((po) => (
                      <div key={po.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{po.poNumber}</p>
                          <p className="text-sm text-muted-foreground">{po.supplier} • Ksh {po.totalAmount.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(calculatePriority(po.createdDate, po.expectedDelivery))}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPO(po.poNumber)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => setActiveTab('purchase-orders')}
                  >
                    View All Purchase Orders
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Sales */}
              <Card className="shadow-card-soft border border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Recent Sales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingSales ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading sales...</p>
                    </div>
                  ) : salesError ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-destructive mb-2">Failed to load sales</p>
                      <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(salesData || []).slice(0, 3).map((sale) => (
                        <div key={sale.sale_id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium text-foreground">{sale.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{sale.date} • {sale.items} items</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">Ksh {sale.total_amount.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">{sale.payment_method}</p>
                          </div>
                        </div>
                      ))}
                      {(!salesData || salesData.length === 0) && (
                        <div className="text-center py-4 text-muted-foreground">
                          <p className="text-sm">No recent sales found</p>
                        </div>
                      )}
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => setActiveTab('sales')}
                    disabled={loadingSales}
                  >
                    View All Sales
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="purchase-orders" className="space-y-6">
            {/* Purchase Orders Management */}
            <Card className="shadow-card-soft border border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-foreground">Purchase Orders</CardTitle>
                  <Badge variant="outline" className="text-sm">
                    {purchaseOrdersData?.length || 0} order{(purchaseOrdersData?.length || 0) !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {loadingPurchaseOrders ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading purchase orders...</p>
                  </div>
                ) : purchaseOrdersError ? (
                  <div className="text-center py-8">
                    <p className="text-destructive mb-4">Failed to load purchase orders</p>
                    <Button onClick={() => window.location.reload()} variant="outline">
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-md border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold text-foreground">PO Number</TableHead>
                          <TableHead className="font-semibold text-foreground">Supplier</TableHead>
                          <TableHead className="font-semibold text-foreground">Status</TableHead>
                          <TableHead className="font-semibold text-foreground">Items</TableHead>
                          <TableHead className="font-semibold text-foreground">Total Amount</TableHead>
                          <TableHead className="font-semibold text-foreground">Priority</TableHead>
                          <TableHead className="font-semibold text-foreground">Created</TableHead>
                          <TableHead className="font-semibold text-foreground w-32">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {purchaseOrdersData?.map((po, index) => (
                            <motion.tr
                              key={po.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: index * 0.1 }}
                              className="border-b border-border hover:bg-muted/30 transition-colors"
                            >
                              <TableCell className="font-mono font-medium text-foreground">
                                {po.poNumber || 'N/A'}
                              </TableCell>
                              <TableCell className="text-foreground">{po.supplier}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  {po.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">{po.totalItems}</TableCell>
                              <TableCell className="font-semibold">Ksh {po.totalAmount.toLocaleString()}</TableCell>
                              <TableCell>{getPriorityBadge(calculatePriority(po.createdDate, po.expectedDelivery))}</TableCell>
                              <TableCell className="text-muted-foreground">{po.createdDate}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedPO(po.poNumber)}
                                    className="h-8 w-8"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleApprovePO(po.id)}
                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRejectPO(po.id)}
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                    
                    {(!purchaseOrdersData || purchaseOrdersData.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        No purchase orders found.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            {/* Search and Filter */}
            <Card className="shadow-card-soft border border-border">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by customer name..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={loadingSales}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter} disabled={loadingSales}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateRange} onValueChange={setDateRange} disabled={loadingSales}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <Calendar className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="90days">Last 90 days</SelectItem>
                      <SelectItem value="1year">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="gap-2" disabled={loadingSales || !salesData?.length}>
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sales Table */}
            <Card className="shadow-card-soft border border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-foreground">Sales Transactions</CardTitle>
                  <Badge variant="outline" className="text-sm">
                    {loadingSales ? '...' : `${filteredSales.length} transaction${filteredSales.length !== 1 ? 's' : ''}`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {loadingSales ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading sales transactions...</p>
                  </div>
                ) : salesError ? (
                  <div className="text-center py-12">
                    <div className="text-destructive mb-4">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-lg font-medium">Failed to load sales</p>
                      <p className="text-sm text-muted-foreground">
                        {salesError?.message || 'An error occurred while fetching sales data'}
                      </p>
                    </div>
                    <Button onClick={() => window.location.reload()} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-md border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold text-foreground">Date</TableHead>
                          <TableHead className="font-semibold text-foreground">Customer</TableHead>
                          <TableHead className="font-semibold text-foreground">Items</TableHead>
                          <TableHead className="font-semibold text-foreground">Amount</TableHead>
                          <TableHead className="font-semibold text-foreground">Payment Method</TableHead>
                          <TableHead className="font-semibold text-foreground">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {filteredSales.map((sale, index) => (
                            <motion.tr
                              key={sale.sale_id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: index * 0.1 }}
                              className="border-b border-border hover:bg-muted/30 transition-colors"
                            >
                              <TableCell className="text-muted-foreground">{sale.date}</TableCell>
                              <TableCell className="font-medium text-foreground">{sale.customer_name}</TableCell>
                              <TableCell className="text-center">{sale.items}</TableCell>
                              <TableCell className="font-semibold">Ksh {sale.total_amount.toLocaleString()}</TableCell>
                              <TableCell className="text-foreground">{sale.payment_method}</TableCell>
                              <TableCell>{getStatusBadge(sale.sale_status)}</TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                    
                    {(!salesData || salesData.length === 0) && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No sales found</p>
                        <p className="text-sm">Start making sales to see transactions here</p>
                      </div>
                    )}
                    
                    {salesData && salesData.length > 0 && filteredSales.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No sales match your criteria</p>
                        <p className="text-sm">Try adjusting your search or filter settings</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Top Selling Books */}
            <Card className="shadow-card-soft border border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Top Selling Books</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topBooks.map((book, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{book.title}</p>
                          <p className="text-sm text-muted-foreground">{book.sales} copies sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">Ksh {book.revenue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Sales Chart */}
            <Card className="shadow-card-soft border border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Monthly Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2 p-4 bg-muted/20 rounded-lg">
                  {analytics.monthlySales.map((month, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div 
                        className="bg-gradient-primary rounded-t-md w-12 transition-all duration-500 hover:opacity-80"
                        style={{ 
                          height: `${(month.amount / Math.max(...analytics.monthlySales.map(m => m.amount))) * 200}px`,
                          minHeight: '20px'
                        }}
                      />
                      <div className="text-center">
                        <p className="text-xs font-medium text-foreground">{month.month}</p>
                        <p className="text-xs text-muted-foreground">{(month.amount / 1000).toFixed(0)}K</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
