import { TrendingUp, Download, BookOpen, Package, AlertTriangle } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useGetInventory, useGetSalesReportsSummary } from "@/hooks/useGetResources";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

const currencyFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 2,
});

export default function Reports() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: salesReports, isLoading: loadingSalesReports } = useGetSalesReportsSummary(
    dateFrom || undefined,
    dateTo || undefined
  );
  const { data: inventoryData, isLoading: loadingInventory } = useGetInventory(10);

  const numericSalesReports = useMemo(() => ({
    total_revenue: Number(salesReports?.total_revenue ?? 0),
    total_transactions: Number(salesReports?.total_transactions ?? 0),
    average_order_value: Number(salesReports?.average_order_value ?? 0),
    monthly_sales: (salesReports?.monthly_sales ?? []).map((item) => ({
      month: item.month,
      revenue: Number(item.revenue ?? 0),
      transactions: Number(item.transactions ?? 0),
    })),
    best_sellers: (salesReports?.best_sellers ?? []).map((item) => ({
      title: item.title,
      isbn: item.isbn,
      units_sold: Number(item.units_sold ?? 0),
      revenue: Number(item.revenue ?? 0),
    })),
  }), [salesReports]);

  const bestSellers = numericSalesReports.best_sellers;
  const lowStockItems = inventoryData?.low_stock_items ?? [];
  const monthlySales = numericSalesReports.monthly_sales;
  const totalInventoryQuantity = inventoryData?.top_items?.reduce((sum, item) => sum + item.stock, 0) ?? 0;
  const topBestSellers = bestSellers.slice(0, 5);

  const monthlySalesChartData = useMemo(
    () =>
      monthlySales.map((item) => ({
        month: item.month,
        revenue: item.revenue,
        transactions: item.transactions,
        averageOrder: item.transactions ? item.revenue / item.transactions : 0,
      })),
    [monthlySales]
  );

  const inventoryStatusData = useMemo(
    () => [
      { status: "Healthy", value: Math.max(0, (inventoryData?.total_items ?? 0) - (inventoryData?.low_stock ?? 0)) },
      { status: "Low Stock", value: inventoryData?.low_stock ?? 0 },
      { status: "Out of Stock", value: inventoryData?.out_of_stock ?? 0 },
    ],
    [inventoryData]
  );

  const salesChartConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--primary))" },
    transactions: { label: "Transactions", color: "hsl(var(--accent))" },
    averageOrder: { label: "Average Order", color: "hsl(var(--gold))" },
  } satisfies ChartConfig;

  const bestSellerChartConfig = {
    units_sold: { label: "Units Sold", color: "hsl(var(--accent))" },
  } satisfies ChartConfig;

  const inventoryChartConfig = {
    value: { label: "Titles", color: "hsl(var(--primary))" },
    healthy: { label: "Healthy", color: "hsl(var(--primary))" },
    lowStock: { label: "Low Stock", color: "hsl(var(--gold))" },
    outOfStock: { label: "Out of Stock", color: "hsl(var(--destructive))" },
  } satisfies ChartConfig;

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground">Comprehensive business insights and analytics</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Input
                type="date"
                className="bg-background"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                max={dateTo || undefined}
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="date"
                className="bg-background"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                min={dateFrom || undefined}
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sales">Sales Reports</TabsTrigger>
            <TabsTrigger value="bestsellers">Best Sellers</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="lowstock">Low Stock</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Total Revenue"
                value={loadingSalesReports ? "..." : currencyFormatter.format(numericSalesReports.total_revenue)}
                change="All recorded sales"
                changeType="positive"
                icon={<TrendingUp className="w-6 h-6 text-accent" />}
              />
              <StatsCard
                title="Total Transactions"
                value={loadingSalesReports ? "..." : numericSalesReports.total_transactions}
                change="Successful checkout records"
                changeType="positive"
                icon={<TrendingUp className="w-6 h-6 text-primary" />}
              />
              <StatsCard
                title="Average Order"
                value={loadingSalesReports ? "..." : currencyFormatter.format(numericSalesReports.average_order_value)}
                change="Average revenue per sale"
                changeType="positive"
                icon={<TrendingUp className="w-6 h-6 text-gold" />}
              />
            </div>

            <Card className="p-6 bg-card border border-border shadow-card-soft">
              <h3 className="text-lg font-semibold text-foreground mb-4">Sales Trends (Revenue vs Transactions)</h3>
              {monthlySalesChartData.length > 0 ? (
                <ChartContainer config={salesChartConfig} className="h-[320px] w-full">
                  <LineChart data={monthlySalesChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={3} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="transactions" stroke="var(--color-transactions)" strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No monthly sales trend data available yet.</p>
              )}
            </Card>

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
                    {monthlySales.map((data) => (
                      <tr key={data.month} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-3 font-medium text-foreground">{data.month}</td>
                        <td className="p-3 text-foreground">{currencyFormatter.format(data.revenue)}</td>
                        <td className="p-3 text-foreground">{data.transactions}</td>
                        <td className="p-3 text-foreground">
                          {currencyFormatter.format(data.transactions ? data.revenue / data.transactions : 0)}
                        </td>
                      </tr>
                    ))}
                    {!loadingSalesReports && monthlySales.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-muted-foreground">
                          No sales report data available yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="bestsellers" className="space-y-6">
            <Card className="p-6 bg-card border border-border shadow-card-soft">
              <h3 className="text-lg font-semibold text-foreground mb-4">Top 5 Best Sellers by Units</h3>
              {topBestSellers.length > 0 ? (
                <ChartContainer config={bestSellerChartConfig} className="h-[320px] w-full">
                  <BarChart data={topBestSellers}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="title"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => String(value).slice(0, 14)}
                    />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => <span>{Number(value).toLocaleString()} units</span>}
                        />
                      }
                    />
                    <Bar dataKey="units_sold" fill="var(--color-units_sold)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No bestseller chart data available yet.</p>
              )}
            </Card>

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
                      <tr key={`${book.isbn}-${index}`} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center text-accent-foreground font-bold">
                            {index + 1}
                          </div>
                        </td>
                        <td className="p-3 font-medium text-foreground">{book.title}</td>
                        <td className="p-3 text-muted-foreground font-mono text-sm">{book.isbn}</td>
                        <td className="p-3 text-foreground">{book.units_sold}</td>
                        <td className="p-3 font-medium text-foreground">{currencyFormatter.format(book.revenue)}</td>
                      </tr>
                    ))}
                    {!loadingSalesReports && bestSellers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-muted-foreground">
                          No bestseller data available yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Total Inventory Value"
                value={loadingInventory ? "..." : currencyFormatter.format(inventoryData?.total_value ?? 0)}
                icon={<Package className="w-6 h-6 text-primary" />}
              />
              <StatsCard
                title="Total Books"
                value={loadingInventory ? "..." : inventoryData?.total_items ?? 0}
                icon={<BookOpen className="w-6 h-6 text-accent" />}
              />
              <StatsCard
                title="Tracked Quantity"
                value={loadingInventory ? "..." : totalInventoryQuantity}
                icon={<Package className="w-6 h-6 text-gold" />}
              />
            </div>

            <Card className="p-6 bg-card border border-border shadow-card-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Inventory Snapshot</h3>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export Report
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Low Stock Titles</h4>
                  <p className="text-2xl font-bold text-foreground">{inventoryData?.low_stock ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Titles at or below reorder level</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Out of Stock</h4>
                  <p className="text-2xl font-bold text-foreground">{inventoryData?.out_of_stock ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Titles currently unavailable</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Avg. Value Per Title</h4>
                  <p className="text-2xl font-bold text-foreground">
                    {currencyFormatter.format(
                      inventoryData?.total_items ? (inventoryData.total_value / inventoryData.total_items) : 0
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">Inventory value divided by tracked titles</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border shadow-card-soft">
              <h3 className="text-lg font-semibold text-foreground mb-4">Inventory Health Distribution</h3>
              {inventoryStatusData.some((item) => item.value > 0) ? (
                <ChartContainer config={inventoryChartConfig} className="h-[320px] w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Pie
                      data={inventoryStatusData}
                      dataKey="value"
                      nameKey="status"
                      innerRadius={60}
                      outerRadius={110}
                      paddingAngle={3}
                    >
                      {inventoryStatusData.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={
                            entry.status === "Healthy"
                              ? "var(--color-healthy)"
                              : entry.status === "Low Stock"
                                ? "var(--color-lowStock)"
                                : "var(--color-outOfStock)"
                          }
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No inventory distribution data available yet.</p>
              )}
            </Card>
          </TabsContent>

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
                    {lowStockItems.map((item) => {
                      const status = item.stock <= Math.max(1, Math.floor(item.reorder_level / 2)) ? "Critical" : "Low";

                      return (
                        <tr key={item.isbn_number} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="p-3 font-medium text-foreground">{item.title}</td>
                          <td className="p-3 text-muted-foreground font-mono text-sm">{item.isbn_number}</td>
                          <td className="p-3 text-foreground">{item.stock}</td>
                          <td className="p-3 text-foreground">{item.reorder_level}</td>
                          <td className="p-3">
                            <Badge 
                              variant={status === "Critical" ? "destructive" : "secondary"}
                              className={status === "Critical" ? "" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"}
                            >
                              {status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                    {!loadingInventory && lowStockItems.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-muted-foreground">
                          No low stock items found.
                        </td>
                      </tr>
                    )}
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
