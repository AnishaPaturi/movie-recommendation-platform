import joblib
import numpy as np

movies = joblib.load("models/movies.pkl")
tfidf_matrix = joblib.load("models/tfidf_matrix.pkl")

def find_movie_index(title, movies_df):
    title_clean = title.strip().lower()
    
    # 1. Exact case-insensitive match on the full title
    matches = movies_df[movies_df["title"].str.lower() == title_clean]
    if not matches.empty:
        return matches.index[0]
        
    # 2. Exact match on clean_title (without the release year)
    matches = movies_df[movies_df["clean_title"].str.lower() == title_clean]
    if not matches.empty:
        return matches.index[0]
        
    # 3. Substring match on the full title
    matches = movies_df[movies_df["title"].str.lower().str.contains(title_clean, regex=False)]
    if not matches.empty:
        return matches.index[0]
        
    # 4. Substring match on the clean title
    matches = movies_df[movies_df["clean_title"].str.lower().str.contains(title_clean, regex=False)]
    if not matches.empty:
        return matches.index[0]
        
    return None

def get_recommendations(title, top_n=10):
    idx = find_movie_index(title, movies)
    if idx is None:
        return []

    # Get the TF-IDF vector of the query movie
    query_vec = tfidf_matrix[idx]
    
    # Calculate similarity scores (matrix multiplication is equivalent to cosine similarity
    # because the vectors are L2-normalized by the TfidfVectorizer)
    sim_scores = (tfidf_matrix @ query_vec.T).toarray().flatten()
    
    # Get indices of most similar movies in descending order
    similar_indices = np.argsort(sim_scores)[::-1]
    
    # Exclude the query movie index itself and select the top N recommendations
    recommended_indices = [i for i in similar_indices if i != idx][:top_n]
    
    return movies["title"].iloc[recommended_indices].tolist()