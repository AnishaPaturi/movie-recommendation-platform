import Movie from "../models/Movie.js";
import Review from "../models/Review.js";

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

    res.json({
      movies,
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
