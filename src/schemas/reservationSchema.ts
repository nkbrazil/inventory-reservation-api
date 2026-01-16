import { z } from "zod";

export const createReservationSchema = z.object({
  item_id: z.string(),
  customer_id: z.string().min(1),
  customer_name: z.string().min(1),
  quantity: z.number().int().positive(),
  status: z.enum(["CONFIRMED", "CANCELLED", "PENDING", "EXPIRED"]),
});
export const updateReservationSchema = z.object({
  item_id: z.string().optional(),
  customer_id: z.string().min(1).optional(),
  customer_name: z.string().min(1).optional(),
  quantity: z.number().int().positive().optional(),
  status: z.enum(["CONFIRMED", "CANCELLED", "PENDING", "EXPIRED"]).optional(),
});

export const getReservationSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const deleteReservationSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;
export type GetReservationInput = z.infer<typeof getReservationSchema>;
export type DeleteReservationInput = z.infer<typeof deleteReservationSchema>;
