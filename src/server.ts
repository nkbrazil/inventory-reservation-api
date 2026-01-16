import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import itemRoutes from "./routes/itemRoutes";
import { swaggerSpec } from "./config/swaggerConfig";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// routes
app.use("/v1/items", itemRoutes);

// connection db check
app.get("/", (req, res) => {
  res.json({ message: "Inventory API is running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
