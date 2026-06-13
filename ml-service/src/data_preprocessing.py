import pandas as pd
import os

def load_data(raw_data_dir):
    movies_path = os.path.join(raw_data_dir, "movies.csv")
    tags_path = os.path.join(raw_data_dir, "tags.csv")
    
    movies = pd.read_csv(movies_path)
    
    # Process genres: replace "|" with " "
    movies["genres_processed"] = movies["genres"].fillna("").str.replace("|", " ", regex=False)
    
    # Process tags: group by movieId and join as a space-separated string
    if os.path.exists(tags_path):
        tags = pd.read_csv(tags_path)
        tags["tag"] = tags["tag"].fillna("").astype(str)
        # Group tags by movieId and join
        movie_tags = tags.groupby("movieId")["tag"].apply(lambda x: " ".join(x)).reset_index()
        movie_tags.rename(columns={"tag": "tags_processed"}, inplace=True)
        # Merge with movies DataFrame
        movies = pd.merge(movies, movie_tags, on="movieId", how="left")
        movies["tags_processed"] = movies["tags_processed"].fillna("")
    else:
        movies["tags_processed"] = ""
        
    # Clean the title of the release year (e.g., "Toy Story (1995)" -> "Toy Story")
    movies["clean_title"] = movies["title"].str.replace(r"\s*\(\d{4}\)\s*$", "", regex=True)
    
    # Combine title, genres, and user tags for content-based vectorization
    movies["combined_features"] = (
        movies["clean_title"] + " " +
        movies["genres_processed"] + " " +
        movies["tags_processed"]
    )
    
    return movies