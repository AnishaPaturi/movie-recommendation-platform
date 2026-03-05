import React, { useState } from "react";
import axios from "axios";

function App() {
  const [title, setTitle] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  const getRecommendations = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/recommend",
        {
          title: title,
          top_n: 5,
        }
      );

      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>🎬 Movie Recommendation System</h1>

      <input
        type="text"
        placeholder="Enter movie title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ padding: "10px", width: "300px" }}
      />

      <button
        onClick={getRecommendations}
        style={{ marginLeft: "10px", padding: "10px" }}
      >
        Get Recommendations
      </button>

      <ul>
        {recommendations.map((movie, index) => (
          <li key={index}>{movie}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;