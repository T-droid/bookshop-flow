import { Building2, Plus, Users, Settings, Edit, Trash2, Eye } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SuperAdmin() {
  const bookshops = [
    {
      id: 1,
      name: "Cozy Corner Books",
      admin: "john.admin@cozycorner.com",
      address: "123 Main Street, Literary District",
      phone: "+1 (555) 123-4567",
      status: "Active",
      createdDate: "2024-01-15",
      totalUsers: 3,
      totalBooks: 1247
    },
    {
      id: 2,
      name: "The Reading Nook",
      admin: "sarah.admin@readingnook.com",
      address: "456 Book Avenue, Story Heights",
      phone: "+1 (555) 234-5678",
      status: "Active",
      createdDate: "2024-02-20",
      totalUsers: 5,
      totalBooks: 892
    },
    {
      id: 3,
      name: "Novel Ideas Bookstore",
      admin: "mike.admin@novelideas.com",
      address: "789 Chapter Lane, Prose Plaza",
      phone: "+1 (555) 345-6789",
      status: "Inactive",
      createdDate: "2024-03-10",
      totalUsers: 2,
      totalBooks: 456
    }
  ];

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Administration</h1>
            <p className="text-muted-foreground">Manage bookshops and system-wide settings</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Bookshops"
            value="3"
            change="+1 this month"
            changeType="positive"
            icon={<Building2 className="w-6 h-6 text-primary" />}
          />
          <StatsCard
            title="Active Bookshops"
            value="2"
            icon={<Building2 className="w-6 h-6 text-accent" />}
          />
          <StatsCard
            title="Total Users"
            value="10"
            change="+3 this month"
            changeType="positive"
            icon={<Users className="w-6 h-6 text-gold" />}
          />
          <StatsCard
            title="System Health"
            value="99.9%"
            change="Optimal"
            changeType="positive"
            icon={<Settings className="w-6 h-6 text-primary" />}
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="bookshops" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bookshops">Manage Bookshops</TabsTrigger>
            <TabsTrigger value="create">Create New Bookshop</TabsTrigger>
          </TabsList>

          {/* Bookshops Management */}
          <TabsContent value="bookshops" className="space-y-6">
            <Card className="bg-card border border-border shadow-card-soft">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Registered Bookshops</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Bookshop</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Admin</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Contact</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Users</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Books</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Created</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookshops.map((shop) => (
                        <tr key={shop.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="p-3">
                            <div>
                              <div className="font-medium text-foreground">{shop.name}</div>
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {shop.address}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-foreground">{shop.admin}</td>
                          <td className="p-3 text-muted-foreground">{shop.phone}</td>
                          <td className="p-3">
                            <Badge 
                              variant={shop.status === "Active" ? "default" : "secondary"}
                              className={shop.status === "Active" ? "bg-accent text-accent-foreground" : ""}
                            >
                              {shop.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="secondary">{shop.totalUsers}</Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">{shop.totalBooks.toLocaleString()}</Badge>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {new Date(shop.createdDate).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Create New Bookshop */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Bookshop Details */}
              <Card className="p-6 bg-card border border-border shadow-card-soft">
                <div className="flex items-center gap-2 mb-6">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Bookshop Information</h3>
                </div>

                <form className="space-y-4">
                  <div>
                    <Label htmlFor="shopName" className="text-sm font-medium text-foreground">
                      Bookshop Name
                    </Label>
                    <Input 
                      id="shopName"
                      placeholder="Enter bookshop name"
                      className="bg-background mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-sm font-medium text-foreground">
                      Address
                    </Label>
                    <Input 
                      id="address"
                      placeholder="Enter full address"
                      className="bg-background mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                        Phone Number
                      </Label>
                      <Input 
                        id="phone"
                        placeholder="+1 (555) 123-4567"
                        className="bg-background mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-foreground">
                        Contact Email
                      </Label>
                      <Input 
                        id="email"
                        type="email"
                        placeholder="contact@bookshop.com"
                        className="bg-background mt-1"
                      />
                    </div>
                  </div>
                </form>
              </Card>

              {/* Admin Account */}
              <Card className="p-6 bg-card border border-border shadow-card-soft">
                <div className="flex items-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-semibold text-foreground">Admin Account</h3>
                </div>

                <form className="space-y-4">
                  <div>
                    <Label htmlFor="adminName" className="text-sm font-medium text-foreground">
                      Admin Full Name
                    </Label>
                    <Input 
                      id="adminName"
                      placeholder="Enter admin full name"
                      className="bg-background mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="adminEmail" className="text-sm font-medium text-foreground">
                      Admin Email
                    </Label>
                    <Input 
                      id="adminEmail"
                      type="email"
                      placeholder="admin@bookshop.com"
                      className="bg-background mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="adminPhone" className="text-sm font-medium text-foreground">
                      Admin Phone
                    </Label>
                    <Input 
                      id="adminPhone"
                      placeholder="+1 (555) 123-4567"
                      className="bg-background mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tempPassword" className="text-sm font-medium text-foreground">
                      Temporary Password
                    </Label>
                    <Input 
                      id="tempPassword"
                      type="password"
                      placeholder="Generate secure password"
                      className="bg-background mt-1"
                    />
                  </div>
                </form>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button variant="premium" size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Create Bookshop & Admin Account
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}