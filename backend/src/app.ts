import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import apiRoutes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Static uploads directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Root healthcheck
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date(), service: "Vehicle CRM API" });
});

// Mount all API routes
app.use("/api", apiRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Central Error Handler
app.use(errorHandler);

export default app;
