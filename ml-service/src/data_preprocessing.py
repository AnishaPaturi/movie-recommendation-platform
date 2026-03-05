import pandas as pd

def load_data(movies_path):
    movies = pd.read_csv(movies_path)
    
    # Fill missing overviews
    movies["overview"] = movies["overview"].fillna("")
    
    # Combine important features
    movies["combined_features"] = (
        movies["genres"].fillna("") + " " +
        movies["keywords"].fillna("") + " " +
        movies["overview"]
    )
    
    return movies