import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from data_preprocessing import load_data

def train_model():
    movies = load_data("data/raw/movies.csv")
    
    tfidf = TfidfVectorizer(stop_words="english")
    tfidf_matrix = tfidf.fit_transform(movies["combined_features"])
    
    cosine_sim = cosine_similarity(tfidf_matrix)
    
    joblib.dump(movies, "models/movies.pkl")
    joblib.dump(cosine_sim, "models/cosine_sim.pkl")
    joblib.dump(tfidf, "models/vectorizer.pkl")

if __name__ == "__main__":
    train_model()
    print("Model trained and saved successfully.")