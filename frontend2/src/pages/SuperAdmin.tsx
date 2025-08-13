import { Building2, Plus, Users, Settings, Edit, Trash2, Eye } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { CreateTenantFormValues } from "@/types/tenant";


import { SubmitHandler, useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import debounce from "lodash.debounce";
import { useCheckAdminEmail, useCheckTenantName } from "@/hooks/useCheckAvailability";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/api";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import ErrorMessage from "@/components/ValidationInputError";


const schema = z.object({
  tenant: z.object({
    name: z.string().min(3, "Tenant name must be at least 3 characters long"),
    contact_email: z.string().email("Invalid email format"),
    contact_phone: z.string().optional(),
    address: z.string().optional()
  }),
  admin: z.object({
    email: z.string().email("Invalid email format"),
    full_name: z.string().min(2, "Full name must be at least 2 characters long"),
    phone_number: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters long")
  })
});

type CreateTenantFormValues = z.infer<typeof schema>;

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

  const queryClient = useQueryClient();

  const { mutateAsync: createTenantAndAdmin } = useMutation({
    mutationFn: async (data: CreateTenantFormValues) => {
      return await apiClient.post('/onboarding/create-tenant-admin', data);
    },
    onSuccess: () => {
      toast.success("Bookshop and admin account created successfully!");
      reset();
      
      setTriggerTenantCheck(false);
      setTriggerEmailCheck(false);

      clearErrors();
      
      // Switch to bookshops tab to show the new entry
      // queryClient.invalidateQueries(['bookshops']);
    },
    onError: (error) => {
      toast.error("Failed to create bookshop or admin account. Please try again.");
      console.error("Error creating tenant:", error);
    }
  })
  const { register, handleSubmit, setError, clearErrors, watch, reset, formState: { errors, isSubmitting } } = useForm<CreateTenantFormValues>({
    resolver: zodResolver(schema),
  });
  const onSubmit: SubmitHandler<CreateTenantFormValues> = async (data) => {
    await createTenantAndAdmin(data);
  }

  const tenantName = watch("tenant.name");
  const adminEmail = watch("admin.email");

  const [triggerTenantCheck, setTriggerTenantCheck] = useState(false);
  const [triggerEmailCheck, setTriggerEmailCheck] = useState(false);

  const { data: tenantExists } = useCheckTenantName(tenantName, triggerTenantCheck);
  const { data: emailExists } = useCheckAdminEmail(adminEmail, triggerEmailCheck);

  // Debounce the tenant check
  useEffect(() => {
    const debounced = debounce(() => {
      if (tenantName?.length > 2) setTriggerTenantCheck(true);
    }, 500);
    debounced();
    return () => debounced.cancel();
  }, [tenantName]);

  // Debounce the email check
  useEffect(() => {
    const debounced = debounce(() => {
      if (adminEmail?.includes('@')) setTriggerEmailCheck(true);
    }, 500);
    debounced();
    return () => debounced.cancel();
  }, [adminEmail]);

  // Handle tenant name result
  useEffect(() => {
    if (tenantExists) {
      setError('tenant.name', { type: 'manual', message: 'Tenant name is already taken' });
    } else {
      clearErrors('tenant.name');
    }
  }, [tenantExists, setError, clearErrors]);

  // Handle email result
  useEffect(() => {
    if (emailExists) {
      setError('admin.email', { type: 'manual', message: 'Email is already in use' });
    } else {
      clearErrors('admin.email');
    }
  }, [emailExists, setError, clearErrors]);



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
            <form
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bookshop Details */}
                <Card className="p-6 bg-card border border-border shadow-card-soft">
                  <div className="flex items-center gap-2 mb-6">
                    <Building2 className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Bookshop Information</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="shopName">Bookshop Name</Label>
                      <Input {...register("tenant.name")} id="shopName" placeholder="Enter bookshop name" />
                    </div>
                    {errors.tenant?.name && (
                      <ErrorMessage message={errors.tenant.name.message} />
                    )}

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input {...register("tenant.address")} id="address" placeholder="Enter full address" />
                    </div>
                    {errors.tenant?.address && (
                      <ErrorMessage message={errors.tenant.address.message} />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input {...register("tenant.contact_phone")} id="phone" placeholder="+1 (555) 123-4567" />
                      </div>
                      {errors.tenant?.contact_phone && (
                        <ErrorMessage message={errors.tenant.contact_phone.message} />
                      )}

                      <div>
                        <Label htmlFor="email">Contact Email</Label>
                        <Input {...register("tenant.contact_email")} id="email" type="email" placeholder="contact@bookshop.com" />
                      </div>
                      {errors.tenant?.contact_email && (
                        <ErrorMessage message={errors.tenant.contact_email.message} />
                      )}
                    </div>
                  </div>
                </Card>

                {/* Admin Account */}
                <Card className="p-6 bg-card border border-border shadow-card-soft">
                  <div className="flex items-center gap-2 mb-6">
                    <Users className="w-5 h-5 text-accent" />
                    <h3 className="text-lg font-semibold text-foreground">Admin Account</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="adminName">Admin Full Name</Label>
                      <Input {...register("admin.full_name")} id="adminName" placeholder="Enter admin full name" />
                    </div>
                    {errors.admin?.full_name && (
                      <ErrorMessage message={errors.admin.full_name.message} />
                    )}

                    <div>
                      <Label htmlFor="adminEmail">Admin Email</Label>
                      <Input {...register("admin.email")} id="adminEmail" type="email" placeholder="admin@bookshop.com" />
                    </div>
                    {errors.admin?.email && (
                      <ErrorMessage message={errors.admin.email.message} />
                    )}

                    <div>
                      <Label htmlFor="adminPhone">Admin Phone</Label>
                        <Input {...register("admin.phone_number")} id="adminPhone" placeholder="+1 (555) 123-4567" />
                    </div>
                    {errors.admin?.phone_number && (
                      <ErrorMessage message={errors.admin.phone_number.message} />
                    )}

                    <div>
                      <Label htmlFor="tempPassword">Temporary Password</Label>
                        <Input {...register("admin.password")} id="tempPassword" type="password" placeholder="Generate secure password" />
                    </div>
                    {errors.admin?.password && (
                      <ErrorMessage message={errors.admin.password.message} />
                    )}
                  </div>
                </Card>
              </div>

              <div className="flex justify-end mt-6">
                <Button disabled={isSubmitting} type="submit" variant="premium" size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  {isSubmitting ? `Creating...` : `Create Bookshop & Admin Account`}
                </Button>
              </div>
            </form>
          </TabsContent>

        </Tabs>
      </div>
    </AppLayout>
  );
}