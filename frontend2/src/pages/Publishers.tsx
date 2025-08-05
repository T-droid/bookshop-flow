import { Search, Plus, Building2, Mail, Phone, Edit, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Publishers() {
  const publishers = [
    {
      id: 1,
      name: "Penguin Random House",
      contactPerson: "Sarah Johnson",
      email: "sarah.j@penguinrandomhouse.com",
      phone: "+1 (555) 123-4567",
      address: "1745 Broadway, New York, NY 10019",
      totalBooks: 245,
      status: "Active"
    },
    {
      id: 2,
      name: "HarperCollins Publishers",
      contactPerson: "Michael Chen",
      email: "m.chen@harpercollins.com",
      phone: "+1 (555) 234-5678",
      address: "195 Broadway, New York, NY 10007",
      totalBooks: 189,
      status: "Active"
    },
    {
      id: 3,
      name: "Macmillan Publishers",
      contactPerson: "Emily Rodriguez",
      email: "e.rodriguez@macmillan.com",
      phone: "+1 (555) 345-6789",
      address: "120 Broadway, New York, NY 10271",
      totalBooks: 98,
      status: "Inactive"
    },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Publishers & Suppliers</h1>
            <p className="text-muted-foreground">Manage your publishing partners and suppliers</p>
          </div>
          <Button variant="premium" size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Add Publisher
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Publishers"
            value="24"
            icon={<Building2 className="w-6 h-6 text-primary" />}
          />
          <StatsCard
            title="Total Books"
            value="1,247"
            icon={<Building2 className="w-6 h-6 text-accent" />}
          />
          <StatsCard
            title="Active Publishers"
            value="18"
            icon={<Building2 className="w-6 h-6 text-gold" />}
          />
        </div>

        {/* Search */}
        <Card className="p-6 bg-card border border-border shadow-card-soft">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search publishers by name, contact person, or email..."
              className="pl-10 bg-background"
            />
          </div>
        </Card>

        {/* Publishers Table */}
        <Card className="bg-card border border-border shadow-card-soft">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Publishers Directory</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Publisher</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Contact Person</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Contact Info</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Address</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Total Books</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {publishers.map((publisher) => (
                    <tr key={publisher.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{publisher.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-foreground">{publisher.contactPerson}</td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {publisher.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {publisher.phone}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground max-w-xs truncate">
                        {publisher.address}
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary">{publisher.totalBooks}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={publisher.status === "Active" ? "default" : "secondary"}
                          className={publisher.status === "Active" ? "bg-accent text-accent-foreground" : ""}
                        >
                          {publisher.status}
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
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}