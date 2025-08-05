import { User, Bell, Receipt, Sliders, Save } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Settings() {
  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your account and system preferences</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="receipts">Receipts</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6 bg-card border border-border shadow-card-soft">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
              </div>
              
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                    First Name
                  </Label>
                  <Input 
                    id="firstName"
                    defaultValue="John"
                    className="bg-background mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                    Last Name
                  </Label>
                  <Input 
                    id="lastName"
                    defaultValue="Doe"
                    className="bg-background mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </Label>
                  <Input 
                    id="email"
                    type="email"
                    defaultValue="john.doe@bookshop.com"
                    className="bg-background mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                    Phone Number
                  </Label>
                  <Input 
                    id="phone"
                    defaultValue="+1 (555) 123-4567"
                    className="bg-background mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="role" className="text-sm font-medium text-foreground">
                    Role
                  </Label>
                  <Input 
                    id="role"
                    defaultValue="Manager"
                    disabled
                    className="bg-muted mt-1"
                  />
                </div>
              </form>
            </Card>

            <Card className="p-6 bg-card border border-border shadow-card-soft">
              <h3 className="text-lg font-semibold text-foreground mb-6">Change Password</h3>
              
              <form className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="currentPassword" className="text-sm font-medium text-foreground">
                    Current Password
                  </Label>
                  <Input 
                    id="currentPassword"
                    type="password"
                    className="bg-background mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword" className="text-sm font-medium text-foreground">
                    New Password
                  </Label>
                  <Input 
                    id="newPassword"
                    type="password"
                    className="bg-background mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                    Confirm New Password
                  </Label>
                  <Input 
                    id="confirmPassword"
                    type="password"
                    className="bg-background mt-1"
                  />
                </div>

                <Button variant="accent" className="gap-2">
                  <Save className="w-4 h-4" />
                  Update Password
                </Button>
              </form>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6 bg-card border border-border shadow-card-soft">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Low Stock Alerts</h4>
                    <p className="text-sm text-muted-foreground">Receive notifications when items are running low</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Sales Reports</h4>
                    <p className="text-sm text-muted-foreground">Weekly sales summary reports</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">System Updates</h4>
                    <p className="text-sm text-muted-foreground">Notifications about system updates and maintenance</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Daily Reports</h4>
                    <p className="text-sm text-muted-foreground">End-of-day sales and inventory reports</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Receipt Settings */}
          <TabsContent value="receipts" className="space-y-6">
            <Card className="p-6 bg-card border border-border shadow-card-soft">
              <div className="flex items-center gap-2 mb-6">
                <Receipt className="w-5 h-5 text-gold" />
                <h3 className="text-lg font-semibold text-foreground">Receipt Configuration</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="receiptHeader" className="text-sm font-medium text-foreground">
                    Receipt Header Text
                  </Label>
                  <Textarea 
                    id="receiptHeader"
                    defaultValue="Cozy Corner Books&#10;123 Main Street&#10;Your Literary Haven"
                    className="bg-background mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="receiptFooter" className="text-sm font-medium text-foreground">
                    Receipt Footer Text
                  </Label>
                  <Textarea 
                    id="receiptFooter"
                    defaultValue="Thank you for visiting!&#10;Follow us @CozyCornerBooks"
                    className="bg-background mt-1"
                    rows={2}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Include VAT Details</h4>
                    <p className="text-sm text-muted-foreground">Show detailed VAT breakdown on receipts</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Show Item Codes</h4>
                    <p className="text-sm text-muted-foreground">Display ISBN codes on receipt items</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="p-6 bg-card border border-border shadow-card-soft">
              <div className="flex items-center gap-2 mb-6">
                <Sliders className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">System Preferences</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="lowStockThreshold" className="text-sm font-medium text-foreground">
                    Low Stock Threshold
                  </Label>
                  <Input 
                    id="lowStockThreshold"
                    type="number"
                    defaultValue="5"
                    className="bg-background mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Alert when quantity falls below this number</p>
                </div>

                <div>
                  <Label htmlFor="defaultVat" className="text-sm font-medium text-foreground">
                    Default VAT Rate
                  </Label>
                  <Select defaultValue="15">
                    <SelectTrigger className="bg-background mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0% (Zero-rated)</SelectItem>
                      <SelectItem value="15">15% (Standard)</SelectItem>
                      <SelectItem value="20">20% (Luxury)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Auto-generate Receipts</h4>
                      <p className="text-sm text-muted-foreground">Automatically generate receipt after each sale</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Enable Daily Backups</h4>
                      <p className="text-sm text-muted-foreground">Automatically backup data daily</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button variant="premium" size="lg" className="gap-2">
                <Save className="w-5 h-5" />
                Save All Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}