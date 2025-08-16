import { useState, useEffect } from "react";
import { Search, Plus, Package, AlertTriangle, Edit, Trash2 } from "lucide-react";
import { useCSVReader } from "react-papaparse";
import { AppLayout } from "@/components/AppLayout";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

import { useMutation } from "@tanstack/react-query";
import apiClient from "@/api/api";
import { toast } from "sonner";

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

export default function Inventory() {
  // Updated initial state to match new Book interface
  const [books, setBooks] = useState<Book[]>([
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      isbn: "978-0-06-112008-4",
      publisher: "HarperCollins",
      category: "Literature",
      format: "Paperback",
      quantity: 2,
      cost: 12.99,
      pages: 376,
      language: "English",
      description: "A gripping tale of racial injustice and childhood innocence."
    },
    {
      title: "1984",
      author: "George Orwell",
      isbn: "978-0-452-28423-4",
      publisher: "Penguin Books",
      category: "Literature",
      format: "Paperback",
      quantity: 8,
      cost: 13.50,
      pages: 328,
      language: "English",
      description: "A dystopian social science fiction novel."
    },
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "978-0-7432-7356-5",
      publisher: "Scribner",
      category: "Literature",
      format: "Paperback",
      quantity: 3,
      cost: 11.99,
      pages: 180,
      language: "English",
      description: "A classic American novel set in the Jazz Age."
    },
  ]);

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
  })
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [csvData, setCsvData] = useState<Book[]>([]);
  const [csvErrors, setCsvErrors] = useState<{ row: number; message: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { CSVReader } = useCSVReader();

  // Fetch books on mount and after upload
  useEffect(() => {
    fetchBooks();
  }, [searchQuery]);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/books?search=${searchQuery}`);
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("Failed to fetch books:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Updated calculation functions to work with new Book interface
  const calculatePriceIncl = (cost: number, vatRate: number = 15) => {
    return (cost * (1 + vatRate / 100)).toFixed(2);
  };

  const calculateTotalValue = (quantity: number, cost: number, vatRate: number = 15) => {
    return (quantity * parseFloat(calculatePriceIncl(cost, vatRate))).toFixed(2);
  };

  // Handle CSV upload with react-papaparse
  const handleCsvUpload = (results: any) => {
    console.log('Raw CSV results:', results); // Log the raw results first
    
    // Clear previous errors
    setCsvErrors([]);
    
    const data = results.data;
    console.log('CSV data array:', data); // Log the parsed data array
    
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
        console.log(`Processing row ${index + 1}:`, row); // Log each row being processed
        
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

    console.log('Parsed books:', parsedBooks); // Log the final parsed books
    setCsvData(parsedBooks);
  };

  // Submit parsed CSV data to backend
  const handleSubmit = async () => {
    if (csvData.length === 0) return;
    setIsLoading(true);
    try {
      console.log('Sending data:', csvData);
      
      // const response = await fetch("/api/books", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(csvData),
      // });
      
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   console.error('Error response:', errorData);
      //   setCsvErrors(errorData.errors || [{ row: 0, message: errorData.detail || 'Unknown error' }]);
      //   return;
      // }
      
      // const result = await response.json();
      // console.log('Success response:', result);

      await createNewBooks(csvData)
      
      setIsUploadOpen(false);
      setCsvData([]);
      setCsvErrors([]);
      await fetchBooks();
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

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
            <p className="text-muted-foreground">Manage your book collection and stock levels</p>
          </div>
          <Button variant="premium" size="lg" className="gap-2" onClick={() => setIsUploadOpen(!isUploadOpen)}>
            <Plus className="w-5 h-5" />
            Upload Books
          </Button>
        </div>

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

                  {/* Updated preview table to match new Book interface */}
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

        {/* Updated Stats Cards to work with new Book interface */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Books"
            value={books.length.toString()}
            icon={<Package className="w-6 h-6 text-primary" />}
          />
          <StatsCard
            title="Total Quantity"
            value={books.reduce((sum, book) => sum + book.quantity, 0).toString()}
            icon={<Package className="w-6 h-6 text-accent" />}
          />
          <StatsCard
            title="Inventory Value"
            value={`$${books.reduce((sum, book) => sum + parseFloat(calculateTotalValue(book.quantity, book.cost)), 0).toFixed(2)}`}
            icon={<Package className="w-6 h-6 text-gold" />}
          />
          <StatsCard
            title="Low Stock Items"
            value={books.filter((book) => book.quantity <= 5).length.toString()} // Using 5 as default threshold
            icon={<AlertTriangle className="w-6 h-6 text-destructive" />}
          />
        </div>

        {/* Search and Filters */}
        <Card className="p-6 bg-card border border-border shadow-card-soft">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search books by title, author, or ISBN..."
                className="pl-10 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Category</Button>
              <Button variant="outline">Format</Button>
              <Button variant="outline">Publisher</Button>
            </div>
          </div>
        </Card>

        {/* Updated Books Table to match new Book interface */}
        <Card className="bg-card border border-border shadow-card-soft">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Book Inventory</h3>
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Title</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Author</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">ISBN</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Category</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Format</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Quantity</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Cost</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Price (Incl.)</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Total Value</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((book, index) => (
                      <tr
                        key={`${book.isbn}-${index}`}
                        className={`border-b border-border hover:bg-muted/50 transition-colors ${
                          book.quantity <= 5 ? "bg-destructive/5" : "" // Using 5 as default threshold
                        }`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {book.quantity <= 5 && (
                              <AlertTriangle className="w-4 h-4 text-destructive" />
                            )}
                            <span className="font-medium text-foreground">{book.title}</span>
                          </div>
                        </td>
                        <td className="p-3 text-foreground">{book.author}</td>
                        <td className="p-3 text-muted-foreground font-mono text-sm">{book.isbn}</td>
                        <td className="p-3">
                          <Badge variant="secondary">{book.category}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">{book.format}</Badge>
                        </td>
                        <td className="p-3">
                          <span
                            className={`font-medium ${
                              book.quantity <= 5 ? "text-destructive" : "text-foreground"
                            }`}
                          >
                            {book.quantity}
                          </span>
                        </td>
                        <td className="p-3 text-foreground">${book.cost.toFixed(2)}</td>
                        <td className="p-3 text-foreground">${calculatePriceIncl(book.cost)}</td>
                        <td className="p-3 font-medium text-foreground">${calculateTotalValue(book.quantity, book.cost)}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}