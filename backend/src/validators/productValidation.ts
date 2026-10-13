import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(3, "Product name must be at least 3 characters").max(100),
  sku: z.string().trim().min(3, "SKU is required").max(50),
  description: z.string().trim().optional(),
  purchasePrice: z.number().finite().min(0, "Purchase price cannot be negative"),
  price: z.number().finite().positive("Selling price must be greater than 0"),
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
  minStock: z.number().int().min(0).default(10),
  categoryId: z.string().cuid(),
  supplierId: z.string().cuid(),
});

export const updateProductSchema = createProductSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0,
    "At least one field must be provided"
  );

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;