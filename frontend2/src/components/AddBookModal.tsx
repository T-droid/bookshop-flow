import { Plus, X, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function AddBookModal({ isOpen, onClose, onAddBooks }) {
  const [books, setBooks] = useState([
    {
      title: "",
      author: "",
      isbn: "",
      grade: "",
      subject: "",
      quantity: 1,
      threshold: 5,
      priceExcl: 0,
      vatRate: 15,
      publisher: "",
    },
  ]);

  const grades = ["Grade 1", "Grade 2", "Grade 3", "High School", "College"];
  const subjects = ["Literature", "Mathematics", "Science", "History"];
  const publishers = ["HarperCollins", "Penguin Books", "Scribner", "Random House"];

  const addBookEntry = () => {
    setBooks([
      ...books,
      {
        title: "",
        author: "",
        isbn: "",
        grade: "",
        subject: "",
        quantity: 1,
        threshold: 5,
        priceExcl: 0,
        vatRate: 15,
        publisher: "",
      },
    ]);
  };

  const updateBook = (index, field, value) => {
    const updatedBooks = [...books];
    updatedBooks[index][field] = value;
    setBooks(updatedBooks);
  };

  const removeBook = (index) => {
    setBooks(books.filter((_, i) => i !== index));
  };

  const validateBooks = () => {
    return books.every((book) => {
      return (
        book.title.trim() &&
        book.author.trim() &&
        book.isbn.trim() &&
        book.grade &&
        book.subject &&
        book.quantity > 0 &&
        book.threshold >= 0 &&
        book.priceExcl > 0 &&
        book.vatRate >= 0 &&
        book.publisher.trim()
      );
    });
  };

  const handleSubmit = () => {
    if (!validateBooks()) {
      alert("Please fill in all required fields for all books.");
      return;
    }
    onAddBooks(books);
    setBooks([
      {
        title: "",
        author: "",
        isbn: "",
        grade: "",
        subject: "",
        quantity: 1,
        threshold: 5,
        priceExcl: 0,
        vatRate: 15,
        publisher: "",
      },
    ]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-card border border-border">
        <DialogHeader>
          <DialogTitle>Add New Books</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 max-h-[60vh] overflow-y-auto p-4">
          {books.map((book, index) => (
            <Card key={index} className="p-4 bg-card border border-border shadow-card-soft relative">
              {books.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => removeBook(index)}
                >
                  <X className="w-4 h-4 text-destructive" />
                </Button>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`title-${index}`}>Title</Label>
                  <Input
                    id={`title-${index}`}
                    value={book.title}
                    onChange={(e) => updateBook(index, "title", e.target.value)}
                    placeholder="Enter book title"
                  />
                </div>
                <div>
                  <Label htmlFor={`author-${index}`}>Author</Label>
                  <Input
                    id={`author-${index}`}
                    value={book.author}
                    onChange={(e) => updateBook(index, "author", e.target.value)}
                    placeholder="Enter author name"
                  />
                </div>
                <div>
                  <Label htmlFor={`isbn-${index}`}>ISBN</Label>
                  <Input
                    id={`isbn-${index}`}
                    value={book.isbn}
                    onChange={(e) => updateBook(index, "isbn", e.target.value)}
                    placeholder="Enter ISBN"
                  />
                </div>
                <div>
                  <Label htmlFor={`grade-${index}`}>Grade</Label>
                  <Select
                    value={book.grade}
                    onValueChange={(value) => updateBook(index, "grade", value)}
                  >
                    <SelectTrigger id={`grade-${index}`}>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`subject-${index}`}>Subject</Label>
                  <Select
                    value={book.subject}
                    onValueChange={(value) => updateBook(index, "subject", value)}
                  >
                    <SelectTrigger id={`subject-${index}`}>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`publisher-${index}`}>Publisher</Label>
                  <Select
                    value={book.publisher}
                    onValueChange={(value) => updateBook(index, "publisher", value)}
                  >
                    <SelectTrigger id={`publisher-${index}`}>
                      <SelectValue placeholder="Select publisher" />
                    </SelectTrigger>
                    <SelectContent>
                      {publishers.map((publisher) => (
                        <SelectItem key={publisher} value={publisher}>
                          {publisher}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    value={book.quantity}
                    onChange={(e) => updateBook(index, "quantity", parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor={`threshold-${index}`}>Low Stock Threshold</Label>
                  <Input
                    id={`threshold-${index}`}
                    type="number"
                    min="0"
                    value={book.threshold}
                    onChange={(e) => updateBook(index, "threshold", parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor={`priceExcl-${index}`}>Price (Excl. VAT)</Label>
                  <Input
                    id={`priceExcl-${index}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={book.priceExcl}
                    onChange={(e) => updateBook(index, "priceExcl", parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor={`vatRate-${index}`}>VAT Rate (%)</Label>
                  <Input
                    id={`vatRate-${index}`}
                    type="number"
                    step="0.1"
                    min="0"
                    value={book.vatRate}
                    onChange={(e) => updateBook(index, "vatRate", parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </Card>
          ))}
          <Button variant="outline" className="w-full" onClick={addBookEntry}>
            <Plus className="w-4 h-4 mr-2" />
            Add Another Book
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="premium" onClick={handleSubmit}>
            <Save className="w-4 h-4 mr-2" />
            Save Books
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}