"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Package, Search, Edit, Trash2, AlertTriangle, Filter } from "lucide-react"

interface Book {
  id: string
  isbn: string
  title: string
  author: string
  publisher: string
  grade: string
  subject: string
  quantity: number
  priceExclVat: number
  vatRate: number
  priceInclVat: number
  totalValue: number
  lowStockThreshold: number
}

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [gradeFilter, setGradeFilter] = useState("all")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [publisherFilter, setPublisherFilter] = useState("all")

  // Mock data - in real app this would come from API
  const [books] = useState<Book[]>([
    {
      id: "1",
      isbn: "978-9966-46-123-4",
      title: "Mathematics Grade 5 Learner's Book",
      author: "Jane Wanjiku",
      publisher: "Kenya Literature Bureau",
      grade: "Grade 5",
      subject: "Mathematics",
      quantity: 25,
      priceExclVat: 450.00,
      vatRate: 16,
      priceInclVat: 522.00,
      totalValue: 13050.00,
      lowStockThreshold: 10
    },
    {
      id: "2", 
      isbn: "978-9966-46-567-8",
      title: "Kiswahili Grade 7 Activity Book",
      author: "Peter Kimani",
      publisher: "Longhorn Publishers",
      grade: "Grade 7",
      subject: "Kiswahili",
      quantity: 5,
      priceExclVat: 380.00,
      vatRate: 16,
      priceInclVat: 440.80,
      totalValue: 2204.00,
      lowStockThreshold: 15
    },
    {
      id: "3",
      isbn: "978-9966-46-789-2",
      title: "Science Grade 8 Textbook",
      author: "Mary Njoki",
      publisher: "East African Publishers",
      grade: "Grade 8", 
      subject: "Science",
      quantity: 2,
      priceExclVat: 520.00,
      vatRate: 16,
      priceInclVat: 603.20,
      totalValue: 1206.40,
      lowStockThreshold: 12
    }
  ])

  const isLowStock = (book: Book) => book.quantity <= book.lowStockThreshold

  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm)
    
    const matchesGrade = gradeFilter === "all" || book.grade === gradeFilter
    const matchesSubject = subjectFilter === "all" || book.subject === subjectFilter  
    const matchesPublisher = publisherFilter === "all" || book.publisher === publisherFilter

    return matchesSearch && matchesGrade && matchesSubject && matchesPublisher
  })

  const totalInventoryValue = books.reduce((sum, book) => sum + book.totalValue, 0)
  const lowStockCount = books.filter(isLowStock).length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Inventory</h1>
          <p className="text-muted-foreground">Manage your book inventory and stock levels</p>
        </div>
        
        <Button className="bg-gradient-primary hover:bg-kicd-navy-light">
          <Plus className="mr-2 h-4 w-4" />
          Add New Book
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-kicd-navy">{books.length}</div>
            <p className="text-xs text-muted-foreground">Different titles</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-kicd-coral">
              {books.reduce((sum, book) => sum + book.quantity, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Books in stock</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-kicd-navy">
              KSh {totalInventoryValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Including VAT</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Need reordering</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Book Inventory</CardTitle>
              <CardDescription>Manage stock levels, pricing, and book details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="Grade 1">Grade 1</SelectItem>
                <SelectItem value="Grade 2">Grade 2</SelectItem>
                <SelectItem value="Grade 3">Grade 3</SelectItem>
                <SelectItem value="Grade 4">Grade 4</SelectItem>
                <SelectItem value="Grade 5">Grade 5</SelectItem>
                <SelectItem value="Grade 6">Grade 6</SelectItem>
                <SelectItem value="Grade 7">Grade 7</SelectItem>
                <SelectItem value="Grade 8">Grade 8</SelectItem>
              </SelectContent>
            </Select>

            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Kiswahili">Kiswahili</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="Social Studies">Social Studies</SelectItem>
                <SelectItem value="Religious Education">Religious Education</SelectItem>
              </SelectContent>
            </Select>

            <Select value={publisherFilter} onValueChange={setPublisherFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Publisher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Publishers</SelectItem>
                <SelectItem value="Kenya Literature Bureau">Kenya Literature Bureau</SelectItem>
                <SelectItem value="Longhorn Publishers">Longhorn Publishers</SelectItem>
                <SelectItem value="East African Publishers">East African Publishers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book Details</TableHead>
                  <TableHead>Grade/Subject</TableHead>
                  <TableHead>Publisher</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Price (Excl. VAT)</TableHead>
                  <TableHead className="text-center">VAT %</TableHead>
                  <TableHead className="text-right">Price (Incl. VAT)</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.map((book) => (
                  <TableRow 
                    key={book.id}
                    className={isLowStock(book) ? "bg-destructive/5 hover:bg-destructive/10" : ""}
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-foreground">{book.title}</div>
                          {isLowStock(book) && (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">by {book.author}</div>
                        <div className="text-xs text-muted-foreground font-mono">{book.isbn}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-xs">{book.grade}</Badge>
                        <div className="text-sm text-muted-foreground">{book.subject}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-foreground">{book.publisher}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="space-y-1">
                        <div className={`font-medium ${isLowStock(book) ? 'text-destructive' : 'text-foreground'}`}>
                          {book.quantity}
                        </div>
                        {isLowStock(book) && (
                          <div className="text-xs text-destructive">Low Stock</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-mono text-sm">KSh {book.priceExclVat.toLocaleString()}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {book.vatRate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-mono text-sm font-medium">KSh {book.priceInclVat.toLocaleString()}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-mono text-sm font-medium text-kicd-navy">
                        KSh {book.totalValue.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredBooks.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">No books found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}