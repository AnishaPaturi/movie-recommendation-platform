import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from data_preprocessing import load_data

def train_model():
    # Load data from raw directory
    movies = load_data("data/raw")
    
    # Initialize TF-IDF Vectorizer
    tfidf = TfidfVectorizer(stop_words="english")
    tfidf_matrix = tfidf.fit_transform(movies["combined_features"])
    
    # Save movies DataFrame, sparse TF-IDF matrix, and vectorizer
    joblib.dump(movies, "models/movies.pkl")
    joblib.dump(tfidf_matrix, "models/tfidf_matrix.pkl")
    joblib.dump(tfidf, "models/vectorizer.pkl")

if __name__ == "__main__":
    train_model()
    print("Model trained and saved successfully.")