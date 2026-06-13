import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { movieService } from "../services/api";

const MovieDetails = () => {
  const { id } = useParams();
  
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Review submission state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await movieService.getMovieDetails(id);
      setMovie(data.movie);
      setReviews(data.reviews || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load movie details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSuccess(false);

    if (!comment.trim()) {
      setReviewError("Please write a comment.");
      return;
    }

    try {
      await movieService.createReview(id, rating, comment, reviewerName);
      setComment("");
      setReviewerName("");
      setRating(5);
      setReviewSuccess(true);
      // Reload details to update average rating and list
      fetchDetails();
    } catch (err) {
      console.error(err);
      setReviewError(err.response?.data?.error || "Failed to submit review.");
    }
  };

  if (loading) {
    return <div className="spinner" style={{ marginTop: "100px" }}></div>;
  }

  if (error || !movie) {
    return (
      <div className="container section-padding" style={{ textAlign: "center" }}>
        <div className="alert-error" style={{ display: "inline-block" }}>{error || "Movie not found"}</div>
        <div style={{ marginTop: "20px" }}>
          <Link to="/" className="gradient-btn" style={{ padding: "10px 24px", borderRadius: "20px" }}>Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-details-page section-padding">
      <div className="container">
        <div className="movie-details-layout">
          {/* Left Column: Poster & Info */}
          <div>
            {movie.posterUrl ? (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="movie-poster-large"
                style={{
                  width: "100%",
                  height: "480px",
                  borderRadius: "20px",
                  objectFit: "cover",
                  boxShadow: "var(--shadow-card)",
                  border: "1px solid var(--border-glass)"
                }}
              />
            ) : (
              <div className="movie-poster-large"></div>
            )}
            
            <div className="movie-meta-info">
              <div className="meta-row">
                <span className="meta-label">Year</span>
                <span>{movie.title.match(/\((\d{4})\)/)?.[1] || "N/A"}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Genres</span>
                <span>{movie.genres?.join(", ") || "N/A"}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Reviews</span>
                <span>{movie.numReviews || 0}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Overview, Reviews */}
          <div className="movie-content">
            <div className="movie-title-header">
              <h1>{movie.title}</h1>
              <div className="rating">
                <span style={{ color: "#ffc107", marginRight: "6px" }}>⭐</span>
                <strong style={{ color: "var(--text-main)", fontSize: "20px" }}>
                  {movie.averageRating ? movie.averageRating.toFixed(1) : "0.0"}
                </strong>
                <span style={{ fontSize: "14px", color: "var(--text-muted)" }}> / 5.0 rating</span>
              </div>
            </div>

            <div className="overview-box">
              <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>Overview</h2>
              <p>{movie.overview}</p>
            </div>

            {/* Reviews Section */}
            <div className="reviews-section">
              <div className="reviews-header">
                <h2>User Reviews</h2>
                <span>{reviews.length} reviews submitted</span>
              </div>

              {/* Add Review Form */}
              <div className="glass-panel review-form">
                <h4>Write a Review</h4>
                {reviewError && <div className="alert-error">{reviewError}</div>}
                {reviewSuccess && <div style={{ color: "#00ff88", marginBottom: "15px", fontSize: "14px" }}>Review added successfully!</div>}
                
                <form onSubmit={handleReviewSubmit}>
                  <div className="form-group" style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "16px" }}>
                    <div style={{ flex: "1", minWidth: "200px" }}>
                      <label>Your Name (Optional)</label>
                      <input
                        type="text"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder="Anonymous Guest"
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label>Rating</label>
                      <div className="rating-select" style={{ display: "flex", alignItems: "center", marginTop: "8px" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            className={`rating-star-btn ${rating >= star ? "selected" : ""}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Comment</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write your review here..."
                      className="review-textarea"
                      required
                    />
                  </div>

                  <button type="submit" className="gradient-btn" style={{ padding: "10px 24px", borderRadius: "10px", fontSize: "14px", cursor: "pointer" }}>
                    Submit Review
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div style={{ color: "var(--text-muted)", padding: "20px 0" }}>
                  No reviews yet. Be the first to review this movie!
                </div>
              ) : (
                <div className="review-list">
                  {reviews.map((review) => (
                    <div key={review._id} className="glass-panel review-item">
                      <div className="review-item-header">
                        <span className="review-user-info">
                          <span>👤 {review.username}</span>
                          <span style={{ color: "#ffc107" }}>
                            {"★".repeat(Math.round(review.rating))}
                            {"☆".repeat(5 - Math.round(review.rating))}
                          </span>
                        </span>
                        <span className="review-date">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: "1.5" }}>
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
