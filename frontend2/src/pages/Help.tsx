import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";

const quickGuides = [
  {
    title: "Dashboard Basics",
    body: "Use the dashboard to monitor sales performance, low stock alerts, and recent transactions at a glance.",
  },
  {
    title: "Inventory Management",
    body: "Update stock quantities, review reorder levels, and track items close to running out.",
  },
  {
    title: "Sales Workflow",
    body: "Record new sales, verify totals, and review recent transactions for accuracy.",
  },
  {
    title: "Purchase Orders",
    body: "Create purchase orders when stock is low and track progress until books are received.",
  },
  {
    title: "Tax and Settings",
    body: "Review tax rates and business settings to keep receipts and reports consistent.",
  },
];

export default function Help() {
  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Help Center</h1>
          <p className="text-muted-foreground">
            Practical guides for common tasks in BookShelf IMS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickGuides.map((guide) => (
            <Card key={guide.title} className="p-6 bg-card border border-border shadow-card-soft space-y-2">
              <h2 className="text-lg font-semibold text-foreground">{guide.title}</h2>
              <p className="text-sm text-muted-foreground">{guide.body}</p>
            </Card>
          ))}
        </div>

        <Card className="p-6 bg-card border border-border shadow-card-soft">
          <h2 className="text-lg font-semibold text-foreground mb-2">Need More Support?</h2>
          <p className="text-sm text-muted-foreground">
            If the guides do not solve your issue, contact your system admin or maintainer and include the action you were taking and any error message shown.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
