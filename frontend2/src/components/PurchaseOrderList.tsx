import { AnimatePresence, motion } from "framer-motion";
import { LoadingSpinner } from "./LoadingSpinner";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "./ui/table";
import { Eye, Filter, Search } from "lucide-react";
import { useGetPurchaseOrders } from "@/hooks/useGetResources";
import { getStatusBadge } from "./StatusBadge";
import { useState } from "react";
import { TabsContent } from "./ui/tabs";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface PurchaseOrderListProps {
  onSelectPO?: (poNumber: string) => void;
  isLoading?: boolean;
  error?: any;
  data: any[];
}

const PurchaseOrderList = ({ onSelectPO, isLoading, error, data }: PurchaseOrderListProps) => {
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOrders = data?.filter(order => {
        const matchesSearch = order.poNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             order.supplier?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status?.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    }) || [];

    return (
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
            {isLoading ? (
              <LoadingSpinner message="Loading purchase orders..." />
            ) : error ? (
              <Card className="shadow-card-soft border border-border">
                <CardContent className="p-6 text-center">
                  <div className="text-destructive mb-4">
                    Failed to load purchase orders. Please check your connection and try again.
                  </div>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline"
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-card-soft border border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-foreground">Purchase Orders</CardTitle>
                    <Badge variant="outline" className="text-sm">
                      {filteredOrders?.length || 0} order{(filteredOrders?.length || 0) !== 1 ? 's' : ''}
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
                          {filteredOrders?.map((order, index) => (
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
                                  onClick={() => onSelectPO?.(order.poNumber)}
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
                    
                    {(!filteredOrders || filteredOrders.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        No purchase orders found matching your criteria.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
    );
};

export default PurchaseOrderList;