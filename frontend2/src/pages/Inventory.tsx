import { Search, Plus, Package, AlertTriangle, Edit, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddBookModal } from "@/components/AddBookModal";
import { useState } from "react";

export default function Inventory() {
  const [books, setBooks] = useState([
    {
      id: 1,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      isbn: "978-0-06-112008-4",
      grade: "High School",
      subject: "Literature",
      quantity: 2,
      threshold: 5,
      priceExcl: 12.99,
      vatRate: 15,
      publisher: "HarperCollins"
    },
    {
      id: 2,
      title: "1984",
      author: "George Orwell",
      isbn: "978-0-452-28423-4",
      grade: "High School",
      subject: "Literature",
      quantity: 8,
      threshold: 3,
      priceExcl: 13.50,
      vatRate: 15,
      publisher: "Penguin Books"
    },
    {
      id: 3,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "978-0-7432-7356-5",
      grade: "High School",
      subject: "Literature",
      quantity: 3,
      threshold: 8,
      priceExcl: 11.99,
      vatRate: 15,
      publisher: "Scribner"
    },
  ]);

  const calculatePriceIncl = (priceExcl: number, vatRate: number) => {
    return (priceExcl * (1 + vatRate / 100)).toFixed(2);
  };

  const calculateTotalValue = (quantity: number, priceExcl: number, vatRate: number) => {
    return (quantity * parseFloat(calculatePriceIncl(priceExcl, vatRate))).toFixed(2);
  };

  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);

  const handleAddBooks = (newBooks) => {
    setBooks((prevBooks) => [
      ...prevBooks,
      ...newBooks.map((book, index) => ({
        ...book,
        id: prevBooks.length + index + 1, // Simple ID generation; replace with a more robust method (e.g., UUID) in production
      })),
    ]);
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
          <Button variant="premium" size="lg" className="gap-2" onClick={() => setIsAddBookModalOpen(true)}>
            <Plus className="w-5 h-5" />
            Add New Book
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Books"
            value="1,247"
            icon={<Package className="w-6 h-6 text-primary" />}
          />
          <StatsCard
            title="Total Quantity"
            value="8,943"
            icon={<Package className="w-6 h-6 text-accent" />}
          />
          <StatsCard
            title="Inventory Value"
            value="$89,432"
            icon={<Package className="w-6 h-6 text-gold" />}
          />
          <StatsCard
            title="Low Stock Items"
            value="18"
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
                      key={book.id} 
                      className={`border-b border-border hover:bg-muted/50 transition-colors ${
                        book.quantity <= book.threshold ? 'bg-destructive/5' : ''
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
                        <span className={`font-medium ${
                          book.quantity <= book.threshold ? 'text-destructive' : 'text-foreground'
                        }`}>
                          {book.quantity}
                        </span>
                      </td>
                      <td className="p-3 text-foreground">${book.priceExcl}</td>
                      <td className="p-3 text-muted-foreground">{book.vatRate}%</td>
                      <td className="p-3 text-foreground">${calculatePriceIncl(book.priceExcl, book.vatRate)}</td>
                      <td className="p-3 font-medium text-foreground">${calculateTotalValue(book.quantity, book.priceExcl, book.vatRate)}</td>
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
          </div>
        </Card>
      </div>
      <AddBookModal
        isOpen={isAddBookModalOpen}
        onClose={() => setIsAddBookModalOpen(false)}
        onAddBooks={handleAddBooks}
      />
    </AppLayout>
  );
}