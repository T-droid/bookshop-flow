import React, { useState, useEffect } from 'react';
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
import { useCSVReader } from "react-papaparse";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import apiClient from "@/api/api";
import { useGetInventory } from '@/hooks/useGetResources';
import { InventoryResponse, TopInventoryItem, InventoryItem } from '@/types/inventory';

interface Book {
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  category: string;
  format: string;
  quantity: number;
  cost: number;
  pages?: number;
  pub_date?: string;
  language: string;
  description?: string;
  location?: string;
}

const InventoryManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: inventoryData, isLoading: inventoryLoading, error } = useGetInventory(10)
  
  // CSV Upload states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [csvData, setCsvData] = useState<Book[]>([]);
  const [csvErrors, setCsvErrors] = useState<{ row: number; message: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { CSVReader } = useCSVReader();

  const { mutateAsync: createNewBooks } = useMutation({
    mutationFn: async (data: Book[]) => {
      return apiClient.post("/books", data)
    },
    onSuccess: () => {
      toast.success("Books created successfully")
    },
    onError: (error) => {
      toast.error("Failed to create books");
      setCsvErrors([{ row: 0, message: error.message || 'Unknown error' }]);
      console.log(error);
    }
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(inventoryData || []);

  const fetchInventory = async () => {
      const inventory = await useGetInventory();
      console.log(inventory)
    }

  useEffect(() => {
    if (inventoryData) {
      
      // Transform the API data to match your InventoryItem interface
      const transformedData = (inventoryData as InventoryResponse).top_items.map((item: TopInventoryItem) => ({
        id: item.isbn_number, // Use ISBN as ID since we don't have an ID field
        title: item.title,
        isbn: item.isbn_number,
        author: item.author,
        category: item.category_name,
        currentStock: item.stock,
        reorderLevel: item.reorder_level,
        costPrice: item.cost_price,
        salePrice: item.sale_price,
        supplier: 'Unknown', // Not provided in API response
        lastRestocked: new Date().toLocaleDateString(), // Not provided in API response
        status: getStockStatus(item.stock, item.reorder_level)
      }));
      
      setInventory(transformedData);
    }
  }, [inventoryData]);

  // Helper function to determine stock status
  const getStockStatus = (currentStock: number, reorderLevel: number): 'In Stock' | 'Low Stock' | 'Out of Stock' => {
    if (currentStock === 0) return 'Out of Stock';
    if (currentStock <= reorderLevel) return 'Low Stock';
    return 'In Stock';
  };
  

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

  // Handle CSV upload with react-papaparse
  const handleCsvUpload = (results: any) => {
    console.log('Raw CSV results:', results);
    
    // Clear previous errors
    setCsvErrors([]);
    
    const data = results.data;
    console.log('CSV data array:', data);
    
    if (!data || data.length === 0) {
      setCsvErrors([{ row: 0, message: "No data found in CSV file" }]);
      return;
    }
    
    const parsedBooks: Book[] = data
      .filter((row: any) => {
        // Filter out completely empty rows
        return row && Object.values(row).some(value => 
          value !== null && value !== undefined && String(value).trim() !== ''
        );
      })
      .map((row: any, index: number) => {
        console.log(`Processing row ${index + 1}:`, row);
        
        const book: Book = {
          title: String(row.title || '').trim(),
          author: String(row.author || '').trim(),
          isbn: String(row.isbn || '').trim(),
          publisher: String(row.publisher || '').trim(),
          category: String(row.subject || row.category || 'General').trim(),
          format: String(row.format || 'Paperback').trim(),
          quantity: parseInt(String(row.quantity || '0')) || 0,
          cost: parseFloat(String(row.price_excl || row.cost || '0')) || 0,
          pages: row.pages ? parseInt(String(row.pages)) : undefined,
          pub_date: row.publication_date || row.pub_date || undefined,
          language: String(row.language || 'English').trim(),
          description: row.description ? String(row.description).trim() : undefined,
          location: row.location ? String(row.location).trim() : undefined
        };

        // Client-side validation
        const errors: string[] = [];
        if (!book.title) errors.push("Missing title");
        if (!book.author) errors.push("Missing author");
        if (!book.isbn) errors.push("Missing ISBN");
        if (!book.publisher) errors.push("Missing publisher");
        if (!book.category || book.category === 'General') errors.push("Missing category");
        if (!book.format) errors.push("Missing format");
        if (book.quantity <= 0) errors.push("Invalid quantity");
        if (book.cost < 0) errors.push("Invalid cost");

        // Validate ISBN format (simplified)
        if (book.isbn && !/^[\d\-X]{10,17}$/.test(book.isbn.replace(/\s/g, ''))) {
          errors.push("Invalid ISBN format");
        }

        if (errors.length > 0) {
          setCsvErrors((prev) => [...prev, { row: index + 1, message: errors.join(", ") }]);
          return null;
        }
        return book;
      })
      .filter((book): book is Book => book !== null);

    console.log('Parsed books:', parsedBooks);
    setCsvData(parsedBooks);
  };

  // Submit parsed CSV data to backend
  const handleSubmit = async () => {
    if (csvData.length === 0) return;
    setIsLoading(true);
    try {
      console.log('Sending data:', csvData);
      
      await createNewBooks(csvData)
      
      setIsUploadOpen(false);
      setCsvData([]);
      setCsvErrors([]);
      // Refresh inventory data here if needed
    } catch (error) {
      console.error("Failed to upload books:", error);
      setCsvErrors([{ row: 0, message: "Network error: " + (error as Error).message }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle CSV error
  const handleCsvError = (error: any) => {
    setCsvErrors([{ row: 0, message: "Failed to parse CSV: " + error.message }]);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.isbn.includes(searchQuery);
    const matchesCategory = categoryFilter === 'all' || item.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || item.status.toLowerCase().replace(' ', '') === statusFilter.toLowerCase();
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const apiData = inventoryData as InventoryResponse;
  const lowStockItems = apiData?.low_stock || 0;
  const outOfStockItems = apiData?.out_of_stock || 0;
  const totalValue = apiData?.total_value || 0;
  const totalItems = apiData?.total_items || 0;


  if (inventoryLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading inventory...</p>
            </div>
          </div>
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Package className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
                <p className="text-muted-foreground">Monitor stock levels, manage products, and track inventory value</p>
              </div>
            </div>
            <Button variant="premium" size="lg" className="gap-2" onClick={() => setIsUploadOpen(!isUploadOpen)}>
              <Plus className="w-5 h-5" />
              Upload Books
            </Button>
          </div>
        </motion.div>

        {/* CSV Upload Section */}
        <AnimatePresence>
          {isUploadOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ 
                duration: 0.5, 
                ease: "easeInOut",
                height: { duration: 0.4 }
              }}
              className="overflow-hidden"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <Card className="p-6 bg-card border border-border shadow-card-soft mb-8">
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className="text-xl font-bold text-foreground mb-4"
                  >
                    Upload Books via CSV
                  </motion.h2>
                  
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="text-muted-foreground mb-4"
                  >
                    Upload a CSV file with columns: title, author, isbn, publisher, category (or subject), format, quantity, cost (or price_excl), pages, publication_date, language, description, location.{' '}
                    <a href="/books_template.csv" download className="text-primary underline">
                      Download template
                    </a>
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                  >
                    <CSVReader
                      onUploadAccepted={handleCsvUpload}
                      onError={handleCsvError}
                      config={{
                        header: true,
                        skipEmptyLines: true,
                        dynamicTyping: true,
                      }}
                    >
                      {({ getRootProps, acceptedFile }: any) => (
                        <div {...getRootProps()} className="border-2 border-dashed border-border p-4 rounded-md mb-4 hover:border-primary transition-colors">
                          <p className="text-muted-foreground">
                            {acceptedFile ? acceptedFile.name : "Drag and drop a CSV file or click to select"}
                          </p>
                        </div>
                      )}
                    </CSVReader>
                  </motion.div>

                  {/* Preview table */}
                  <AnimatePresence>
                    {csvData.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mb-4"
                      >
                        <h3 className="text-lg font-semibold text-foreground">Preview (First 10 Rows)</h3>
                        <div className="overflow-x-auto max-h-64">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="text-left p-2 text-sm font-medium text-muted-foreground">Row</th>
                                <th className="text-left p-2 text-sm font-medium text-muted-foreground">Title</th>
                                <th className="text-left p-2 text-sm font-medium text-muted-foreground">Author</th>
                                <th className="text-left p-2 text-sm font-medium text-muted-foreground">ISBN</th>
                                <th className="text-left p-2 text-sm font-medium text-muted-foreground">Publisher</th>
                                <th className="text-left p-2 text-sm font-medium text-muted-foreground">Category</th>
                                <th className="text-left p-2 text-sm font-medium text-muted-foreground">Format</th>
                                <th className="text-left p-2 text-sm font-medium text-muted-foreground">Cost</th>
                                <th className="text-left p-2 text-sm font-medium text-muted-foreground">Quantity</th>
                                <th className="text-left p-2 text-sm font-medium text-muted-foreground">Language</th>
                              </tr>
                            </thead>
                            <tbody>
                              {csvData.slice(0, 10).map((book, index) => (
                                <motion.tr
                                  key={index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1, duration: 0.3 }}
                                  className="border-b border-border"
                                >
                                  <td className="p-2">{index + 1}</td>
                                  <td className="p-2">{book.title}</td>
                                  <td className="p-2">{book.author}</td>
                                  <td className="p-2">{book.isbn}</td>
                                  <td className="p-2">{book.publisher}</td>
                                  <td className="p-2">{book.category}</td>
                                  <td className="p-2">{book.format}</td>
                                  <td className="p-2">${book.cost.toFixed(2)}</td>
                                  <td className="p-2">{book.quantity}</td>
                                  <td className="p-2">{book.language}</td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error display */}
                  <AnimatePresence>
                    {csvErrors.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mb-4"
                      >
                        <h3 className="text-lg font-semibold text-destructive">Errors</h3>
                        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                          {csvErrors.map((error, index) => (
                            <p key={index} className="text-sm text-destructive">
                              Row {error.row}: {error.message}
                            </p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action buttons */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.3 }}
                    className="flex gap-2"
                  >
                    <Button
                      variant="premium"
                      onClick={handleSubmit}
                      disabled={isLoading || csvData.length === 0}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      {isLoading ? "Uploading..." : "Submit"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsUploadOpen(false);
                        setCsvData([]);
                        setCsvErrors([]);
                      }}
                      disabled={isLoading}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      Cancel
                    </Button>
                  </motion.div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                  <p className="text-2xl font-bold text-foreground">{totalItems}</p>
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
                  <p className="text-2xl font-bold text-foreground">{lowStockItems}</p>
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
                  <p className="text-2xl font-bold text-foreground">{outOfStockItems}</p>
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
