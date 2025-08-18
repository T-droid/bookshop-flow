import React, { useState } from 'react';
import { 
  Package, 
  TrendingDown, 
  AlertTriangle, 
  Eye, 
  Edit3, 
  Plus,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface InventoryItem {
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

const InventoryManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock inventory data
  const [inventory] = useState<InventoryItem[]>([
    {
      id: '1',
      title: 'The Great Gatsby',
      isbn: '978-0-7432-7356-5',
      author: 'F. Scott Fitzgerald',
      category: 'Fiction',
      currentStock: 25,
      reorderLevel: 10,
      costPrice: 800,
      salePrice: 1200,
      supplier: 'Penguin Random House',
      lastRestocked: 'Aug 10, 2025',
      status: 'In Stock'
    },
    {
      id: '2',
      title: 'To Kill a Mockingbird',
      isbn: '978-0-06-112008-4',
      author: 'Harper Lee',
      category: 'Fiction',
      currentStock: 8,
      reorderLevel: 10,
      costPrice: 1000,
      salePrice: 1500,
      supplier: 'HarperCollins',
      lastRestocked: 'Aug 5, 2025',
      status: 'Low Stock'
    },
    {
      id: '3',
      title: '1984',
      isbn: '978-0-452-28423-4',
      author: 'George Orwell',
      category: 'Fiction',
      currentStock: 0,
      reorderLevel: 15,
      costPrice: 900,
      salePrice: 1350,
      supplier: 'Penguin Random House',
      lastRestocked: 'Jul 28, 2025',
      status: 'Out of Stock'
    },
    {
      id: '4',
      title: 'Introduction to Programming',
      isbn: '978-1-234-56789-0',
      author: 'John Smith',
      category: 'Technology',
      currentStock: 45,
      reorderLevel: 20,
      costPrice: 1500,
      salePrice: 2200,
      supplier: 'Tech Publishers',
      lastRestocked: 'Aug 12, 2025',
      status: 'In Stock'
    },
    {
      id: '5',
      title: 'A Brief History of Time',
      isbn: '978-0-553-38016-3',
      author: 'Stephen Hawking',
      category: 'Science',
      currentStock: 12,
      reorderLevel: 8,
      costPrice: 1200,
      salePrice: 1800,
      supplier: 'Bantam Books',
      lastRestocked: 'Aug 8, 2025',
      status: 'In Stock'
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Stock':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">In Stock</Badge>;
      case 'Low Stock':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Low Stock</Badge>;
      case 'Out of Stock':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Out of Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.isbn.includes(searchQuery);
    const matchesCategory = categoryFilter === 'all' || item.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || item.status.toLowerCase().replace(' ', '') === statusFilter.toLowerCase();
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const lowStockItems = inventory.filter(item => item.currentStock <= item.reorderLevel && item.currentStock > 0);
  const outOfStockItems = inventory.filter(item => item.currentStock === 0);
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.costPrice), 0);

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
              <Package className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
              <p className="text-muted-foreground">Monitor stock levels, manage products, and track inventory value</p>
            </div>
          </div>
        </motion.div>

        {/* Inventory Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="shadow-card-soft border border-border bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold text-foreground">{inventory.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card-soft border border-border bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <TrendingDown className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold text-foreground">{lowStockItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card-soft border border-border bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Out of Stock</p>
                  <p className="text-2xl font-bold text-foreground">{outOfStockItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card-soft border border-border bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-foreground">Ksh {totalValue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filter */}
        <Card className="shadow-card-soft border border-border mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, author, or ISBN..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="fiction">Fiction</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="instock">In Stock</SelectItem>
                  <SelectItem value="lowstock">Low Stock</SelectItem>
                  <SelectItem value="outofstock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button variant="premium" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card className="shadow-card-soft border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground">Inventory Items</CardTitle>
              <Badge variant="outline" className="text-sm">
                {filteredInventory.length} item{filteredInventory.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold text-foreground">Book Details</TableHead>
                    <TableHead className="font-semibold text-foreground">Author</TableHead>
                    <TableHead className="font-semibold text-foreground">Category</TableHead>
                    <TableHead className="font-semibold text-foreground">Stock</TableHead>
                    <TableHead className="font-semibold text-foreground">Reorder Level</TableHead>
                    <TableHead className="font-semibold text-foreground">Cost Price</TableHead>
                    <TableHead className="font-semibold text-foreground">Sale Price</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                    <TableHead className="font-semibold text-foreground w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredInventory.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{item.title}</p>
                            <p className="text-sm text-muted-foreground font-mono">{item.isbn}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">{item.author}</TableCell>
                        <TableCell className="text-foreground">{item.category}</TableCell>
                        <TableCell className="text-center font-medium">
                          <span className={item.currentStock <= item.reorderLevel ? 'text-amber-600' : 'text-foreground'}>
                            {item.currentStock}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">{item.reorderLevel}</TableCell>
                        <TableCell className="font-medium">Ksh {item.costPrice.toLocaleString()}</TableCell>
                        <TableCell className="font-medium">Ksh {item.salePrice.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
              
              {filteredInventory.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No inventory items found matching your criteria.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default InventoryManagement;
