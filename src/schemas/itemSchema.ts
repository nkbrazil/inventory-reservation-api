import { z } from "zod";

export const createItemSchema = z.object({
  item_name: z.string().min(1),
  total_quantity: z.coerce.number().int().nonnegative(),
});

export const updateItemSchema = z
  .object({
    item_name: z.string().min(1).optional(),
    total_quantity: z.coerce.number().int().nonnegative().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  })
  .strict();

// refine for atleast one field to be present in update

export const getItemSchema = z.object({
  id: z.string(),
});

export const deleteItemSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type GetItemInput = z.infer<typeof getItemSchema>;
export type DeleteItemInput = z.infer<typeof deleteItemSchema>;
