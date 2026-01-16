import { z } from "zod";

export const createReservationSchema = z.object({
  item_id: z.string().min(1),
  customer_id: z.string().min(1, "Customer ID is required"),
  quantity: z.coerce.number().int().positive("Quantity must be greater than 0"),
});

export const reservationParamsSchema = z.object({
  id: z.string(),
});

// Type exports
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type ReservationParams = z.infer<typeof reservationParamsSchema>;
