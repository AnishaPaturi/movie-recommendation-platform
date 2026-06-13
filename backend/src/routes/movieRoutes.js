import express from "express";
import {
  getMovies,
  getMovieById,
  createMovieReview,
  getRandomMovie,
} from "../controllers/movieController.js";

const router = express.Router();

router.get("/", getMovies);
router.get("/random", getRandomMovie);
router.get("/:id", getMovieById);
router.post("/:id/reviews", createMovieReview);

export default router;
