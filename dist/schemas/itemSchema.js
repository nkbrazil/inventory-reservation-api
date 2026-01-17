"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItemRequestSchema = exports.updateItemRequestSchema = exports.itemParamsSchema = exports.deleteItemSchema = exports.updateItemSchema = exports.createItemSchema = void 0;
const zod_1 = require("zod");
//  validation schemas
exports.createItemSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Item name is required"),
    total_quantity: zod_1.z.coerce
        .number()
        .int()
        .nonnegative("Quantity must be non-negative"),
});
exports.updateItemSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(1).optional(),
    total_quantity: zod_1.z.coerce.number().int().nonnegative().optional(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
});
exports.deleteItemSchema = zod_1.z.object({});
exports.itemParamsSchema = zod_1.z.object({
    id: zod_1.z.string(),
});
exports.updateItemRequestSchema = zod_1.z.object({
    params: exports.itemParamsSchema,
    body: exports.updateItemSchema,
});
exports.deleteItemRequestSchema = zod_1.z.object({
    params: exports.itemParamsSchema,
});
