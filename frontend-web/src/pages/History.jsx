import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/api";
import { AuthContext } from "../context/AuthContext";

const History = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in and not loading auth
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const data = await authService.getHistory();
        // Sort history by date descending
        const sortedData = data ? [...data].reverse() : [];
        setHistory(sortedData);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch search history.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  if (authLoading || loading) {
    return <div className="spinner" style={{ marginTop: "100px" }}></div>;
  }

  return (
    <div className="history-page section-padding">
      <div className="container" style={{ maxWidth: "800px" }}>
        <div style={{ textAlign: "left", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "32px", marginBottom: "12px" }}>
            My Recommendation <span className="gradient-text">History</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
            Review your previous AI movie searches and see what recommendations you generated in the past.
          </p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {history.length === 0 ? (
          <div className="glass-panel" style={{ padding: "50px", textAlign: "center", color: "var(--text-muted)" }}>
            <h3>No Search History</h3>
            <p style={{ marginTop: "10px", fontSize: "14px" }}>
              You haven't requested any AI recommendations yet. Try it now!
            </p>
            <div style={{ marginTop: "24px" }}>
              <Link to="/recommend" className="gradient-btn" style={{ padding: "10px 24px", borderRadius: "20px", display: "inline-block" }}>
                Get Recommendations
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {history.map((item) => (
              <div key={item._id} className="glass-panel history-item">
                <div className="history-item-header">
                  <div className="history-query">
                    🎬 Checked: <span className="gradient-text">"{item.queryTitle}"</span>
                  </div>
                  <div className="history-date">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>

                <div className="history-recs">
                  {item.recommendedMovies.map((movie, index) => (
                    <span key={index} className="history-rec-tag">
                      {movie}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
