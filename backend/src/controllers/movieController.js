import Movie from "../models/Movie.js";
import Review from "../models/Review.js";
import axios from "axios";
import https from "https";
import crypto from "crypto";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  minVersion: "TLSv1",
  secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
});

// @desc    Get all movies (paginated, with search and genre filters)
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;

    // Filter by keyword (title)
    const keyword = req.query.keyword
      ? {
          title: {
            $regex: req.query.keyword,
            $options: "i",
          },
        }
      : {};

    // Filter by genre
    const genre = req.query.genre
      ? {
          genres: {
            $regex: req.query.genre,
            $options: "i",
          },
        }
      : {};

    const query = { ...keyword, ...genre };

    const count = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ title: 1 }); // Sort alphabetically

    // Lazy load poster URLs for the current page in parallel
    const richMovies = await Promise.all(
      movies.map(async (movie) => {
        if (!movie.posterUrl || movie.posterUrl === "") {
          try {
            const cleanTitle = movie.title.replace(/\s*\(\d{4}\)\s*$/, "");
            const searchUrl = `https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(cleanTitle)}`;
            const fmRes = await axios.get(searchUrl);
            
            if (fmRes.data && fmRes.data.ok && fmRes.data.description && fmRes.data.description.length > 0) {
              const firstMatch = fmRes.data.description[0];
              movie.posterUrl = firstMatch["#IMG_POSTER"] || "";
              await movie.save();
            }
          } catch (fmErr) {
            console.warn("Failed to fetch poster from FM-DB API for list:", movie.title, fmErr.message);
          }
        }
        return movie;
      })
    );

    res.json({
      movies: richMovies,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    console.error("Get Movies Error:", error.message);
    res.status(500).json({ error: "Server error fetching movies" });
  }
};

// @desc    Get movie details by database ID
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (movie) {
      // Lazy load poster from FM-DB API if not set
      if (!movie.posterUrl || movie.posterUrl === "") {
        try {
          const cleanTitle = movie.title.replace(/\s*\(\d{4}\)\s*$/, "");
          const searchUrl = `https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(cleanTitle)}`;
          const fmRes = await axios.get(searchUrl);
          
          if (fmRes.data && fmRes.data.ok && fmRes.data.description && fmRes.data.description.length > 0) {
            const firstMatch = fmRes.data.description[0];
            movie.posterUrl = firstMatch["#IMG_POSTER"] || "";
            await movie.save();
          }
        } catch (fmErr) {
          console.warn("Failed to fetch poster from FM-DB API:", fmErr.message);
        }
      }

      const reviews = await Review.find({ movie: movie._id }).sort({ createdAt: -1 });
      res.json({ movie, reviews });
    } else {
      res.status(404).json({ error: "Movie not found" });
    }
  } catch (error) {
    console.error("Get Movie Details Error:", error.message);
    res.status(500).json({ error: "Server error fetching movie details" });
  }
};

// @desc    Create a new movie review
// @route   POST /api/movies/:id/reviews
// @access  Private
const createMovieReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (rating === undefined || !comment) {
      return res.status(400).json({ error: "Please provide rating and comment" });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 0.5 || numericRating > 5) {
      return res.status(400).json({ error: "Rating must be a number between 0.5 and 5" });
    }

    const movie = await Movie.findById(req.params.id);

    if (movie) {
      const alreadyReviewed = await Review.findOne({
        user: req.user._id,
        movie: movie._id,
      });

      if (alreadyReviewed) {
        return res.status(400).json({ error: "You have already reviewed this movie" });
      }

      const review = await Review.create({
        user: req.user._id,
        movie: movie._id,
        username: req.user.username,
        rating: numericRating,
        comment,
      });

      // Recalculate average rating and count of reviews for the movie
      const reviews = await Review.find({ movie: movie._id });
      movie.numReviews = reviews.length;
      movie.averageRating =
        reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

      await movie.save();

      res.status(201).json({ message: "Review added successfully", review });
    } else {
      res.status(404).json({ error: "Movie not found" });
    }
  } catch (error) {
    console.error("Create Review Error:", error.message);
    res.status(500).json({ error: "Server error adding review" });
  }
};

export { getMovies, getMovieById, createMovieReview };
