import joblib
import numpy as np

movies = joblib.load("models/movies.pkl")
cosine_sim = joblib.load("models/cosine_sim.pkl")

indices = {title: idx for idx, title in enumerate(movies["title"])}

def get_recommendations(title, top_n=10):
    if title not in indices:
        return []

    idx = indices[title]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    sim_scores = sim_scores[1:top_n+1]
    movie_indices = [i[0] for i in sim_scores]
    
    return movies["title"].iloc[movie_indices].tolist()