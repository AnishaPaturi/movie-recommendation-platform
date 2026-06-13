import axios from "axios";
import jwt from "jsonwebtoken";
import Movie from "../models/Movie.js";
import User from "../models/User.js";
import https from "https";
import crypto from "crypto";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  minVersion: "TLSv1",
  secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
});

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

    // Retrieve rich movie objects from our local MongoDB database in parallel
    const richRecommendations = await Promise.all(
      recommendedTitles.map(async (recTitle) => {
        let dbMovie = await Movie.findOne({ title: recTitle });
        
        if (!dbMovie) {
          const cleanTitle = recTitle.replace(/\s*\(\d{4}\)\s*$/, "");
          dbMovie = await Movie.findOne({ title: { $regex: `^${cleanTitle}`, $options: "i" } });
        }

        if (dbMovie) {
          // Lazy load poster from FM-DB API if not set
          if (!dbMovie.posterUrl || dbMovie.posterUrl === "") {
            try {
              const cleanTitle = dbMovie.title.replace(/\s*\(\d{4}\)\s*$/, "");
              const searchUrl = `https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(cleanTitle)}`;
              const fmRes = await axios.get(searchUrl);
              
              if (fmRes.data && fmRes.data.ok && fmRes.data.description && fmRes.data.description.length > 0) {
                const firstMatch = fmRes.data.description[0];
                dbMovie.posterUrl = firstMatch["#IMG_POSTER"] || "";
                await dbMovie.save();
              }
            } catch (err) {
              console.warn("FM-DB fetch failed for recommendation:", dbMovie.title, err.message);
            }
          }
          return dbMovie;
        } else {
          return {
            title: recTitle,
            genres: [],
            posterUrl: "",
            overview: "No description available.",
          };
        }
      })
    );

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
