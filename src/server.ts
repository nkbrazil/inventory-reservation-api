import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import itemRoutes from "./routes/itemRoutes";
import reservationRoutes from "./routes/reservationRoutes";
import { swaggerSpec } from "./config/swaggerConfig";
import maintenanceRoutes from "./routes/maintenanceRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// swagger json
app.get("/openapi.json", (req, res) => {
  res.json(swaggerSpec);
});

// Swagger UI (CDN-based, Vercel-safe)
app.get("/docs", (_req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>Inventory API Docs</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui.min.css" />
</head>
<body>
  <div id="swagger-ui"></div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-bundle.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-standalone-preset.min.js"></script>

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
app.use("/v1/items", itemRoutes);
app.use("/v1/reservations", reservationRoutes);
app.use("/v1/maintenance", maintenanceRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "Inventory API is running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
export default app;
