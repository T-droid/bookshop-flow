import { Plus, X, Save, Building2, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Supplier {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  notes: string;
  category: string;
  paymentTerms: string;
  status: string;
}

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSuppliers: (suppliers: Supplier[]) => void;
}

export function AddSupplierModal({ isOpen, onClose, onAddSuppliers }: AddSupplierModalProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      website: "",
      notes: "",
      category: "",
      paymentTerms: "",
      status: "Active",
    },
  ]);

  const categories = ["Book Publisher", "Stationery Supplier", "Technology Vendor", "General Supplier"];
  const paymentTerms = ["Net 30", "Net 15", "COD", "Net 60", "Prepaid"];
  const statuses = ["Active", "Inactive", "Pending"];

  const addSupplierEntry = () => {
    setSuppliers([
      ...suppliers,
      {
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        website: "",
        notes: "",
        category: "",
        paymentTerms: "",
        status: "Active",
      },
    ]);
  };

  const updateSupplier = (index: number, field: keyof Supplier, value: string) => {
    const updatedSuppliers = [...suppliers];
    updatedSuppliers[index][field] = value;
    setSuppliers(updatedSuppliers);
  };

  const removeSupplier = (index: number) => {
    setSuppliers(suppliers.filter((_, i) => i !== index));
  };

  const validateSuppliers = () => {
    return suppliers.every((supplier) => {
      return (
        supplier.name.trim() &&
        supplier.contactPerson.trim() &&
        supplier.email.trim() &&
        supplier.phone.trim() &&
        supplier.category &&
        supplier.status
      );
    });
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = () => {
    if (!validateSuppliers()) {
      alert("Please fill in all required fields for all suppliers.");
      return;
    }

    // Validate email formats
    const invalidEmails = suppliers.filter(supplier => supplier.email && !validateEmail(supplier.email));
    if (invalidEmails.length > 0) {
      alert("Please enter valid email addresses for all suppliers.");
      return;
    }

    onAddSuppliers(suppliers);
    setSuppliers([
      {
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        website: "",
        notes: "",
        category: "",
        paymentTerms: "",
        status: "Active",
      },
    ]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-card border border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Add New Suppliers
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 max-h-[70vh] overflow-y-auto p-4">
          {suppliers.map((supplier, index) => (
            <Card key={index} className="p-6 bg-card border border-border shadow-card-soft relative">
              {suppliers.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeSupplier(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Supplier {index + 1}
                  </h3>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`name-${index}`} className="text-sm font-medium text-foreground">
                      Company Name *
                    </Label>
                    <Input
                      id={`name-${index}`}
                      value={supplier.name}
                      onChange={(e) => updateSupplier(index, "name", e.target.value)}
                      placeholder="Enter company name"
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`contactPerson-${index}`} className="text-sm font-medium text-foreground">
                      Contact Person *
                    </Label>
                    <Input
                      id={`contactPerson-${index}`}
                      value={supplier.contactPerson}
                      onChange={(e) => updateSupplier(index, "contactPerson", e.target.value)}
                      placeholder="Enter contact person name"
                      className="bg-background"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`email-${index}`} className="text-sm font-medium text-foreground flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email Address *
                    </Label>
                    <Input
                      id={`email-${index}`}
                      type="email"
                      value={supplier.email}
                      onChange={(e) => updateSupplier(index, "email", e.target.value)}
                      placeholder="Enter email address"
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`phone-${index}`} className="text-sm font-medium text-foreground flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      Phone Number *
                    </Label>
                    <Input
                      id={`phone-${index}`}
                      type="tel"
                      value={supplier.phone}
                      onChange={(e) => updateSupplier(index, "phone", e.target.value)}
                      placeholder="Enter phone number"
                      className="bg-background"
                    />
                  </div>
                </div>

                {/* Address and Website */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`address-${index}`} className="text-sm font-medium text-foreground flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Address
                    </Label>
                    <Textarea
                      id={`address-${index}`}
                      value={supplier.address}
                      onChange={(e) => updateSupplier(index, "address", e.target.value)}
                      placeholder="Enter company address"
                      className="bg-background resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`website-${index}`} className="text-sm font-medium text-foreground">
                        Website
                      </Label>
                      <Input
                        id={`website-${index}`}
                        type="url"
                        value={supplier.website}
                        onChange={(e) => updateSupplier(index, "website", e.target.value)}
                        placeholder="https://www.example.com"
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`category-${index}`} className="text-sm font-medium text-foreground">
                        Category *
                      </Label>
                      <Select
                        value={supplier.category}
                        onValueChange={(value) => updateSupplier(index, "category", value)}
                      >
                        <SelectTrigger id={`category-${index}`} className="bg-background">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Business Terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`paymentTerms-${index}`} className="text-sm font-medium text-foreground">
                      Payment Terms
                    </Label>
                    <Select
                      value={supplier.paymentTerms}
                      onValueChange={(value) => updateSupplier(index, "paymentTerms", value)}
                    >
                      <SelectTrigger id={`paymentTerms-${index}`} className="bg-background">
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentTerms.map((term) => (
                          <SelectItem key={term} value={term}>
                            {term}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`status-${index}`} className="text-sm font-medium text-foreground">
                      Status *
                    </Label>
                    <Select
                      value={supplier.status}
                      onValueChange={(value) => updateSupplier(index, "status", value)}
                    >
                      <SelectTrigger id={`status-${index}`} className="bg-background">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor={`notes-${index}`} className="text-sm font-medium text-foreground">
                    Notes
                  </Label>
                  <Textarea
                    id={`notes-${index}`}
                    value={supplier.notes}
                    onChange={(e) => updateSupplier(index, "notes", e.target.value)}
                    placeholder="Additional notes about this supplier..."
                    className="bg-background resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </Card>
          ))}
          
          <Button 
            variant="outline" 
            className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5" 
            onClick={addSupplierEntry}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Supplier
          </Button>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="premium" onClick={handleSubmit} className="gap-2">
            <Save className="w-4 h-4" />
            Save Suppliers ({suppliers.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
