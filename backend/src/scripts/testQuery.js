import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "../models/Movie.js";

dotenv.config();

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/movie-recommendations";
    console.log("Connecting to:", mongoUri);
    await mongoose.connect(mongoUri);
    
    const count = await Movie.countDocuments({});
    console.log("Total movies in Movie collection:", count);
    
    const matchCount = await Movie.countDocuments({
      title: { $regex: "Toy", $options: "i" }
    });
    console.log("Movies matching 'Toy':", matchCount);

    const firstThree = await Movie.find({}).limit(3);
    console.log("First 3 movies:", firstThree);
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
};

run();
