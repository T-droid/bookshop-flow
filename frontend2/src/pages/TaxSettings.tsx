import { Plus, Edit, Trash2, Star, Calculator, AlertTriangle, RefreshCw } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { set, SubmitHandler, useForm } from "react-hook-form";
import { useCallback, useEffect, useState } from "react";
import debounce from "lodash.debounce";
import { useCheckTaxNameAvailability } from "@/hooks/useCheckAvailability";
import { ErrorMessage, SuccessMessage } from "@/components/ValidationInputError";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { NewTaxRate, NewTaxRateSchema } from "@/schemas/taxSchema";
import { useCreateTaxRate } from "@/hooks/useCreateResource";
import { useGetTaxRates } from "@/hooks/useGetResources";



export default function TaxSettings() {
  // const taxRates = [
  //   {
  //     id: 1,
  //     name: "Standard VAT",
  //     rate: 15.0,
  //     isDefault: true,
  //     effectiveDate: "2024-01-01",
  //     description: "Standard VAT rate for most books"
  //   },
  //   {
  //     id: 2,
  //     name: "Educational Books",
  //     rate: 0.0,
  //     isDefault: false,
  //     effectiveDate: "2024-01-01",
  //     description: "Zero-rated VAT for educational materials"
  //   },
  //   {
  //     id: 3,
  //     name: "Luxury Items",
  //     rate: 20.0,
  //     isDefault: false,
  //     effectiveDate: "2024-01-01",
  //     description: "Higher VAT rate for premium books and collectibles"
  //   }
  // ];

  const { data: taxRates, isLoading: loadingTaxRates, error: taxRatesError} = useGetTaxRates(10)
  const [triggerCheckName, setTriggerCheckName] = useState(false);

  const { register, handleSubmit, watch, setValue, setError, clearErrors, formState: { errors } } = useForm<NewTaxRate>({
    resolver: zodResolver(NewTaxRateSchema),
    defaultValues: {
      isDefault: false,
    }
  });
  const taxName = watch("taxName");

  const { data: isTaxNameUnique } = useCheckTaxNameAvailability(taxName, triggerCheckName);
  const { mutateAsync: createTaxRate } = useCreateTaxRate();

  const debouncedCheckName = useCallback(
    debounce((name: string) => {
      if (name && name.trim().length > 0) {
        setTriggerCheckName(true);
      } else {
        setTriggerCheckName(false);
      }
    }, 300),
    [setTriggerCheckName]
  );

  useEffect(() => {
    debouncedCheckName(taxName || "");

    return () => {
      debouncedCheckName.cancel();
      setTriggerCheckName(false);
    };
  }, [taxName, debouncedCheckName]);

  useEffect(() => {
    if (isTaxNameUnique === undefined) return;
    if (isTaxNameUnique) {
      clearErrors("taxName");
    } else {
      setError("taxName", { type: "manual", message: "Tax name already exists" });
    }
  }, [isTaxNameUnique, setError, clearErrors]);


  const onSubmit: SubmitHandler<NewTaxRate> = async (data) => {
    await createTaxRate(data)
    .then(() => {
      setValue("taxName", "");
      clearErrors("taxName");
      setValue("taxRate", undefined);
      clearErrors("taxRate");
      setValue("effectiveDate", "");
      clearErrors("effectiveDate");
      setValue("description", "");
      clearErrors("description");
      setValue("isDefault", false);
      clearErrors("isDefault");
    })
  };


  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tax Settings</h1>
            <p className="text-muted-foreground">Manage VAT rates and tax configurations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add New Tax Rate */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-card border border-border shadow-card-soft">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Tax Rate
              </h3>

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <Label htmlFor="taxName" className="text-sm font-medium text-foreground">
                    Tax Rate Name
                  </Label>
                  <Input 
                    {...register("taxName")}
                    placeholder="e.g., Standard VAT"
                    className="bg-background mt-1"
                  />
                  {errors.taxName && (
                    <ErrorMessage message={errors.taxName.message as string} />
                  )}
                  {!errors?.taxName && taxName && (
                    <SuccessMessage message="Tax name is available" />
                  )}
                </div>

                <div>
                  <Label htmlFor="taxRate" className="text-sm font-medium text-foreground">
                    Rate (%)
                  </Label>
                  <Input 
                    {...register("taxRate")}
                    type="number"
                    step="0.01"
                    placeholder="e.g., 0.15 for 15%"
                    className="bg-background mt-1"
                  />
                  {errors.taxRate && (
                    <ErrorMessage message={errors.taxRate.message as string} />
                  )}
                </div>

                <div>
                  <Label htmlFor="effectiveDate" className="text-sm font-medium text-foreground">
                    Effective Date
                  </Label>
                  <Input 
                    {...register("effectiveDate")}
                    type="date"
                    className="bg-background mt-1"
                  />
                  {errors.effectiveDate && (
                    <ErrorMessage message={errors.effectiveDate.message as string} />
                  )}
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-foreground">
                    Description
                  </Label>
                  <Textarea 
                    {...register("description")}
                    placeholder="Description of when this tax rate applies..."
                    className="bg-background mt-1"
                    rows={3}
                  />
                  {errors.description && (
                    <ErrorMessage message={errors.description.message as string} />
                  )}
                </div>
                {/* check box for default tax rate */}
                <div className="flex items-center">
                  <Checkbox
                    {...register("isDefault")}
                    checked={watch("isDefault")}
                    onCheckedChange={(checked) => {
                      setValue("isDefault", !!checked);
                    }}
                    className="mr-2"
                  />
                  <Label htmlFor="isDefault" className="text-sm font-medium text-foreground">
                    Set as default tax rate
                  </Label>
                </div>

                <Button
                  variant="accent"
                  className="w-full gap-2"
                  type="submit"
                  disabled={!!errors.taxName}
                >
                  <Plus className="w-4 h-4" />
                  Add Tax Rate
                </Button>
              </form>
            </Card>
          </div>

          {/* Current Tax Rates */}
          <div className="lg:col-span-2 space-y-6">
            {/* Default Tax Rate */}
            <Card className="p-6 bg-card border border-border shadow-card-soft">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-gold" />
                <h3 className="text-lg font-semibold text-foreground">Current Default Tax Rate</h3>
              </div>
              
              {loadingTaxRates ? (
                // Loading state for default tax rate
                <div className="animate-pulse">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex-1">
                      <div className="h-6 bg-muted-foreground/20 rounded mb-2"></div>
                      <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-8 bg-muted-foreground/20 rounded w-16 mb-2"></div>
                      <div className="h-4 bg-muted-foreground/20 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ) : taxRatesError ? (
                // Error state for default tax rate
                <div className="text-center py-8">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-destructive" />
                  <p className="text-destructive">Failed to load default tax rate</p>
                </div>
              ) : (
                // Show default tax rate or fallback
                (() => {
                  const defaultTaxRate = taxRates?.find(rate => rate.isDefault);
                  return defaultTaxRate ? (
                    <div className="flex items-center justify-between p-4 bg-gradient-accent rounded-lg">
                      <div>
                        <h4 className="font-semibold text-accent-foreground">{defaultTaxRate.taxName}</h4>
                        <p className="text-sm text-accent-foreground/80">{defaultTaxRate.description || "Applied to most book sales"}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-accent-foreground">{defaultTaxRate.taxRate}%</div>
                        <p className="text-sm text-accent-foreground/80">
                          Effective since {new Date(defaultTaxRate.effectiveDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">No default tax rate set</p>
                    </div>
                  );
                })()
              )}
            </Card>

            {/* All Tax Rates */}
            <Card className="p-6 bg-card border border-border shadow-card-soft">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">All Tax Rates</h3>
              </div>
              
              {loadingTaxRates ? (
                // Loading state for table
                <div className="space-y-4">
                  <div className="animate-pulse">
                    {/* Table header skeleton */}
                    <div className="grid grid-cols-6 gap-4 p-3 border-b border-border">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="h-4 bg-muted rounded"></div>
                      ))}
                    </div>
                    {/* Table rows skeleton */}
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="grid grid-cols-6 gap-4 p-3 border-b border-border">
                        {Array.from({ length: 6 }).map((_, cellIndex) => (
                          <div key={cellIndex} className="h-4 bg-muted rounded"></div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : taxRatesError ? (
                // Error state for table
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                  <h4 className="text-lg font-medium text-foreground mb-2">Failed to load tax rates</h4>
                  <p className="text-muted-foreground mb-4">
                    There was an error loading the tax rate data. Please try refreshing the page.
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
              ) : !taxRates || taxRates.length === 0 ? (
                // Empty state
                <div className="text-center py-12">
                  <Calculator className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h4 className="text-lg font-medium text-foreground mb-2">No tax rates found</h4>
                  <p className="text-muted-foreground mb-4">
                    Get started by adding your first tax rate using the form on the left.
                  </p>
                </div>
              ) : (
                // Actual table with data
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Name</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Rate</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Effective Date</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Description</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taxRates.map((rate) => (
                        <tr key={rate.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {rate.isDefault && <Star className="w-4 h-4 text-gold" />}
                              <span className="font-medium text-foreground">{rate.taxName}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-lg font-semibold text-foreground">{rate.taxRate}%</span>
                          </td>
                          <td className="p-3">
                            {rate.isDefault ? (
                              <Badge className="bg-gold text-gold-foreground">Default</Badge>
                            ) : (
                              <Button variant="outline" size="sm">
                                Set Default
                              </Button>
                            )}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {new Date(rate.effectiveDate).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-muted-foreground max-w-xs truncate">
                            {rate.description}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              {!rate.isDefault && (
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}