import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import connectDB from "../config/dbConfig.js";
import Movie from "../models/Movie.js";

// Load environment variables
dotenv.config();

const parseCSVLine = (line) => {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("Clearing existing movies from database...");
    await Movie.deleteMany({});

    // Path to the downloaded MovieLens movies.csv
    const csvPath = path.resolve("../ml-service/data/raw/movies.csv");
    console.log(`Reading movies CSV from: ${csvPath}`);

    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at ${csvPath}`);
    }

    const data = fs.readFileSync(csvPath, "utf-8");
    const lines = data.split(/\r?\n/);
    
    if (lines.length < 2) {
      throw new Error("CSV file is empty or does not contain data");
    }

    const moviesToInsert = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = parseCSVLine(line);
      if (columns.length < 3) continue;

      const movieId = Number(columns[0]);
      const title = columns[1];
      const genresStr = columns[2];

      // Split the pipe-separated genres (e.g. "Adventure|Animation|Children")
      const genres = genresStr ? genresStr.split("|").map(g => g.trim()) : [];

      if (isNaN(movieId) || !title) continue;

      moviesToInsert.push({
        movieId,
        title,
        genres,
        overview: `A movie from the MovieLens dataset categorized as: ${genres.join(", ")}.`,
      });
    }

    console.log(`Parsed ${moviesToInsert.length} movies. Bulk inserting into MongoDB...`);
    
    // Batch insert for performance
    const BATCH_SIZE = 1000;
    for (let i = 0; i < moviesToInsert.length; i += BATCH_SIZE) {
      const batch = moviesToInsert.slice(i, i + BATCH_SIZE);
      await Movie.insertMany(batch);
      console.log(`Imported ${i + batch.length} / ${moviesToInsert.length} movies...`);
    }

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error.message);
    process.exit(1);
  }
};

seedDatabase();
