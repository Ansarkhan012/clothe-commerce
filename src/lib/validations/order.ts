import { z } from 'zod';

export const CheckoutSchema = z.object({
  customer_name: z.string().min(4, "Name must be at least 4 characters"),
  phone_number: z.string().regex(/^03\d{9}$/, "Invalid Pakistani phone number (03XXXXXXXXX)"),
  delivery_address: z.string().min(10, "Please enter a complete address"),
  area: z.string().min(2, "Please select an area"),
});

export type CheckoutFormData = z.infer<typeof CheckoutSchema>;