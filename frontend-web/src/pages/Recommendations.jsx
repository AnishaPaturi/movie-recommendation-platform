import React, { useState } from "react";
import { recommendationService } from "../services/api";
import MovieCard from "../components/MovieCard";

const Recommendations = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await recommendationService.getRecommendations(query, 6);
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error(err);
      setError("We couldn't find recommendations for that movie. Please try another title (e.g., 'Toy Story', 'Inception', 'Star Wars').");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommendations-page section-padding">
      <div className="container" style={{ maxWidth: "850px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "36px", marginBottom: "16px" }}>
            AI Movie <span className="gradient-text">Recommendation Engine</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>
            Type in the name of a movie you enjoy, and our TF-IDF similarity model will analyze genres and tags to discover matching titles.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="search-wrapper" style={{ marginBottom: "50px" }}>
          <div className="search-input-container">
            <span className="search-icon">🤖</span>
            <input
              type="text"
              placeholder="Enter a movie name (e.g. Inception, Toy Story, Interstellar)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button type="submit" className="gradient-btn btn-search">
            Generate
          </button>
        </form>

        {loading ? (
          <div className="spinner" style={{ margin: "50px auto" }}></div>
        ) : error ? (
          <div className="alert-error" style={{ textAlign: "center" }}>{error}</div>
        ) : searched && recommendations.length === 0 ? (
          <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            <h3>No recommendations found.</h3>
            <p style={{ marginTop: "10px" }}>We couldn't find a matching title in the MovieLens database. Try another movie name!</p>
          </div>
        ) : searched ? (
          <div>
            <h2 style={{ marginBottom: "24px", fontSize: "22px", textAlign: "left" }}>
              Recommended for you based on <span className="gradient-text">"{query}"</span>:
            </h2>
            <div className="movies-grid">
              {recommendations.map((movie, index) => (
                <MovieCard key={movie._id || index} movie={movie} />
              ))}
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: "45px", textAlign: "center", color: "var(--text-muted)" }}>
            <h3>Ready to Discover?</h3>
            <p style={{ marginTop: "10px", fontSize: "14px" }}>
              Enter a title above to begin. The recommendation search history will be saved to your profile if you are logged in.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
