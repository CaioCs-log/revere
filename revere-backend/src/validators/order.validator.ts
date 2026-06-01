import { z } from "zod";

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
  })).min(1),
  customerEmail: z.string().email(),
});

export type OrderInput = z.infer<typeof orderSchema>;

export const validateOrder = (data: unknown) => {
  return orderSchema.safeParse(data);
};
