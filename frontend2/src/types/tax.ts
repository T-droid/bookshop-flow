export interface TaxResponse {
  id: string;
  taxName: string;
  taxRate: number;
  description?: string;
  isDefault: boolean;
  effectiveDate: string;
}

export interface DefaultTaxResponse {
  id: string;
  taxName: string;
  taxRate: number;
  description?: string;
  isDefault: boolean;
  effectiveDate: string;
}
