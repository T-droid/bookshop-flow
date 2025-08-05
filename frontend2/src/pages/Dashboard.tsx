import { Book, Package, TrendingUp, AlertTriangle, ShoppingCart, DollarSign } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { StatsCard } from "@/components/StatsCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import bookshopHero from "@/assets/bookshop-hero.jpg";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Dashboard() {

  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if loading is complete and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      navigate('/auth/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);
  const lowStockBooks = [
    { title: "To Kill a Mockingbird", current: 2, threshold: 5, isbn: "978-0-06-112008-4" },
    { title: "1984", current: 1, threshold: 3, isbn: "978-0-452-28423-4" },
    { title: "The Great Gatsby", current: 3, threshold: 8, isbn: "978-0-7432-7356-5" },
  ];

  const recentSales = [
    { id: "R001", time: "2 mins ago", items: 3, amount: "$45.99" },
    { id: "R002", time: "15 mins ago", items: 1, amount: "$12.99" },
    { id: "R003", time: "1 hour ago", items: 5, amount: "$89.50" },
    { id: "R004", time: "2 hours ago", items: 2, amount: "$29.98" },
    { id: "R005", time: "3 hours ago", items: 1, amount: "$15.99" },
  ];

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
            value="1,247"
            change="+12 this week"
            changeType="positive"
            icon={<Book className="w-6 h-6 text-primary" />}
          />
          <StatsCard
            title="Low Stock Items"
            value="18"
            change="+3 since yesterday"
            changeType="negative"
            icon={<AlertTriangle className="w-6 h-6 text-destructive" />}
          />
          <StatsCard
            title="Today's Sales"
            value="47"
            change="+8 from yesterday"
            changeType="positive"
            icon={<ShoppingCart className="w-6 h-6 text-accent" />}
          />
          <StatsCard
            title="Monthly Revenue"
            value="$12,847"
            change="+15.3% from last month"
            changeType="positive"
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
              {lowStockBooks.map((book, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{book.title}</h4>
                    <p className="text-sm text-muted-foreground">{book.isbn}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-destructive">
                      {book.current} / {book.threshold}
                    </span>
                  </div>
                </div>
              ))}
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
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Receipt #{sale.id}</h4>
                      <p className="text-sm text-muted-foreground">{sale.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{sale.amount}</p>
                    <p className="text-sm text-muted-foreground">{sale.items} items</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}