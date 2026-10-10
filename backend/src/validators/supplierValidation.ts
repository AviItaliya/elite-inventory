import { z } from "zod";

export const createSupplierSchema = z.object({
    name: z.string().trim().min(2, "Supplier name must be at least 2 characters.").max(100),
    email: z.email("Invalid email address.").optional(),
    phone: z.string().trim().min(10, "Phone number must be at least 10 digits.").max(15).optional()
});
export const updateSupplierSchema = createSupplierSchema;

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;