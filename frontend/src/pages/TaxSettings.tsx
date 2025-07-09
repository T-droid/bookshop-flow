import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calculator, Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TaxRate {
  id: string
  name: string
  rate: number
  isDefault: boolean
  effectiveDate: string
  description: string
}

export default function TaxSettings() {
  const { toast } = useToast()
  const [taxRates, setTaxRates] = useState<TaxRate[]>([
    {
      id: "1",
      name: "Standard VAT",
      rate: 16,
      isDefault: true,
      effectiveDate: "2023-01-01",
      description: "Standard VAT rate for books"
    },
    {
      id: "2", 
      name: "Zero Rated",
      rate: 0,
      isDefault: false,
      effectiveDate: "2023-01-01",
      description: "Zero-rated books (educational materials)"
    }
  ])
  
  const [newTaxRate, setNewTaxRate] = useState({
    name: "",
    rate: "",
    effectiveDate: "",
    description: ""
  })

  const addTaxRate = () => {
    if (!newTaxRate.name || !newTaxRate.rate || !newTaxRate.effectiveDate) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    const taxRate: TaxRate = {
      id: Date.now().toString(),
      name: newTaxRate.name,
      rate: parseFloat(newTaxRate.rate),
      isDefault: false,
      effectiveDate: newTaxRate.effectiveDate,
      description: newTaxRate.description
    }

    setTaxRates([...taxRates, taxRate])
    setNewTaxRate({ name: "", rate: "", effectiveDate: "", description: "" })
    
    toast({
      title: "Tax rate added",
      description: `${taxRate.name} has been added successfully.`
    })
  }

  const setAsDefault = (id: string) => {
    setTaxRates(rates => 
      rates.map(rate => ({
        ...rate,
        isDefault: rate.id === id
      }))
    )
    
    toast({
      title: "Default tax rate updated",
      description: "Default tax rate has been changed."
    })
  }

  const deleteTaxRate = (id: string) => {
    const rateToDelete = taxRates.find(rate => rate.id === id)
    if (rateToDelete?.isDefault) {
      toast({
        title: "Cannot delete",
        description: "Cannot delete the default tax rate.",
        variant: "destructive"
      })
      return
    }

    setTaxRates(rates => rates.filter(rate => rate.id !== id))
    toast({
      title: "Tax rate deleted",
      description: "Tax rate has been removed."
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tax Settings</h1>
          <p className="text-muted-foreground">Manage VAT rates and tax configurations</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Add New Tax Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Tax Rate
            </CardTitle>
            <CardDescription>
              Create a new VAT rate configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tax-name">Tax Rate Name *</Label>
              <Input
                id="tax-name"
                placeholder="e.g., Standard VAT"
                value={newTaxRate.name}
                onChange={(e) => setNewTaxRate({...newTaxRate, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tax-rate">Rate (%) *</Label>
              <Input
                id="tax-rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="16"
                value={newTaxRate.rate}
                onChange={(e) => setNewTaxRate({...newTaxRate, rate: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="effective-date">Effective Date *</Label>
              <Input
                id="effective-date"
                type="date"
                value={newTaxRate.effectiveDate}
                onChange={(e) => setNewTaxRate({...newTaxRate, effectiveDate: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Optional description"
                value={newTaxRate.description}
                onChange={(e) => setNewTaxRate({...newTaxRate, description: e.target.value})}
              />
            </div>
            
            <Button onClick={addTaxRate} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Tax Rate
            </Button>
          </CardContent>
        </Card>

        {/* Current Settings Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Current Settings
            </CardTitle>
            <CardDescription>Active tax configuration summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {taxRates.find(rate => rate.isDefault) && (
              <div className="p-4 bg-accent rounded-lg">
                <h3 className="font-semibold text-accent-foreground mb-2">Default Tax Rate</h3>
                <p className="text-2xl font-bold text-accent-foreground">
                  {taxRates.find(rate => rate.isDefault)?.rate}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {taxRates.find(rate => rate.isDefault)?.name}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <h4 className="font-medium">Quick Stats</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Total tax rates:</span>
                  <span>{taxRates.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Zero-rated items:</span>
                  <span>{taxRates.filter(rate => rate.rate === 0).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard rates:</span>
                  <span>{taxRates.filter(rate => rate.rate > 0).length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tax Rates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Rates</CardTitle>
          <CardDescription>All configured tax rates for the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxRates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell className="font-medium">{rate.name}</TableCell>
                  <TableCell>{rate.rate}%</TableCell>
                  <TableCell>
                    {rate.isDefault ? (
                      <Badge>Default</Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAsDefault(rate.id)}
                      >
                        Set Default
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>{rate.effectiveDate}</TableCell>
                  <TableCell>{rate.description}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTaxRate(rate.id)}
                        disabled={rate.isDefault}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}