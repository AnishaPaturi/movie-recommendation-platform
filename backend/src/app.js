import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

const ML_SERVICE_URL = "http://ml-service:8000/recommend";

app.post("/api/recommend", async (req, res) => {
  try {
    const { title, top_n } = req.body;

    const response = await axios.post(ML_SERVICE_URL, {
      title,
      top_n,
    });

    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to get recommendations" });
  }
});

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});