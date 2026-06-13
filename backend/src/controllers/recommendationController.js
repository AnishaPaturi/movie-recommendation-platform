import axios from "axios";
import jwt from "jsonwebtoken";
import Movie from "../models/Movie.js";
import User from "../models/User.js";

// @desc    Get recommendations for a movie title
// @route   POST /api/recommend
// @access  Public (Optional Authentication)
const getRecommendations = async (req, res) => {
  try {
    const { title, top_n } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Please provide a movie title" });
    }

    const mlUrl = process.env.ML_SERVICE_URL || "http://ml-service:8000/recommend";
    const mlResponse = await axios.post(mlUrl, {
      title,
      top_n: top_n ? Number(top_n) : 10,
    });

    const recommendedTitles = mlResponse.data.recommendations || [];

    // Retrieve rich movie objects from our local MongoDB database
    const richRecommendations = [];
    for (const recTitle of recommendedTitles) {
      // Direct title match
      let dbMovie = await Movie.findOne({ title: recTitle });
      
      // If direct match fails, try match without release year
      if (!dbMovie) {
        const cleanTitle = recTitle.replace(/\s*\(\d{4}\)\s*$/, "");
        dbMovie = await Movie.findOne({ title: { $regex: `^${cleanTitle}`, $options: "i" } });
      }

      if (dbMovie) {
        richRecommendations.push(dbMovie);
      } else {
        // Fallback object if the movie isn't in MongoDB yet
        richRecommendations.push({
          title: recTitle,
          genres: [],
          posterUrl: "",
          overview: "No description available.",
        });
      }
    }

    // Optional authentication check: if header is provided, decode and save to User history
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey123");
        const user = await User.findById(decoded.id);
        if (user) {
          user.recommendationHistory.push({
            queryTitle: title,
            recommendedMovies: recommendedTitles,
          });
          await user.save();
        }
      } catch (authErr) {
        console.warn("Optional JWT parsing in recommendations failed:", authErr.message);
      }
    }

    res.json({
      query: title,
      recommendations: richRecommendations,
    });
  } catch (error) {
    console.error("Get Recommendations Error:", error.message);
    res.status(500).json({ error: "Failed to get recommendations from ML service" });
  }
};

export { getRecommendations };
