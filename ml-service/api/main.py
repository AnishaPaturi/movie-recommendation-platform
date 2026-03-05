from fastapi import FastAPI
from pydantic import BaseModel
from src.recommendation_engine import get_recommendations

app = FastAPI()

class RecommendationRequest(BaseModel):
    title: str
    top_n: int = 10

@app.post("/recommend")
def recommend(request: RecommendationRequest):
    recommendations = get_recommendations(
        request.title,
        request.top_n
    )
    return {"recommendations": recommendations}