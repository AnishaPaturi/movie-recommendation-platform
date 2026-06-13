import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/dbConfig.js";
import userRoutes from "./routes/userRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/recommend", recommendationRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "healthy", message: "Express backend is running and connected." });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});