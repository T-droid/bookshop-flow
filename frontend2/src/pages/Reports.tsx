import { TrendingUp, Download, Calendar, BookOpen, Package, AlertTriangle } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Reports() {
  const bestSellers = [
    { title: "To Kill a Mockingbird", isbn: "978-0-06-112008-4", unitsSold: 45, revenue: 674.55 },
    { title: "1984", isbn: "978-0-452-28423-4", unitsSold: 38, revenue: 590.14 },
    { title: "The Great Gatsby", isbn: "978-0-7432-7356-5", unitsSold: 32, revenue: 441.28 },
    { title: "Pride and Prejudice", isbn: "978-0-14-143951-8", unitsSold: 28, revenue: 392.72 },
  ];

  const lowStockItems = [
    { title: "To Kill a Mockingbird", isbn: "978-0-06-112008-4", current: 2, minimum: 5, status: "Critical" },
    { title: "The Catcher in the Rye", isbn: "978-0-316-76948-0", current: 3, minimum: 8, status: "Low" },
    { title: "Lord of the Flies", isbn: "978-0-571-05686-2", current: 4, minimum: 10, status: "Low" },
  ];

  const salesData = [
    { month: "January", revenue: 12847, transactions: 243 },
    { month: "February", revenue: 15230, transactions: 298 },
    { month: "March", revenue: 18945, transactions: 367 },
    { month: "April", revenue: 16783, transactions: 324 },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground">Comprehensive business insights and analytics</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Input type="date" className="bg-background" />
              <span className="text-muted-foreground">to</span>
              <Input type="date" className="bg-background" />
            </div>
          </div>
        </div>

        {/* Main Reports Tabs */}
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sales">Sales Reports</TabsTrigger>
            <TabsTrigger value="bestsellers">Best Sellers</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="lowstock">Low Stock</TabsTrigger>
          </TabsList>

          {/* Sales Reports */}
          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Total Revenue"
                value="$63,805"
                change="+15.3% from last period"
                changeType="positive"
                icon={<TrendingUp className="w-6 h-6 text-accent" />}
              />
              <StatsCard
                title="Total Transactions"
                value="1,232"
                change="+8.7% from last period"
                changeType="positive"
                icon={<TrendingUp className="w-6 h-6 text-primary" />}
              />
              <StatsCard
                title="Average Order"
                value="$51.79"
                change="+2.1% from last period"
                changeType="positive"
                icon={<TrendingUp className="w-6 h-6 text-gold" />}
              />
            </div>

            <Card className="p-6 bg-card border border-border shadow-card-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Monthly Sales Summary</h3>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Month</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Revenue</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Transactions</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Avg. Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.map((data, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-3 font-medium text-foreground">{data.month}</td>
                        <td className="p-3 text-foreground">${data.revenue.toLocaleString()}</td>
                        <td className="p-3 text-foreground">{data.transactions}</td>
                        <td className="p-3 text-foreground">${(data.revenue / data.transactions).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Best Sellers */}
          <TabsContent value="bestsellers" className="space-y-6">
            <Card className="p-6 bg-card border border-border shadow-card-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Top Selling Books</h3>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export PDF
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Rank</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Title</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">ISBN</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Units Sold</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bestSellers.map((book, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center text-accent-foreground font-bold">
                            {index + 1}
                          </div>
                        </td>
                        <td className="p-3 font-medium text-foreground">{book.title}</td>
                        <td className="p-3 text-muted-foreground font-mono text-sm">{book.isbn}</td>
                        <td className="p-3 text-foreground">{book.unitsSold}</td>
                        <td className="p-3 font-medium text-foreground">${book.revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Inventory Value */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Total Inventory Value"
                value="$89,432"
                icon={<Package className="w-6 h-6 text-primary" />}
              />
              <StatsCard
                title="Total Books"
                value="1,247"
                icon={<BookOpen className="w-6 h-6 text-accent" />}
              />
              <StatsCard
                title="Total Quantity"
                value="8,943"
                icon={<Package className="w-6 h-6 text-gold" />}
              />
            </div>

            <Card className="p-6 bg-card border border-border shadow-card-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Inventory by Category</h3>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export Report
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Literature</h4>
                  <p className="text-2xl font-bold text-foreground">$45,230</p>
                  <p className="text-sm text-muted-foreground">50.6% of total</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Science</h4>
                  <p className="text-2xl font-bold text-foreground">$23,180</p>
                  <p className="text-sm text-muted-foreground">25.9% of total</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">History</h4>
                  <p className="text-2xl font-bold text-foreground">$21,022</p>
                  <p className="text-sm text-muted-foreground">23.5% of total</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Low Stock */}
          <TabsContent value="lowstock" className="space-y-6">
            <Card className="p-6 bg-card border border-border shadow-card-soft">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <h3 className="text-lg font-semibold text-foreground">Low Stock Items</h3>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export List
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Title</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">ISBN</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Current Stock</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Minimum</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.map((item, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-3 font-medium text-foreground">{item.title}</td>
                        <td className="p-3 text-muted-foreground font-mono text-sm">{item.isbn}</td>
                        <td className="p-3 text-foreground">{item.current}</td>
                        <td className="p-3 text-foreground">{item.minimum}</td>
                        <td className="p-3">
                          <Badge 
                            variant={item.status === "Critical" ? "destructive" : "secondary"}
                            className={item.status === "Critical" ? "" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"}
                          >
                            {item.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}