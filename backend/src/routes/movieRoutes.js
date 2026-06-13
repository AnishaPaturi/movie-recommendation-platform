import express from "express";
import {
  getMovies,
  getMovieById,
  createMovieReview,
} from "../controllers/movieController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getMovies);
router.get("/:id", getMovieById);
router.post("/:id/reviews", protect, createMovieReview);

export default router;
