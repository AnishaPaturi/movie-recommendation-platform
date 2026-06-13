import React from "react";
import { useNavigate } from "react-router-dom";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();

  // Handle click to go to details
  const handleClick = () => {
    if (movie._id) {
      navigate(`/movies/${movie._id}`);
    }
  };

  return (
    <div className="glass-panel movie-card" onClick={handleClick}>
      <div className="movie-poster-placeholder">
        {/* Placeholder image logic, could support actual posterUrl later */}
      </div>
      
      <div className="movie-card-genres">
        {movie.genres && movie.genres.slice(0, 3).map((genre, index) => (
          <span key={index} className="genre-tag">
            {genre}
          </span>
        ))}
      </div>

      <h3 className="movie-card-title">{movie.title}</h3>

      <div className="movie-card-footer">
        <span className="rating-display">
          ⭐ {movie.averageRating ? movie.averageRating.toFixed(1) : "0.0"}
        </span>
        <span>
          {movie.numReviews ? `${movie.numReviews} reviews` : "No reviews"}
        </span>
      </div>
    </div>
  );
};

export default MovieCard;
