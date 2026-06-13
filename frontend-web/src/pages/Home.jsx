import React, { useState, useEffect, useRef } from "react";
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
  const [sortBy, setSortBy] = useState("");
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const carouselRef = useRef(null);

  const genresList = [
    "Action", "Adventure", "Animation", "Children", "Comedy", 
    "Crime", "Drama", "Fantasy", "Mystery", "Romance", "Sci-Fi", "Thriller"
  ];

  // Fetch featured movies on mount (top 10 highest-rated)
  useEffect(() => {
    const fetchFeatured = async () => {
      setFeaturedLoading(true);
      try {
        const data = await movieService.getMovies(1, "", "", "rating", 10);
        setFeaturedMovies(data.movies || []);
      } catch (error) {
        console.error("Error fetching featured movies:", error.message);
      } finally {
        setFeaturedLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // Fetch movies on page, searchQuery, selectedGenre, or sortBy changes
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const data = await movieService.getMovies(page, searchQuery, selectedGenre, sortBy);
        setMovies(data.movies || []);
        setPages(data.pages || 1);
      } catch (error) {
        console.error("Error fetching movies:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [page, searchQuery, selectedGenre, sortBy]);

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

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 320;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
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

      {/* Featured / Top Rated Carousel Section */}
      {!featuredLoading && featuredMovies.length > 0 && (
        <section className="featured-section section-padding fade-in-up delay-1">
          <div className="container">
            <h2 className="section-title" style={{ fontSize: "28px", textAlign: "left", marginBottom: "8px" }}>
              Trending & <span className="gradient-text">Top Rated</span>
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", textAlign: "left", marginBottom: "20px" }}>
              Explore the most highly acclaimed movies selected by CineMatch users.
            </p>
            <div className="carousel-container">
              <button className="carousel-btn carousel-btn-prev" onClick={() => scrollCarousel("left")}>◀</button>
              <div className="carousel-track" ref={carouselRef}>
                {featuredMovies.map((movie) => (
                  <div key={movie._id} className="carousel-item">
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
              <button className="carousel-btn carousel-btn-next" onClick={() => scrollCarousel("right")}>▶</button>
            </div>
          </div>
        </section>
      )}

      {/* Movie Directory Section */}
      <section className="section-padding" style={{ background: "rgba(255, 255, 255, 0.01)" }}>
        <div className="container">
          <div className="filter-bar">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: "16px" }}>
              <h2 style={{ fontSize: "28px" }}>Explore Collection</h2>
              <div className="sort-select-wrapper">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1); // Reset page on sort change
                  }}
                  className="sort-select"
                >
                  <option value="">Sort: A to Z</option>
                  <option value="rating">Sort: Top Rated</option>
                  <option value="popular">Sort: Most Popular</option>
                </select>
              </div>
            </div>
            <div className="genre-filters" style={{ width: "100%", marginTop: "16px" }}>
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
