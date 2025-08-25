import { z } from "zod";

export const NewTaxRateSchema = z.object({
  taxName: z.string().min(1, "Tax name is required"),
  taxRate: z.coerce.number({ invalid_type_error: "Tax rate must be a number" }).min(0, "Tax rate must be at least 0").max(1, "Tax rate cannot exceed 1"),
  effectiveDate: z.string().min(1, "Effective date is required"),
  isDefault: z.boolean().default(false),
  description: z.string().optional()
})

export type NewTaxRate = z.infer<typeof NewTaxRateSchema>;