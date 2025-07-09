import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Calendar, TrendingUp, Package, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Reports() {
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState({
    from: "2024-01-01",
    to: "2024-12-31"
  })

  const mockSalesData = [
    { period: "January 2024", sales: 45000, transactions: 156, avgOrder: 288.46 },
    { period: "February 2024", sales: 52000, transactions: 178, avgOrder: 292.13 },
    { period: "March 2024", sales: 48500, transactions: 165, avgOrder: 293.94 }
  ]

  const mockBestSellers = [
    { title: "English Grade 5", isbn: "978-9966-25-123-4", unitsSold: 45, revenue: 20250 },
    { title: "Mathematics Grade 3", isbn: "978-9966-25-124-1", unitsSold: 38, revenue: 14440 },
    { title: "Science Grade 7", isbn: "978-9966-25-125-8", unitsSold: 32, revenue: 16640 }
  ]

  const mockLowStock = [
    { title: "Social Studies Grade 6", isbn: "978-9966-25-126-5", current: 5, minimum: 10, status: "Critical" },
    { title: "Kiswahili Grade 4", isbn: "978-9966-25-127-2", current: 8, minimum: 15, status: "Low" },
    { title: "English Grade 8", isbn: "978-9966-25-128-9", current: 12, minimum: 20, status: "Low" }
  ]

  const mockInventoryValue = [
    { category: "Primary Textbooks", value: 125000, vatIncluded: 145000, percentage: 45 },
    { category: "Secondary Textbooks", value: 98000, vatIncluded: 113680, percentage: 35 },
    { category: "Reference Materials", value: 56000, vatIncluded: 64960, percentage: 20 }
  ]

  const exportReport = (reportType: string) => {
    toast({
      title: "Export started",
      description: `${reportType} report is being prepared for download.`
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Analytics and insights for your bookshop</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Label htmlFor="date-from">From:</Label>
          <Input
            id="date-from"
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
            className="w-auto"
          />
          <Label htmlFor="date-to">To:</Label>
          <Input
            id="date-to"
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
            className="w-auto"
          />
        </div>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Sales Reports</TabsTrigger>
          <TabsTrigger value="bestsellers">Best Sellers</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="lowstock">Low Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Sales Performance</h2>
            <Button onClick={() => exportReport("Sales")} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES 145,500</div>
                <p className="text-xs text-muted-foreground">+12% from last period</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">499</div>
                <p className="text-xs text-muted-foreground">+5% from last period</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Order</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES 291.58</div>
                <p className="text-xs text-muted-foreground">+7% from last period</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales Summary</CardTitle>
              <CardDescription>Sales performance by month</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Avg. Order Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSalesData.map((period, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{period.period}</TableCell>
                      <TableCell>KES {period.sales.toLocaleString()}</TableCell>
                      <TableCell>{period.transactions}</TableCell>
                      <TableCell>KES {period.avgOrder.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bestsellers" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Best Selling Books</h2>
            <Button onClick={() => exportReport("Best Sellers")} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Titles</CardTitle>
              <CardDescription>Books with highest sales volume and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Units Sold</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBestSellers.map((book, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.isbn}</TableCell>
                      <TableCell>{book.unitsSold}</TableCell>
                      <TableCell>KES {book.revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Inventory Valuation</h2>
            <Button onClick={() => exportReport("Inventory")} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Value by Category</CardTitle>
              <CardDescription>Current stock valuation including and excluding VAT</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Value (excl. VAT)</TableHead>
                    <TableHead>Value (incl. VAT)</TableHead>
                    <TableHead>% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInventoryValue.map((category, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{category.category}</TableCell>
                      <TableCell>KES {category.value.toLocaleString()}</TableCell>
                      <TableCell>KES {category.vatIncluded.toLocaleString()}</TableCell>
                      <TableCell>{category.percentage}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lowstock" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Low Stock Alerts</h2>
            <Button onClick={() => exportReport("Low Stock")} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export List
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Items Requiring Attention
              </CardTitle>
              <CardDescription>Books that are below minimum stock levels</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Minimum Level</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLowStock.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{item.isbn}</TableCell>
                      <TableCell>{item.current}</TableCell>
                      <TableCell>{item.minimum}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'Critical' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}