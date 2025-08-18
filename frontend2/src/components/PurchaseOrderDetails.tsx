import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Building2, Phone, MapPin, FileText, User, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface PurchaseOrderDetailsProps {
  poNumber?: string;
  onClose?: () => void;
}

const PurchaseOrderDetails = ({ poNumber = 'A00001', onClose }: PurchaseOrderDetailsProps) => {
  // Mock data for demo
  const poDetails = {
    poNumber: poNumber,
    status: 'Pending' as 'Pending' | 'Approved' | 'Rejected' | 'Cancelled',
    createdDate: 'Aug 17, 2025',
    expectedDelivery: 'Aug 25, 2025',
    supplier: {
      name: 'Penguin Random House',
      address: '123 Publishers Ave, Nairobi, Kenya',
      phone: '+254 123 456 789',
      email: 'orders@penguinrandomhouse.co.ke',
    },
    books: [
      { id: 1, title: 'The Great Gatsby', isbn: '978-0-7432-7356-5', quantity: 10, unitPrice: 1200, subtotal: 12000 },
      { id: 2, title: 'To Kill a Mockingbird', isbn: '978-0-06-112008-4', quantity: 5, unitPrice: 1500, subtotal: 7500 },
      { id: 3, title: '1984', isbn: '978-0-452-28423-4', quantity: 8, unitPrice: 1350, subtotal: 10800 },
    ],
    approvalHistory: [
      { date: 'Aug 17, 2025', time: '10:30 AM', action: 'Purchase Order Created', user: 'John Manager', status: 'created' },
      { date: 'Aug 17, 2025', time: '10:31 AM', action: 'Submitted for Approval', user: 'System', status: 'pending' },
      { date: 'Aug 18, 2025', time: '09:15 AM', action: 'Under Review', user: 'Sarah Approver', status: 'review' },
    ],
  };

  const [userRole, setUserRole] = useState<'Manager' | 'Approver'>('Manager');

  const handleCancel = () => {
    console.log('PO Cancelled:', poDetails.poNumber);
    onClose?.();
  };

  const handleApprove = () => {
    console.log('PO Approved:', poDetails.poNumber);
    onClose?.();
  };

  const handleReject = () => {
    console.log('PO Rejected:', poDetails.poNumber);
    onClose?.();
  };

  const totalAmount = poDetails.books.reduce((sum, book) => sum + book.subtotal, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>;
      case 'Approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTimelineIcon = (status: string) => {
    switch (status) {
      case 'created':
        return <div className="w-3 h-3 rounded-full bg-blue-500" />;
      case 'pending':
        return <div className="w-3 h-3 rounded-full bg-amber-500" />;
      case 'review':
        return <div className="w-3 h-3 rounded-full bg-purple-500" />;
      case 'approved':
        return <div className="w-3 h-3 rounded-full bg-green-500" />;
      case 'rejected':
        return <div className="w-3 h-3 rounded-full bg-red-500" />;
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-300" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <Card className="shadow-card-soft border border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Purchase Order #{poDetails.poNumber}
                </CardTitle>
                <p className="text-muted-foreground">Created on {poDetails.createdDate}</p>
              </div>
            </div>
            {getStatusBadge(poDetails.status)}
          </div>
        </CardHeader>
      </Card>

      {/* Order Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-card-soft border border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <Calendar className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expected Delivery</p>
                <p className="text-lg font-semibold text-foreground">{poDetails.expectedDelivery}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card-soft border border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-lg font-semibold text-foreground">{poDetails.books.length} Books</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card-soft border border-border bg-gradient-to-br from-gold/5 to-gold/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gold/20">
                <FileText className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-lg font-semibold text-foreground">Ksh {totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Information */}
      <Card className="shadow-card-soft border border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Supplier Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{poDetails.supplier.name}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">{poDetails.supplier.address}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{poDetails.supplier.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{poDetails.supplier.email}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Books Ordered */}
      <Card className="shadow-card-soft border border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Books Ordered</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-foreground">Book Title</TableHead>
                  <TableHead className="font-semibold text-foreground">ISBN</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Quantity</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Unit Price</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {poDetails.books.map((book, index) => (
                  <motion.tr
                    key={book.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium text-foreground">{book.title}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{book.isbn}</TableCell>
                    <TableCell className="text-center font-semibold">{book.quantity}</TableCell>
                    <TableCell className="text-right">Ksh {book.unitPrice.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">Ksh {book.subtotal.toLocaleString()}</TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex justify-end">
            <div className="text-right space-y-1">
              <p className="text-sm text-muted-foreground">Total Quantity: {poDetails.books.reduce((sum, book) => sum + book.quantity, 0)}</p>
              <p className="text-lg font-bold text-foreground">Total Amount: Ksh {totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval History */}
      <Card className="shadow-card-soft border border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Approval History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {poDetails.approvalHistory.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="flex flex-col items-center">
                  {getTimelineIcon(event.status)}
                  {index < poDetails.approvalHistory.length - 1 && (
                    <div className="w-px h-8 bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">{event.action}</span>
                    <span className="text-sm text-muted-foreground">by {event.user}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.date} at {event.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-border"
      >
        {/* Role Toggle for Demo */}
        <div className="flex items-center gap-2 mr-auto">
          <span className="text-sm text-muted-foreground">Role:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUserRole(userRole === 'Manager' ? 'Approver' : 'Manager')}
          >
            {userRole}
          </Button>
        </div>

        {userRole === 'Manager' && (
          <Button 
            variant="outline" 
            size="lg"
            onClick={handleCancel}
            className="text-destructive border-destructive hover:bg-destructive/10"
          >
            Cancel PO
          </Button>
        )}
        
        {userRole === 'Approver' && (
          <>
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleReject}
              className="text-destructive border-destructive hover:bg-destructive/10"
            >
              Reject
            </Button>
            <Button 
              variant="premium" 
              size="lg"
              onClick={handleApprove}
              className="min-w-[120px]"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PurchaseOrderDetails;