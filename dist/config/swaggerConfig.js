"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const path_1 = __importDefault(require("path"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Inventory Reservation API",
            version: "1.0.0",
            description: "API for managing inventory items and reservations",
        },
        servers: [
            {
                url: "http://localhost:3000/v1",
                description: "Development server",
            },
            {
                url: "https://inventory-reservation-api-nkb-leadly.vercel.app/v1",
                description: "Production server",
            },
        ],
        components: {
            schemas: {
                Item: {
                    type: "object",
                    required: ["name", "total_quantity"],
                    properties: {
                        id: {
                            type: "string",
                            format: "uuid",
                        },
                        name: {
                            type: "string",
                        },
                        total_quantity: {
                            type: "number",
                        },
                        created_at: {
                            type: "string",
                            format: "date-time",
                        },
                        updated_at: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },
                Reservation: {
                    type: "object",
                    required: ["item_id", "customer_id", "quantity", "status"],
                    properties: {
                        id: {
                            type: "string",
                            format: "uuid",
                        },
                        item_id: {
                            type: "string",
                            format: "uuid",
                        },
                        customer_id: {
                            type: "string",
                        },
                        quantity: {
                            type: "number",
                        },
                        status: {
                            type: "string",
                            enum: ["CONFIRMED", "CANCELLED", "PENDING", "EXPIRED"],
                        },
                        expires_at: {
                            type: "string",
                            format: "date-time",
                        },
                        created_at: {
                            type: "string",
                            format: "date-time",
                        },
                        updated_at: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },
            },
        },
    },
    apis: [path_1.default.join(__dirname, "../routes/*.{ts,js}")],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
