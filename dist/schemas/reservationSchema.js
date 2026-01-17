"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservationParamsSchema = exports.createReservationSchema = void 0;
const zod_1 = require("zod");
exports.createReservationSchema = zod_1.z.object({
    item_id: zod_1.z.string().min(1),
    customer_id: zod_1.z.string().min(1, "Customer ID is required"),
    quantity: zod_1.z.coerce.number().int().positive("Quantity must be greater than 0"),
});
exports.reservationParamsSchema = zod_1.z.object({
    id: zod_1.z.string(),
});
