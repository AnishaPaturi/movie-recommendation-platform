import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    movieId: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    genres: {
      type: [String],
      required: true,
    },
    posterUrl: {
      type: String,
      default: "",
    },
    overview: {
      type: String,
      default: "",
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast title queries and searches
movieSchema.index({ title: "text" });

const Movie = mongoose.model("Movie", movieSchema);
export default Movie;
