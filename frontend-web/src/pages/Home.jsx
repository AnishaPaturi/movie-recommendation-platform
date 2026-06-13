import React, { useState, useEffect } from "react";
import { movieService } from "../services/api";
import MovieCard from "../components/MovieCard";

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");

  const genresList = [
    "Action", "Adventure", "Animation", "Children", "Comedy", 
    "Crime", "Drama", "Fantasy", "Mystery", "Romance", "Sci-Fi", "Thriller"
  ];

  // Fetch movies on page, searchQuery, or selectedGenre changes
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const data = await movieService.getMovies(page, searchQuery, selectedGenre);
        setMovies(data.movies || []);
        setPages(data.pages || 1);
      } catch (error) {
        console.error("Error fetching movies:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [page, searchQuery, selectedGenre]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(keyword);
    setPage(1); // Reset to first page
  };

  const handleGenreSelect = (genre) => {
    if (selectedGenre === genre) {
      setSelectedGenre(""); // Deselect
    } else {
      setSelectedGenre(genre);
    }
    setPage(1); // Reset to first page
  };

  return (
    <div className="home-page">
      {/* Hero Banner Section */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">
            Discover Your Next <span className="gradient-text">Favorite Movie</span>
          </h1>
          <p className="hero-subtitle">
            Search our database of over 9,000 titles, write reviews, and request AI-powered suggestions tailored just for you.
          </p>

          <form onSubmit={handleSearchSubmit} className="search-wrapper">
            <div className="search-input-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search movies by title..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="gradient-btn btn-search">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Movie Directory Section */}
      <section className="section-padding" style={{ background: "rgba(255, 255, 255, 0.01)" }}>
        <div className="container">
          <div className="filter-bar">
            <h2>Explore Collection</h2>
            <div className="genre-filters">
              {genresList.map((genre) => (
                <button
                  key={genre}
                  onClick={() => handleGenreSelect(genre)}
                  className={`genre-filter-btn ${selectedGenre === genre ? "active" : ""}`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="spinner"></div>
          ) : movies.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              <h3>No movies found matching your filters.</h3>
            </div>
          ) : (
            <>
              <div className="movies-grid">
                {movies.map((movie) => (
                  <MovieCard key={movie._id} movie={movie} />
                ))}
              </div>

              {/* Pagination Controls */}
              {pages > 1 && (
                <div className="pagination">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="page-btn"
                  >
                    ◀
                  </button>
                  {[...Array(pages).keys()].map((x) => {
                    // Display current page, first page, last page, and neighbor pages
                    if (
                      x + 1 === 1 || 
                      x + 1 === pages || 
                      Math.abs(x + 1 - page) <= 1
                    ) {
                      return (
                        <button
                          key={x + 1}
                          onClick={() => setPage(x + 1)}
                          className={`page-btn ${page === x + 1 ? "active" : ""}`}
                        >
                          {x + 1}
                        </button>
                      );
                    } else if (
                      (x + 1 === 2 && page > 3) || 
                      (x + 1 === pages - 1 && page < pages - 2)
                    ) {
                      return <span key={x + 1} style={{ color: "var(--text-muted)" }}>...</span>;
                    }
                    return null;
                  })}
                  <button
                    disabled={page === pages}
                    onClick={() => setPage(page + 1)}
                    className="page-btn"
                  >
                    ▶
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
