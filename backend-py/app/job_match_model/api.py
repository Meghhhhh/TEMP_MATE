from fastapi import FastAPI
import joblib
import pandas as pd
from preprocess import (
    extract_experience_years, extract_skills_from_description,
    calculate_skill_match, project_relevance_score, job_desc_similarity
)

app = FastAPI()

# Load model
model = joblib.load("saved_models/job_match_model.pkl")

@app.post("/predict")
def predict(data: dict):
    """Predicts job-candidate ranking based on input."""
    df = pd.DataFrame([data])

    # Preprocess input
    df["experience_years"] = df["experience"].apply(lambda x: extract_experience_years(str(x)))
    df["job_skills"] = df["job_description"].apply(extract_skills_from_description)
    df["job_skills"] = df["job_skills"].apply(lambda x: str(x))
    df["skill_match_score"] = df.apply(lambda row: calculate_skill_match(row["skills"], row["job_skills"]), axis=1)
    df["project_relevance"] = df.apply(lambda row: project_relevance_score(row["projects"], row["job_description"]), axis=1)
    df["job_desc_similarity"] = df.apply(lambda row: job_desc_similarity(row["summary"], row["job_description"]), axis=1)

    X = df[["skill_match_score", "experience_years", "project_relevance", "job_desc_similarity"]].fillna(0)
    
    prediction = model.predict(X)

    return {
        "hiring_probability": prediction.tolist(),
        "skill_match_score": df["skill_match_score"].tolist(),
        "project_relevance": df["project_relevance"].tolist(),
        "job_desc_similarity": df["job_desc_similarity"].tolist()
    }