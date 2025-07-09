import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Receipt, ShoppingCart, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SaleItem {
  id: string
  title: string
  isbn: string
  quantity: number
  unitPrice: number
  vatRate: number
  lineTotal: number
}

export default function Sales() {
  const { toast } = useToast()
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [selectedBook, setSelectedBook] = useState("")
  const [quantity, setQuantity] = useState(1)

  const mockBooks = [
    { id: "1", title: "English Grade 5", isbn: "978-9966-25-123-4", price: 450, vatRate: 16 },
    { id: "2", title: "Mathematics Grade 3", isbn: "978-9966-25-124-1", price: 380, vatRate: 16 },
    { id: "3", title: "Science Grade 7", isbn: "978-9966-25-125-8", price: 520, vatRate: 16 }
  ]

  const addToSale = () => {
    if (!selectedBook) return
    
    const book = mockBooks.find(b => b.id === selectedBook)
    if (!book) return

    const unitPriceWithVat = book.price * (1 + book.vatRate / 100)
    const lineTotal = unitPriceWithVat * quantity

    const newItem: SaleItem = {
      id: Date.now().toString(),
      title: book.title,
      isbn: book.isbn,
      quantity,
      unitPrice: unitPriceWithVat,
      vatRate: book.vatRate,
      lineTotal
    }

    setSaleItems([...saleItems, newItem])
    setSelectedBook("")
    setQuantity(1)
  }

  const removeItem = (id: string) => {
    setSaleItems(saleItems.filter(item => item.id !== id))
  }

  const subtotal = saleItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity / (1 + item.vatRate / 100)), 0)
  const totalVAT = saleItems.reduce((sum, item) => sum + (item.lineTotal - (item.unitPrice * item.quantity / (1 + item.vatRate / 100))), 0)
  const grandTotal = saleItems.reduce((sum, item) => sum + item.lineTotal, 0)

  const generateReceipt = () => {
    if (saleItems.length === 0) {
      toast({
        title: "No items",
        description: "Please add items to the sale before generating a receipt.",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Receipt generated",
      description: `Receipt for KES ${grandTotal.toFixed(2)} has been generated.`
    })
    
    // Reset sale
    setSaleItems([])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales</h1>
          <p className="text-muted-foreground">Process book sales and generate receipts</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Add Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Add Items to Sale
            </CardTitle>
            <CardDescription>
              Select books and add them to the current sale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="book-select">Select Book</Label>
              <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a book" />
                </SelectTrigger>
                <SelectContent>
                  {mockBooks.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.title} - KES {book.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            
            <Button onClick={addToSale} className="w-full" disabled={!selectedBook}>
              <Plus className="h-4 w-4 mr-2" />
              Add to Sale
            </Button>
          </CardContent>
        </Card>

        {/* Sale Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Sale Summary</CardTitle>
            <CardDescription>Current sale totals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal (excl. VAT):</span>
                <span>KES {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total VAT:</span>
                <span>KES {totalVAT.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Grand Total:</span>
                <span>KES {grandTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <Button 
              onClick={generateReceipt}
              className="w-full"
              disabled={saleItems.length === 0}
            >
              <Receipt className="h-4 w-4 mr-2" />
              Generate Receipt
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sale Items Table */}
      {saleItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sale Items</CardTitle>
            <CardDescription>Items in current sale</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>ISBN</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>VAT %</TableHead>
                  <TableHead>Line Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saleItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.isbn}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>KES {item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>{item.vatRate}%</TableCell>
                    <TableCell>KES {item.lineTotal.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}