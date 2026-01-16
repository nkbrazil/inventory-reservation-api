import swaggerJsdoc from "swagger-jsdoc";

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
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
