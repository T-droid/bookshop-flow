import { Building2, Users, Plus, Edit, Trash2, Mail, Phone, Shield, UserCheck } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BookshopAdmin() {
  const bookshopDetails = {
    name: "Cozy Corner Books",
    address: "123 Main Street, Literary District",
    phone: "+1 (555) 123-4567",
    email: "contact@cozycornerbooks.com",
    registrationDate: "2024-01-15",
    status: "Active"
  };

  const bookshopUsers = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@bookshop.com",
      role: "Manager",
      status: "Active",
      lastLogin: "2024-08-04 14:30:00",
      joinDate: "2024-01-20"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@bookshop.com",
      role: "Cashier",
      status: "Active",
      lastLogin: "2024-08-04 12:15:00",
      joinDate: "2024-02-05"
    },
    {
      id: 3,
      name: "Mike Jones",
      email: "mike.jones@bookshop.com",
      role: "Cashier",
      status: "Inactive",
      lastLogin: "2024-08-01 09:45:00",
      joinDate: "2024-03-10"
    }
  ];

  const getRoleBadge = (role: string) => {
    return role === "Manager" ? "premium" : "secondary";
  };

  const getStatusBadge = (status: string) => {
    return status === "Active" ? "default" : "secondary";
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bookshop Administration</h1>
            <p className="text-muted-foreground">Manage your bookshop details and team members</p>
          </div>
          <Button variant="premium" size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Add Team Member
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Team Members"
            value="3"
            icon={<Users className="w-6 h-6 text-primary" />}
          />
          <StatsCard
            title="Active Users"
            value="2"
            change="+1 this month"
            changeType="positive"
            icon={<UserCheck className="w-6 h-6 text-accent" />}
          />
          <StatsCard
            title="Managers"
            value="1"
            icon={<Shield className="w-6 h-6 text-gold" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bookshop Details */}
          <Card className="p-6 bg-card border border-border shadow-card-soft">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Bookshop Details</h3>
            </div>

            <form className="space-y-4">
              <div>
                <Label htmlFor="shopName" className="text-sm font-medium text-foreground">
                  Bookshop Name
                </Label>
                <Input 
                  id="shopName"
                  defaultValue={bookshopDetails.name}
                  className="bg-background mt-1"
                />
              </div>

              <div>
                <Label htmlFor="address" className="text-sm font-medium text-foreground">
                  Address
                </Label>
                <Input 
                  id="address"
                  defaultValue={bookshopDetails.address}
                  className="bg-background mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                    Phone
                  </Label>
                  <Input 
                    id="phone"
                    defaultValue={bookshopDetails.phone}
                    className="bg-background mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </Label>
                  <Input 
                    id="email"
                    defaultValue={bookshopDetails.email}
                    className="bg-background mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Registration Date
                  </Label>
                  <Input 
                    value={bookshopDetails.registrationDate}
                    disabled
                    className="bg-muted mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Status
                  </Label>
                  <div className="mt-1">
                    <Badge className="bg-accent text-accent-foreground">
                      {bookshopDetails.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <Button variant="accent" className="w-full gap-2">
                <Building2 className="w-4 h-4" />
                Update Bookshop Details
              </Button>
            </form>
          </Card>

          {/* Add New User */}
          <Card className="p-6 bg-card border border-border shadow-card-soft">
            <div className="flex items-center gap-2 mb-6">
              <Plus className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold text-foreground">Add Team Member</h3>
            </div>

            <form className="space-y-4">
              <div>
                <Label htmlFor="userName" className="text-sm font-medium text-foreground">
                  Full Name
                </Label>
                <Input 
                  id="userName"
                  placeholder="Enter full name"
                  className="bg-background mt-1"
                />
              </div>

              <div>
                <Label htmlFor="userEmail" className="text-sm font-medium text-foreground">
                  Email Address
                </Label>
                <Input 
                  id="userEmail"
                  type="email"
                  placeholder="user@bookshop.com"
                  className="bg-background mt-1"
                />
              </div>

              <div>
                <Label htmlFor="userRole" className="text-sm font-medium text-foreground">
                  Role
                </Label>
                <Select>
                  <SelectTrigger className="bg-background mt-1">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tempPassword" className="text-sm font-medium text-foreground">
                  Temporary Password
                </Label>
                <Input 
                  id="tempPassword"
                  type="password"
                  placeholder="Generate temporary password"
                  className="bg-background mt-1"
                />
              </div>

              <Button variant="premium" className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Add Team Member
              </Button>
            </form>
          </Card>
        </div>

        {/* Team Members */}
        <Card className="bg-card border border-border shadow-card-soft">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Team Members</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Role</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Last Login</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Join Date</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookshopUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-foreground">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          {user.email}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={getRoleBadge(user.role) as any}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={getStatusBadge(user.status) as any}
                          className={user.status === "Active" ? "bg-accent text-accent-foreground" : ""}
                        >
                          {user.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground font-mono">{user.lastLogin}</td>
                      <td className="p-3 text-sm text-muted-foreground">{user.joinDate}</td>
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