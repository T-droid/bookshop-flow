import { ShoppingCart, Plus, Trash2, Receipt } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function Sales() {
  const [saleItems, setSaleItems] = useState([
    {
      id: 1,
      title: "To Kill a Mockingbird",
      isbn: "978-0-06-112008-4",
      quantity: 2,
      unitPrice: 14.99,
      vatRate: 15
    },
    {
      id: 2,
      title: "1984",
      isbn: "978-0-452-28423-4",
      quantity: 1,
      unitPrice: 15.53,
      vatRate: 15
    }
  ]);

  const calculateLineTotal = (quantity: number, unitPrice: number, vatRate: number) => {
    return quantity * unitPrice;
  };

  const calculateVAT = (lineTotal: number, vatRate: number) => {
    return (lineTotal * vatRate) / (100 + vatRate);
  };

  const subtotal = saleItems.reduce((sum, item) => sum + calculateLineTotal(item.quantity, item.unitPrice, item.vatRate), 0);
  const totalVAT = saleItems.reduce((sum, item) => {
    const lineTotal = calculateLineTotal(item.quantity, item.unitPrice, item.vatRate);
    return sum + calculateVAT(lineTotal, item.vatRate);
  }, 0);
  const grandTotal = subtotal;

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Point of Sale</h1>
            <p className="text-muted-foreground">Process sales and generate receipts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Pane: Add Items */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-card border border-border shadow-card-soft">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Items to Sale
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Select Book
                  </label>
                  <Select>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Search for a book..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="book1">To Kill a Mockingbird - $14.99</SelectItem>
                      <SelectItem value="book2">1984 - $15.53</SelectItem>
                      <SelectItem value="book3">The Great Gatsby - $13.79</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Quantity
                  </label>
                  <Input 
                    type="number" 
                    min="1" 
                    defaultValue="1"
                    className="bg-background"
                  />
                </div>

                <Button variant="accent" className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Add to Sale
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Pane: Sale Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sale Summary */}
            <Card className="p-6 bg-card border border-border shadow-card-soft">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Sale Summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between text-foreground">
                  <span>Subtotal (incl. VAT):</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>VAT Total:</span>
                  <span>${totalVAT.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-foreground border-t border-border pt-2">
                  <span>Grand Total:</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>

                <Button 
                  variant="premium" 
                  size="lg" 
                  className="w-full gap-2"
                  disabled={saleItems.length === 0}
                >
                  <Receipt className="w-5 h-5" />
                  Generate Receipt
                </Button>
              </div>
            </Card>

            {/* Current Sale Items */}
            <Card className="p-6 bg-card border border-border shadow-card-soft">
              <h3 className="text-lg font-semibold text-foreground mb-4">Current Sale Items</h3>
              
              {saleItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No items in current sale</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Title</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Quantity</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Unit Price</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">VAT</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Line Total</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saleItems.map((item) => {
                        const lineTotal = calculateLineTotal(item.quantity, item.unitPrice, item.vatRate);
                        const vat = calculateVAT(lineTotal, item.vatRate);
                        
                        return (
                          <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="p-3">
                              <div>
                                <div className="font-medium text-foreground">{item.title}</div>
                                <div className="text-sm text-muted-foreground font-mono">{item.isbn}</div>
                              </div>
                            </td>
                            <td className="p-3 text-foreground">{item.quantity}</td>
                            <td className="p-3 text-foreground">${item.unitPrice.toFixed(2)}</td>
                            <td className="p-3 text-muted-foreground">${vat.toFixed(2)}</td>
                            <td className="p-3 font-medium text-foreground">${lineTotal.toFixed(2)}</td>
                            <td className="p-3">
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}