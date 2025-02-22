import xgboost as xgb
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from preprocess import (
    extract_experience_years, extract_skills_from_description, calculate_skill_match,
    project_relevance_score, job_desc_similarity
)
import os

def load_and_process_data(file_path):
    """Loads and preprocesses job-candidate dataset."""
    df = pd.read_csv(file_path)
    
    # Process experience
    df["experience_years"] = df["experience"].apply(lambda x: extract_experience_years(str(x)))
    
    # Extract job skills
    df["job_skills"] = df["job_description"].apply(extract_skills_from_description)
    df["job_skills"] = df["job_skills"].apply(lambda x: str(x))

    # Skill match score
    df["skill_match_score"] = df.apply(lambda row: calculate_skill_match(row["skills"], row["job_skills"]), axis=1)

    # Project relevance
    df["project_relevance"] = df.apply(lambda row: project_relevance_score(row["projects"], row["job_description"]), axis=1)

    # Job description similarity
    df["job_desc_similarity"] = df.apply(lambda row: job_desc_similarity(row["summary"], row["job_description"]), axis=1)

    # Encode hiring outcome
    df["hired"] = df["hired"].astype(int)

    # Drop unnecessary columns
    df.drop(["userId", "summary", "skills", "projects", "experience", "education", "job_description"], axis=1, inplace=True)

    return df

def train_model():
    """Trains an XGBoost ranking model."""
    df = load_and_process_data("resumes_with_jobs.csv")

    # Define features & target
    features = ["skill_match_score", "experience_years", "project_relevance", "job_desc_similarity"]
    X = df[features].fillna(0)
    y = df["hired"].astype(int)

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = xgb.XGBClassifier(
        objective="binary:logistic",
        booster="gbtree",
        eta=0.1,
        max_depth=6,
        subsample=0.75,
        colsample_bytree=0.75,
        eval_metric="logloss"
    )

    model.fit(X_train, y_train)
    
    # Ensure directory exists
    model_dir = "saved_models"
    os.makedirs(model_dir, exist_ok=True)
    
    # Save the model
    joblib.dump(model, os.path.join(model_dir, "job_match_model.pkl"))

if __name__ == "__main__":
    train_model()