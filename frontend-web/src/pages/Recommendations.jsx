import React, { useState, useEffect, useRef } from "react";
import { recommendationService, movieService } from "../services/api";
import MovieCard from "../components/MovieCard";

const Recommendations = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);
  
  // Autocomplete states & ref
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);

  // Debounced search for autocomplete suggestions
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const data = await movieService.getMovies(1, query.trim(), "", "", 8);
        setSuggestions(data.movies || []);
      } catch (err) {
        console.error("Error fetching autocomplete suggestions:", err);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);
    setShowSuggestions(false);
    try {
      const data = await recommendationService.getRecommendations(query.trim(), 6);
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error(err);
      setError("We couldn't find recommendations for that movie. Please try another title (e.g., 'Toy Story', 'Inception', 'Star Wars').");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (movie) => {
    setQuery(movie.title);
    setSuggestions([]);
    setShowSuggestions(false);
    
    // Automatically submit recommendations for the selected movie
    setLoading(true);
    setError(null);
    setSearched(true);
    recommendationService.getRecommendations(movie.title, 6)
      .then((data) => {
        setRecommendations(data.recommendations || []);
      })
      .catch((err) => {
        console.error(err);
        setError("We couldn't find recommendations for that movie. Please try another title.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSurpriseMe = async () => {
    setLoading(true);
    setError(null);
    setSearched(true);
    setShowSuggestions(false);
    try {
      const randomMovie = await movieService.getRandomMovie();
      if (randomMovie && randomMovie.title) {
        setQuery(randomMovie.title);
        const data = await recommendationService.getRecommendations(randomMovie.title, 6);
        setRecommendations(data.recommendations || []);
      } else {
        setError("Failed to fetch a random movie. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Could not generate recommendations for the random movie. Please try again.");
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
          <div className="search-input-container" ref={containerRef}>
            <span className="search-icon">🤖</span>
            <input
              type="text"
              placeholder="Enter a movie name (e.g. Inception, Toy Story, Interstellar)..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="search-input"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="autocomplete-dropdown">
                {suggestions.map((movie) => (
                  <li
                    key={movie._id}
                    onClick={() => handleSelectSuggestion(movie)}
                    className="autocomplete-item"
                  >
                    {movie.posterUrl ? (
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="autocomplete-item-poster"
                      />
                    ) : (
                      <div className="autocomplete-item-poster" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', background: '#23253b' }}>🎬</div>
                    )}
                    <div className="autocomplete-item-info">
                      <span className="autocomplete-item-title">{movie.title}</span>
                      <span className="autocomplete-item-genres">
                        {movie.genres ? movie.genres.slice(0, 2).join(", ") : ""}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="submit" className="gradient-btn btn-search">
            Generate
          </button>
          <button
            type="button"
            onClick={handleSurpriseMe}
            className="btn-login"
            style={{
              height: "52px",
              borderRadius: "26px",
              fontSize: "16px",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.03)"
            }}
          >
            <span>🎲</span> Surprise Me
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
