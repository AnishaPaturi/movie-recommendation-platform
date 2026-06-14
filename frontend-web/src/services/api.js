import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT auth tokens automatically
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem("userInfo")
      ? JSON.parse(localStorage.getItem("userInfo"))
      : null;
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const response = await api.post("/users/login", { email, password });
    return response.data;
  },
  register: async (username, email, password) => {
    const response = await api.post("/users", { username, email, password });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get("/users/history");
    return response.data;
  },
};

export const movieService = {
  getMovies: async (pageNumber = 1, keyword = "", genre = "", sortBy = "", limit = 12) => {
    const response = await api.get(`/movies?pageNumber=${pageNumber}&keyword=${keyword}&genre=${genre}&sortBy=${sortBy}&limit=${limit}`);
    return response.data;
  },
  getMovieDetails: async (id) => {
    const response = await api.get(`/movies/${id}`);
    return response.data;
  },
  getRandomMovie: async () => {
    const response = await api.get("/movies/random");
    return response.data;
  },
  createReview: async (id, rating, comment, username) => {
    const response = await api.post(`/movies/${id}/reviews`, { rating, comment, username });
    return response.data;
  },
};

export const recommendationService = {
  getRecommendations: async (title, topN = 10) => {
    const response = await api.post("/recommend", { title, top_n: topN });
    return response.data;
  },
};

export default api;
