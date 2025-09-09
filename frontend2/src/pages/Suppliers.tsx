import { Search, Plus, Building2, Mail, Phone, Edit, Trash2, AlertTriangle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddSupplierModal } from "@/components/AddSupplierModal";
import { useGetSupplierDashboard } from "@/hooks/useGetResources";

export default function Suppliers() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // const suppliers = [
  //   {
  //     id: 1,
  //     name: "Penguin Random House",
  //     contactPerson: "Sarah Johnson",
  //     email: "sarah.j@penguinrandomhouse.com",
  //     phone: "+1 (555) 123-4567",
  //     address: "1745 Broadway, New York, NY 10019",
  //     totalBooks: 245,
  //     status: "Active"
  //   },
  //   {
  //     id: 2,
  //     name: "HarperCollins Publishers",
  //     contactPerson: "Michael Chen",
  //     email: "m.chen@harpercollins.com",
  //     phone: "+1 (555) 234-5678",
  //     address: "195 Broadway, New York, NY 10007",
  //     totalBooks: 189,
  //     status: "Active"
  //   },
  //   {
  //     id: 3,
  //     name: "Macmillan Publishers",
  //     contactPerson: "Emily Rodriguez",
  //     email: "e.rodriguez@macmillan.com",
  //     phone: "+1 (555) 345-6789",
  //     address: "120 Broadway, New York, NY 10271",
  //     totalBooks: 98,
  //     status: "Inactive"
  //   },
  // ];

  const { data: supplierDashboard, error: supplierDashboardError, isLoading: loadingSupplierDashboard } = useGetSupplierDashboard();

  const handleAddSuppliers = (newSuppliers) => {
    // Here you would typically call an API to save the suppliers
    console.log("Adding suppliers:", newSuppliers);
    // For now, just close the modal
    setIsAddModalOpen(false);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Suppliers</h1>
            <p className="text-muted-foreground">Manage your suppliers</p>
          </div>
          <Button variant="premium" size="lg" className="gap-2" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-5 h-5" />
            Add Supplier
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loadingSupplierDashboard ? (
            // Loading state for stats cards
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="p-6 bg-card border border-border shadow-card-soft">
                <div className="animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-6 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : supplierDashboardError ? (
            // Error state for stats cards
            <Card className="col-span-full p-6 bg-card border border-border shadow-card-soft">
              <div className="text-center text-destructive">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                <p>Failed to load supplier statistics</p>
              </div>
            </Card>
          ) : (
            // Actual stats cards with data
            <>
              <StatsCard
                title="Total Suppliers"
                value={supplierDashboard?.total_suppliers?.toString() || "0"}
                icon={<Building2 className="w-6 h-6 text-primary" />}
              />
              <StatsCard
                title="Total Books"
                value={supplierDashboard?.total_books?.toString() || "0"}
                icon={<Building2 className="w-6 h-6 text-accent" />}
              />
              <StatsCard
                title="Active Suppliers"
                value={supplierDashboard?.total_active_suppliers?.toString() || "0"}
                icon={<Building2 className="w-6 h-6 text-gold" />}
              />
            </>
          )}
        </div>

        {/* Search */}
        <Card className="p-6 bg-card border border-border shadow-card-soft">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search suppliers by name, contact person, or email..."
              className="pl-10 bg-background"
              disabled={loadingSupplierDashboard}
            />
          </div>
        </Card>

        {/* Publishers Table */}
        <Card className="bg-card border border-border shadow-card-soft">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Suppliers Directory</h3>
              {/* <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Supplier
              </Button> */}
            </div>
            
            {loadingSupplierDashboard ? (
              // Loading state for table
              <div className="space-y-4">
                <div className="animate-pulse">
                  {/* Table header skeleton */}
                  <div className="grid grid-cols-7 gap-4 p-3 border-b border-border">
                    {Array.from({ length: 7 }).map((_, index) => (
                      <div key={index} className="h-4 bg-muted rounded"></div>
                    ))}
                  </div>
                  {/* Table rows skeleton */}
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="grid grid-cols-7 gap-4 p-3 border-b border-border">
                      {Array.from({ length: 7 }).map((_, cellIndex) => (
                        <div key={cellIndex} className="h-4 bg-muted rounded"></div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : supplierDashboardError ? (
              // Error state for table
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                <h4 className="text-lg font-medium text-foreground mb-2">Failed to load suppliers</h4>
                <p className="text-muted-foreground mb-4">
                  There was an error loading the supplier data. Please try refreshing the page.
                </p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Page
                </Button>
              </div>
            ) : !supplierDashboard?.supplier_list || supplierDashboard.supplier_list.length === 0 ? (
              // Empty state
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h4 className="text-lg font-medium text-foreground mb-2">No suppliers found</h4>
                <p className="text-muted-foreground mb-4">
                  Get started by adding your first supplier to the system.
                </p>
                <Button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Supplier
                </Button>
              </div>
            ) : (
              // Actual table with data
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Suppliers</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Contact Person</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Contact Info</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Address</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Total Books</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplierDashboard.supplier_list.map((supplier) => (
                      <tr key={supplier.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <span className="font-medium text-foreground">{supplier.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-foreground">{supplier.contact_person || "N/A"}</td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {supplier.contact_info || 'N/A'}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {supplier.phone_number || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground max-w-xs truncate">
                          {supplier.address || "N/A"}
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary">{supplierDashboard.total_books || 0}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge 
                            variant={supplier.status === "Active" ? "default" : "secondary"}
                            className={supplier.status === "Active" ? "bg-accent text-accent-foreground" : ""}
                          >
                            {supplier.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
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
            )}
          </div>
        </Card>
      </div>

      <AddSupplierModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onAddSuppliers={handleAddSuppliers}
      />
    </AppLayout>
  );
}