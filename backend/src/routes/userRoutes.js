import express from "express";
import {
  registerUser,
  authUser,
  getUserProfile,
  getRecommendationHistory,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", registerUser);
router.post("/login", authUser);
router.get("/profile", protect, getUserProfile);
router.get("/history", protect, getRecommendationHistory);

export default router;
