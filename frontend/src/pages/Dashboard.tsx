import {useState, useEffect} from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  Users,
  BookOpen,
  ShoppingCart,
  Calculator
} from "lucide-react"
import { Skeleton } from '@/components/ui/skeleton'

export default function Dashboard() {

//simulation for loading state
  const [isLoading, setLoading] = useState(true)  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000) // Simulate a 2 second loading time
    return () => clearTimeout(timer)
  }, [])

  // Mock data - in real app this would come from API
  const metrics = {
    totalTitles: 247,
    lowStockItems: 12,
    todaysSales: 1850.75,
    monthlyRevenue: 45230.50,
    totalPublishers: 8,
    vatSettings: "16% Standard Rate"
  }

  const lowStockBooks = [
    { title: "Mathematics Grade 5", currentStock: 3, threshold: 10 },
    { title: "Kiswahili Grade 7", currentStock: 5, threshold: 15 },
    { title: "Science Grade 8", currentStock: 2, threshold: 12 },
  ]

  const recentSales = [
    { receipt: "RCP-001", items: 3, amount: 1250.00, time: "10:30 AM" },
    { receipt: "RCP-002", items: 1, amount: 450.00, time: "11:15 AM" },
    { receipt: "RCP-003", items: 5, amount: 2100.00, time: "2:45 PM" },
  ]

  if (isLoading) {
    return <Skeleton />
  }
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to KICD Bookshop Management</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Today's Date</p>
          <p className="text-lg font-semibold text-foreground">
            {new Date().toLocaleDateString('en-KE', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Titles</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-kicd-navy">{metrics.totalTitles}</div>
            <p className="text-xs text-muted-foreground">Books in inventory</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items need reordering</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-kicd-coral" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-kicd-coral">KSh {metrics.todaysSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Including VAT</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-kicd-navy" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-kicd-navy">KSh {metrics.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month total</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats and Settings */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-kicd-navy" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Active Publishers</span>
              </div>
              <Badge variant="secondary">{metrics.totalPublishers}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">VAT Rate</span>
              </div>
              <Badge variant="outline" className="text-kicd-coral border-kicd-coral">
                {metrics.vatSettings}
              </Badge>
            </div>
            
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Inventory Health</span>
                <span className="text-sm font-medium">
                  {Math.round(((metrics.totalTitles - metrics.lowStockItems) / metrics.totalTitles) * 100)}%
                </span>
              </div>
              <Progress 
                value={((metrics.totalTitles - metrics.lowStockItems) / metrics.totalTitles) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockBooks.map((book, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div>
                    <p className="text-sm font-medium text-foreground">{book.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {book.currentStock} remaining (min: {book.threshold})
                    </p>
                  </div>
                  <Badge variant="destructive" className="ml-2">
                    Low
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
              View All Low Stock Items
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-kicd-coral" />
            Recent Sales
          </CardTitle>
          <CardDescription>Latest transactions from today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSales.map((sale, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{sale.receipt}</p>
                    <p className="text-xs text-muted-foreground">{sale.items} item(s) • {sale.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-kicd-navy">
                    KSh {sale.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Incl. VAT</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            View All Sales Today
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}