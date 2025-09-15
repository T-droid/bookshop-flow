export interface TaxResponse {
  id: string;
  taxName: string;
  taxRate: number;
  description?: string;
  isDefault: boolean;
  effectiveDate: string;
}
