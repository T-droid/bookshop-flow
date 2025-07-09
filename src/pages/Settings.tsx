import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { User, Bell, FileText, Shield, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Settings() {
  const { toast } = useToast()
  
  const [profile, setProfile] = useState({
    name: "John Mwangi",
    email: "manager@kicd.go.ke",
    phone: "+254 712 345 678",
    position: "Bookshop Manager"
  })

  const [notifications, setNotifications] = useState({
    lowStockAlerts: true,
    salesReports: true,
    systemUpdates: false,
    dailyReports: true
  })

  const [receiptSettings, setReceiptSettings] = useState({
    headerText: "KICD Bookshop",
    footerText: "Thank you for your purchase!",
    includeVAT: true,
    showItemCodes: true
  })

  const [preferences, setPreferences] = useState({
    lowStockThreshold: 10,
    defaultVATRate: 16,
    autoGenerateReceipts: true,
    enableBackups: true
  })

  const saveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully."
    })
  }

  const saveNotifications = () => {
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved."
    })
  }

  const saveReceiptSettings = () => {
    toast({
      title: "Receipt settings updated",
      description: "Receipt template has been updated successfully."
    })
  }

  const savePreferences = () => {
    toast({
      title: "Preferences updated",
      description: "Your system preferences have been saved."
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and system preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Manager Profile
              </CardTitle>
              <CardDescription>
                Update your personal information and credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={profile.position}
                    onChange={(e) => setProfile({...profile, position: e.target.value})}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Security</h3>
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" placeholder="Enter current password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" placeholder="Enter new password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" placeholder="Confirm new password" />
                </div>
              </div>
              
              <Button onClick={saveProfile} className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose which notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when book quantities fall below minimum levels
                    </p>
                  </div>
                  <Switch
                    checked={notifications.lowStockAlerts}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, lowStockAlerts: checked})
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sales Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly sales summary reports
                    </p>
                  </div>
                  <Switch
                    checked={notifications.salesReports}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, salesReports: checked})
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about system updates and maintenance
                    </p>
                  </div>
                  <Switch
                    checked={notifications.systemUpdates}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, systemUpdates: checked})
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive daily sales and inventory summaries
                    </p>
                  </div>
                  <Switch
                    checked={notifications.dailyReports}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, dailyReports: checked})
                    }
                  />
                </div>
              </div>
              
              <Button onClick={saveNotifications} className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Save Notifications
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Receipt Template
              </CardTitle>
              <CardDescription>
                Customize the appearance and content of sales receipts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="header-text">Receipt Header Text</Label>
                <Input
                  id="header-text"
                  value={receiptSettings.headerText}
                  onChange={(e) => setReceiptSettings({...receiptSettings, headerText: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="footer-text">Receipt Footer Text</Label>
                <Textarea
                  id="footer-text"
                  value={receiptSettings.footerText}
                  onChange={(e) => setReceiptSettings({...receiptSettings, footerText: e.target.value})}
                  rows={3}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Receipt Options</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include VAT Details</Label>
                    <p className="text-sm text-muted-foreground">
                      Show VAT breakdown on receipts
                    </p>
                  </div>
                  <Switch
                    checked={receiptSettings.includeVAT}
                    onCheckedChange={(checked) => 
                      setReceiptSettings({...receiptSettings, includeVAT: checked})
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Item Codes</Label>
                    <p className="text-sm text-muted-foreground">
                      Display ISBN/product codes on receipts
                    </p>
                  </div>
                  <Switch
                    checked={receiptSettings.showItemCodes}
                    onCheckedChange={(checked) => 
                      setReceiptSettings({...receiptSettings, showItemCodes: checked})
                    }
                  />
                </div>
              </div>
              
              <Button onClick={saveReceiptSettings} className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Save Receipt Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Preferences
              </CardTitle>
              <CardDescription>
                Configure system-wide settings and defaults
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="low-stock">Low Stock Threshold</Label>
                  <Input
                    id="low-stock"
                    type="number"
                    min="1"
                    value={preferences.lowStockThreshold}
                    onChange={(e) => setPreferences({...preferences, lowStockThreshold: parseInt(e.target.value)})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="default-vat">Default VAT Rate (%)</Label>
                  <Input
                    id="default-vat"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={preferences.defaultVATRate}
                    onChange={(e) => setPreferences({...preferences, defaultVATRate: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">System Options</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Generate Receipts</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically generate receipts after each sale
                    </p>
                  </div>
                  <Switch
                    checked={preferences.autoGenerateReceipts}
                    onCheckedChange={(checked) => 
                      setPreferences({...preferences, autoGenerateReceipts: checked})
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Data Backups</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically backup system data daily
                    </p>
                  </div>
                  <Switch
                    checked={preferences.enableBackups}
                    onCheckedChange={(checked) => 
                      setPreferences({...preferences, enableBackups: checked})
                    }
                  />
                </div>
              </div>
              
              <Button onClick={savePreferences} className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}