import { Search, Calendar, Download, Eye, FileText } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function AuditLogs() {
  const auditLogs = [
    {
      id: 1,
      timestamp: "2024-08-04 14:30:25",
      user: "john.doe@bookshop.com",
      action: "UPDATE",
      tableName: "books",
      recordId: "BK_001",
      details: "Updated quantity from 10 to 8",
      ipAddress: "192.168.1.100"
    },
    {
      id: 2,
      timestamp: "2024-08-04 14:25:12",
      user: "jane.smith@bookshop.com",
      action: "INSERT",
      tableName: "sales",
      recordId: "SAL_0847",
      details: "New sale record created",
      ipAddress: "192.168.1.105"
    },
    {
      id: 3,
      timestamp: "2024-08-04 14:20:45",
      user: "john.doe@bookshop.com",
      action: "DELETE",
      tableName: "publishers",
      recordId: "PUB_023",
      details: "Removed inactive publisher",
      ipAddress: "192.168.1.100"
    },
    {
      id: 4,
      timestamp: "2024-08-04 14:15:30",
      user: "mike.jones@bookshop.com",
      action: "UPDATE",
      tableName: "tax_rates",
      recordId: "TAX_001",
      details: "Changed VAT rate from 15% to 15.5%",
      ipAddress: "192.168.1.110"
    },
    {
      id: 5,
      timestamp: "2024-08-04 14:10:18",
      user: "jane.smith@bookshop.com",
      action: "INSERT",
      tableName: "books",
      recordId: "BK_1248",
      details: "Added new book: 'The Art of Programming'",
      ipAddress: "192.168.1.105"
    }
  ];

  const getActionBadge = (action: string) => {
    const variants = {
      INSERT: { variant: "default" as const, color: "bg-accent text-accent-foreground" },
      UPDATE: { variant: "secondary" as const, color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
      DELETE: { variant: "destructive" as const, color: "" }
    };
    
    return variants[action as keyof typeof variants] || { variant: "secondary" as const, color: "" };
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
            <p className="text-muted-foreground">Track all data changes and system activities</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Logs
          </Button>
        </div>

        {/* Search & Filter Panel */}
        <Card className="p-6 bg-card border border-border shadow-card-soft">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search logs..."
                className="pl-10 bg-background"
              />
            </div>

            <div>
              <Select>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="User" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="john.doe">john.doe@bookshop.com</SelectItem>
                  <SelectItem value="jane.smith">jane.smith@bookshop.com</SelectItem>
                  <SelectItem value="mike.jones">mike.jones@bookshop.com</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Table" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tables</SelectItem>
                  <SelectItem value="books">books</SelectItem>
                  <SelectItem value="sales">sales</SelectItem>
                  <SelectItem value="publishers">publishers</SelectItem>
                  <SelectItem value="tax_rates">tax_rates</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="INSERT">Insert</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Input type="date" className="bg-background" />
            </div>
          </div>
        </Card>

        {/* Audit Logs Table */}
        <Card className="bg-card border border-border shadow-card-soft">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Activity Log</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Timestamp</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Action</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Table</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Record ID</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Details</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">IP Address</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => {
                    const actionBadge = getActionBadge(log.action);
                    
                    return (
                      <tr key={log.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-foreground font-mono">{log.timestamp}</span>
                          </div>
                        </td>
                        <td className="p-3 text-foreground">{log.user}</td>
                        <td className="p-3">
                          <Badge 
                            variant={actionBadge.variant}
                            className={actionBadge.color}
                          >
                            {log.action}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <code className="bg-muted px-2 py-1 rounded text-sm text-foreground">
                            {log.tableName}
                          </code>
                        </td>
                        <td className="p-3 text-muted-foreground font-mono text-sm">{log.recordId}</td>
                        <td className="p-3 text-foreground max-w-xs truncate">{log.details}</td>
                        <td className="p-3 text-muted-foreground font-mono text-sm">{log.ipAddress}</td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing 1-10 of 1,247 entries
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  1
                </Button>
                <Button variant="accent" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}