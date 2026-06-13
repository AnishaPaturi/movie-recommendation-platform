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
      {movie.posterUrl ? (
        <img
          src={movie.posterUrl}
          alt={movie.title}
          style={{
            width: "100%",
            height: "280px",
            borderRadius: "12px",
            objectFit: "cover",
            marginBottom: "16px",
            border: "1px solid rgba(255, 255, 255, 0.05)"
          }}
        />
      ) : (
        <div className="movie-poster-placeholder"></div>
      )}
      
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
