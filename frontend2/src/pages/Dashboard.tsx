import { Book, Package, TrendingUp, AlertTriangle, ShoppingCart, DollarSign } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { StatsCard } from "@/components/StatsCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import bookshopHero from "@/assets/bookshop-hero.jpg";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useGetInventory, useGetSalesDashboardSummary } from "@/hooks/useGetResources";

const currencyFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 2,
});

export default function Dashboard() {

  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { data: inventoryData, isLoading: loadingInventory } = useGetInventory(5);
  const { data: salesSummary, isLoading: loadingSalesSummary } = useGetSalesDashboardSummary(5);

  useEffect(() => {
    // Only redirect if loading is complete and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      navigate('/auth/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const lowStockBooks = inventoryData?.low_stock_items ?? [];
  const recentSales = salesSummary?.recent_sales ?? [];

  const formatRelativeTime = (dateString: string) => {
    const saleDate = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.round((saleDate.getTime() - now.getTime()) / (1000 * 60));
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    const absoluteMinutes = Math.abs(diffInMinutes);
    if (absoluteMinutes < 60) {
      return rtf.format(diffInMinutes, "minute");
    }

    const diffInHours = Math.round(diffInMinutes / 60);
    if (Math.abs(diffInHours) < 24) {
      return rtf.format(diffInHours, "hour");
    }

    const diffInDays = Math.round(diffInHours / 24);
    return rtf.format(diffInDays, "day");
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Hero Section */}
        <div 
          className="relative rounded-2xl overflow-hidden shadow-book"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${bookshopHero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '300px'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div className="text-white space-y-4">
              <h1 className="text-4xl font-bold">Welcome to Your Bookshop</h1>
              <p className="text-lg opacity-90">Manage your literary inventory with ease</p>
              <Button variant="gold" size="hero">
                View Today's Sales
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Titles"
            value={loadingInventory ? "..." : inventoryData?.total_items ?? 0}
            change="Titles currently in inventory"
            icon={<Book className="w-6 h-6 text-primary" />}
          />
          <StatsCard
            title="Low Stock Items"
            value={loadingInventory ? "..." : inventoryData?.low_stock ?? 0}
            change={`${inventoryData?.out_of_stock ?? 0} out of stock`}
            changeType={(inventoryData?.low_stock ?? 0) > 0 ? "negative" : "neutral"}
            icon={<AlertTriangle className="w-6 h-6 text-destructive" />}
          />
          <StatsCard
            title="Today's Sales"
            value={loadingSalesSummary ? "..." : salesSummary?.today_sales_count ?? 0}
            change={currencyFormatter.format(salesSummary?.today_revenue ?? 0)}
            changeType={(salesSummary?.today_sales_count ?? 0) > 0 ? "positive" : "neutral"}
            icon={<ShoppingCart className="w-6 h-6 text-accent" />}
          />
          <StatsCard
            title="Monthly Revenue"
            value={loadingSalesSummary ? "..." : currencyFormatter.format(salesSummary?.monthly_revenue ?? 0)}
            change={currencyFormatter.format(inventoryData?.total_value ?? 0)}
            changeType={(salesSummary?.monthly_revenue ?? 0) > 0 ? "positive" : "neutral"}
            icon={<DollarSign className="w-6 h-6 text-gold" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Low Stock Alert */}
          <Card className="p-6 bg-card border border-border shadow-card-soft">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <h3 className="text-lg font-semibold text-foreground">Low Stock Alert</h3>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {lowStockBooks.length === 0 ? (
                <div className="p-6 bg-muted rounded-lg text-sm text-muted-foreground">
                  All tracked items are above their reorder level.
                </div>
              ) : (
                lowStockBooks.map((book) => (
                <div key={book.isbn_number} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{book.title}</h4>
                    <p className="text-sm text-muted-foreground">{book.isbn_number}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-destructive">
                      {book.stock} / {book.reorder_level}
                    </span>
                  </div>
                </div>
              )))}
            </div>
          </Card>

          {/* Recent Sales */}
          <Card className="p-6 bg-card border border-border shadow-card-soft">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-semibold text-foreground">Recent Sales</h3>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {recentSales.length === 0 ? (
                <div className="p-6 bg-muted rounded-lg text-sm text-muted-foreground">
                  No recent sales found for this tenant yet.
                </div>
              ) : (
                recentSales.map((sale) => (
                <div key={sale.sale_id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Receipt #{sale.sale_id.slice(0, 8)}</h4>
                      <p className="text-sm text-muted-foreground">{formatRelativeTime(sale.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{currencyFormatter.format(sale.total_amount)}</p>
                    <p className="text-sm text-muted-foreground">{sale.items} items</p>
                  </div>
                </div>
              )))}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
