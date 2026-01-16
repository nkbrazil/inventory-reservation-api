import { z } from "zod";

//  validation schemas
export const createItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  total_quantity: z.coerce
    .number()
    .int()
    .nonnegative("Quantity must be non-negative"),
});

export const updateItemSchema = z
  .object({
    name: z.string().min(1).optional(),
    total_quantity: z.coerce.number().int().nonnegative().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

export const deleteItemSchema = z.object({});

export const itemParamsSchema = z.object({
  id: z.string(),
});

export const updateItemRequestSchema = z.object({
  params: itemParamsSchema,
  body: updateItemSchema,
});

export const deleteItemRequestSchema = z.object({
  params: itemParamsSchema,
});

// Type exports
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ItemParams = z.infer<typeof itemParamsSchema>;
export type UpdateItemRequest = z.infer<typeof updateItemRequestSchema>;
export type DeleteItemRequest = z.infer<typeof deleteItemRequestSchema>;
