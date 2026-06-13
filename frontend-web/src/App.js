import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Recommendations from "./pages/Recommendations";
import MovieDetails from "./pages/MovieDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import History from "./pages/History";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <Navbar />
          
          <main style={{ flex: "1" }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/recommend" element={<Recommendations />} />
              <Route path="/movies/:id" element={<MovieDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </main>

          <footer style={{
            textAlign: "center",
            padding: "24px 0",
            borderTop: "1px solid var(--border-glass)",
            color: "var(--text-disabled)",
            fontSize: "14px",
            background: "var(--bg-dark-void)"
          }}>
            <p>&copy; {new Date().getFullYear()} CineMatch AI. All rights reserved.</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;