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

interface Book {
  book_id: number;
  title: string;
  author: string;
  isbn: string;
  grade: string;
  subject: string;
  quantity: number;
  threshold: number;
  price_excl: number;
  vat_rate: number;
  publisher: string;
}

export default function Inventory() {
  const [books, setBooks] = useState<Book[]>([
    {
      book_id: 1,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      isbn: "978-0-06-112008-4",
      grade: "High School",
      subject: "Literature",
      quantity: 2,
      threshold: 5,
      price_excl: 12.99,
      vat_rate: 15,
      publisher: "HarperCollins"
    },
    {
      book_id: 2,
      title: "1984",
      author: "George Orwell",
      isbn: "978-0-452-28423-4",
      grade: "High School",
      subject: "Literature",
      quantity: 8,
      threshold: 3,
      price_excl: 13.50,
      vat_rate: 15,
      publisher: "Penguin Books"
    },
    {
      book_id: 3,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "978-0-7432-7356-5",
      grade: "High School",
      subject: "Literature",
      quantity: 3,
      threshold: 8,
      price_excl: 11.99,
      vat_rate: 15,
      publisher: "Scribner"
    },
  ]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [csvData, setCsvData] = useState<Book[]>([]);
  const [csvErrors, setCsvErrors] = useState<{ row: number; message: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { CSVReader } = useCSVReader()
  // Fetch books on mount and after upload
  useEffect(() => {
    fetchBooks();
  }, [searchQuery]);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tenants/:tenant_id/books?search=${searchQuery}`);
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("Failed to fetch books:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePriceIncl = (priceExcl: number, vatRate: number) => {
    return (priceExcl * (1 + vatRate / 100)).toFixed(2);
  };

  const calculateTotalValue = (quantity: number, priceExcl: number, vatRate: number) => {
    return (quantity * parseFloat(calculatePriceIncl(priceExcl, vatRate))).toFixed(2);
  };

  // Handle CSV upload with react-papaparse
  const handleCsvUpload = (results: any) => {
    const data = results.data;
    const parsedBooks: Book[] = data.map((row: any, index: number) => {
      const book = {
        book_id: 0, // Assigned by backend
        title: row.title?.trim() || "",
        author: row.author?.trim() || "",
        isbn: row.isbn?.trim() || "",
        publisher: row.publisher?.trim() || "",
        grade: row.grade?.trim() || "",
        subject: row.subject?.trim() || "",
        quantity: parseInt(row.quantity) || 0,
        threshold: parseInt(row.threshold) || 0,
        price_excl: parseFloat(row.price_excl) || 0,
        vat_rate: parseFloat(row.vat_rate) || 0,
      };

      // Client-side validation
      const errors: string[] = [];
      if (!book.title) errors.push("Missing title");
      if (!book.author) errors.push("Missing author");
      if (!book.isbn || !/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$)[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/.test(book.isbn)) errors.push("Invalid ISBN");
      if (!book.publisher) errors.push("Missing publisher");
      if (!book.grade) errors.push("Missing grade");
      if (!book.subject) errors.push("Missing subject");
      if (book.quantity <= 0) errors.push("Invalid quantity");
      if (book.threshold < 0) errors.push("Invalid threshold");
      if (book.price_excl < 0) errors.push("Invalid price");
      if (book.vat_rate < 0) errors.push("Invalid VAT rate");

      if (errors.length > 0) {
        setCsvErrors((prev) => [...prev, { row: index + 1, message: errors.join(", ") }]);
        return null;
      }
      return book;
    }).filter((book): book is Book => book !== null);

    setCsvData(parsedBooks);
    setCsvErrors((prev) => prev.filter((error) => !parsedBooks.some((_, i) => i + 1 === error.row)));
  };

  // Submit parsed CSV data to backend
  const handleSubmit = async () => {
    if (csvData.length === 0) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/tenants/:tenant_id/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(csvData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setCsvErrors(errorData.errors || []);
        return;
      }
      setIsUploadOpen(false);
      setCsvData([]);
      setCsvErrors([]);
      await fetchBooks(); // Refresh table
    } catch (error) {
      console.error("Failed to upload books:", error);
      setCsvErrors([{ row: 0, message: "Network error" }]);
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
                    Upload a CSV file with columns: isbn, title, author, publisher, grade, subject, quantity, threshold, price_excl, vat_rate.{' '}
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

                  {/* Animate data preview */}
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
                                <th className="text-left p-2 text-sm font-medium text-muted-foreground">Grade</th>
                                <th className="text-left p-2 text-sm font-medium text-muted-foreground">Subject</th>
                                <th className="text-left p-2 text-sm font-medium text-muted-foreground">Quantity</th>
                                <th className="text-left p-2 text-sm font-medium text-muted-foreground">Threshold</th>
                                <th className="text-left p-2 text-sm font-medium text-muted-foreground">Price (Excl.)</th>
                                <th className="text-left p-2 text-sm font-medium text-muted-foreground">VAT %</th>
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
                                  <td className="p-2">{book.grade}</td>
                                  <td className="p-2">{book.subject}</td>
                                  <td className="p-2">{book.quantity}</td>
                                  <td className="p-2">{book.threshold}</td>
                                  <td className="p-2">${book.price_excl.toFixed(2)}</td>
                                  <td className="p-2">{book.vat_rate}%</td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Animate action buttons */}
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

        {/* Stats Cards */}
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
            value={`$${books.reduce((sum, book) => sum + parseFloat(calculateTotalValue(book.quantity, book.price_excl, book.vat_rate)), 0).toFixed(2)}`}
            icon={<Package className="w-6 h-6 text-gold" />}
          />
          <StatsCard
            title="Low Stock Items"
            value={books.filter((book) => book.quantity <= book.threshold).length.toString()}
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
              <Button variant="outline">Grade</Button>
              <Button variant="outline">Subject</Button>
              <Button variant="outline">Publisher</Button>
            </div>
          </div>
        </Card>

        {/* Books Table */}
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
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Quantity</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Price (Excl.)</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">VAT %</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Price (Incl.)</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Total Value</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((book) => (
                      <tr
                        key={book.book_id}
                        className={`border-b border-border hover:bg-muted/50 transition-colors ${
                          book.quantity <= book.threshold ? "bg-destructive/5" : ""
                        }`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {book.quantity <= book.threshold && (
                              <AlertTriangle className="w-4 h-4 text-destructive" />
                            )}
                            <span className="font-medium text-foreground">{book.title}</span>
                          </div>
                        </td>
                        <td className="p-3 text-foreground">{book.author}</td>
                        <td className="p-3 text-muted-foreground font-mono text-sm">{book.isbn}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Badge variant="secondary">{book.grade}</Badge>
                            <Badge variant="outline">{book.subject}</Badge>
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`font-medium ${
                              book.quantity <= book.threshold ? "text-destructive" : "text-foreground"
                            }`}
                          >
                            {book.quantity}
                          </span>
                        </td>
                        <td className="p-3 text-foreground">${book.price_excl.toFixed(2)}</td>
                        <td className="p-3 text-muted-foreground">{book.vat_rate}%</td>
                        <td className="p-3 text-foreground">${calculatePriceIncl(book.price_excl, book.vat_rate)}</td>
                        <td className="p-3 font-medium text-foreground">${calculateTotalValue(book.quantity, book.price_excl, book.vat_rate)}</td>
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