import { Plus, Edit, Trash2, Star, Calculator } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export default function TaxSettings() {
  const taxRates = [
    {
      id: 1,
      name: "Standard VAT",
      rate: 15.0,
      isDefault: true,
      effectiveDate: "2024-01-01",
      description: "Standard VAT rate for most books"
    },
    {
      id: 2,
      name: "Educational Books",
      rate: 0.0,
      isDefault: false,
      effectiveDate: "2024-01-01",
      description: "Zero-rated VAT for educational materials"
    },
    {
      id: 3,
      name: "Luxury Items",
      rate: 20.0,
      isDefault: false,
      effectiveDate: "2024-01-01",
      description: "Higher VAT rate for premium books and collectibles"
    }
  ];

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tax Settings</h1>
            <p className="text-muted-foreground">Manage VAT rates and tax configurations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add New Tax Rate */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-card border border-border shadow-card-soft">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Tax Rate
              </h3>
              
              <form className="space-y-4">
                <div>
                  <Label htmlFor="taxName" className="text-sm font-medium text-foreground">
                    Tax Rate Name
                  </Label>
                  <Input 
                    id="taxName"
                    placeholder="e.g., Standard VAT"
                    className="bg-background mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="taxRate" className="text-sm font-medium text-foreground">
                    Rate (%)
                  </Label>
                  <Input 
                    id="taxRate"
                    type="number"
                    step="0.01"
                    placeholder="15.00"
                    className="bg-background mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="effectiveDate" className="text-sm font-medium text-foreground">
                    Effective Date
                  </Label>
                  <Input 
                    id="effectiveDate"
                    type="date"
                    className="bg-background mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-foreground">
                    Description
                  </Label>
                  <Textarea 
                    id="description"
                    placeholder="Description of when this tax rate applies..."
                    className="bg-background mt-1"
                    rows={3}
                  />
                </div>

                <Button variant="accent" className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Add Tax Rate
                </Button>
              </form>
            </Card>
          </div>

          {/* Current Tax Rates */}
          <div className="lg:col-span-2 space-y-6">
            {/* Default Tax Rate */}
            <Card className="p-6 bg-card border border-border shadow-card-soft">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-gold" />
                <h3 className="text-lg font-semibold text-foreground">Current Default Tax Rate</h3>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-accent rounded-lg">
                <div>
                  <h4 className="font-semibold text-accent-foreground">Standard VAT</h4>
                  <p className="text-sm text-accent-foreground/80">Applied to most book sales</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-accent-foreground">15.0%</div>
                  <p className="text-sm text-accent-foreground/80">Effective since Jan 1, 2024</p>
                </div>
              </div>
            </Card>

            {/* All Tax Rates */}
            <Card className="p-6 bg-card border border-border shadow-card-soft">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">All Tax Rates</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Name</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Rate</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Effective Date</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Description</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxRates.map((rate) => (
                      <tr key={rate.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {rate.isDefault && <Star className="w-4 h-4 text-gold" />}
                            <span className="font-medium text-foreground">{rate.name}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-lg font-semibold text-foreground">{rate.rate}%</span>
                        </td>
                        <td className="p-3">
                          {rate.isDefault ? (
                            <Badge className="bg-gold text-gold-foreground">Default</Badge>
                          ) : (
                            <Button variant="outline" size="sm">
                              Set Default
                            </Button>
                          )}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(rate.effectiveDate).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-muted-foreground max-w-xs truncate">
                          {rate.description}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            {!rate.isDefault && (
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}