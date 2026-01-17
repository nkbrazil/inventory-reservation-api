"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const itemRoutes_1 = __importDefault(require("./routes/itemRoutes"));
const reservationRoutes_1 = __importDefault(require("./routes/reservationRoutes"));
const swaggerConfig_1 = require("./config/swaggerConfig");
const maintenanceRoutes_1 = __importDefault(require("./routes/maintenanceRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// swagger json
app.get("/openapi.json", (req, res) => {
    res.json(swaggerConfig_1.swaggerSpec);
});
// Swagger UI (CDN-based, Vercel-safe)
app.get("/docs", (_req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.send(`<!DOCTYPE html>
<html>
<head>
  <title>Inventory API Docs</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-bundle.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-standalone-preset.min.js"></script>

  <script>
    SwaggerUIBundle({
      url: "/openapi.json",
      dom_id: "#swagger-ui",
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIStandalonePreset
      ],
      layout: "StandaloneLayout"
    });
  </script>
</body>
</html>`);
});
// API routes
app.use("/v1/items", itemRoutes_1.default);
app.use("/v1/reservations", reservationRoutes_1.default);
app.use("/v1/maintenance", maintenanceRoutes_1.default);
app.get("/", (_req, res) => {
    res.json({ message: "Inventory API is running" });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
exports.default = app;
