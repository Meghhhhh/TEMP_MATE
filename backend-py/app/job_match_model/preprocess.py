import pandas as pd
import re
import ast
import nltk
import string
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

nltk.download("punkt")
nltk.download('punkt_tab')
nltk.download("stopwords")

# Define common skills
COMMON_SKILLS = {
    "python", "java", "javascript", "c++", "react", "node.js", "aws",
    "docker", "kubernetes", "machine learning", "deep learning",
    "tensorflow", "pytorch", "nlp", "flask", "django", "sql", "mongodb",
    "fastapi", "data science", "html", "css", "typescript", "angular",
    "azure", "gcp", "cloud computing", "kafka", "microservices"
}

def extract_experience_years(exp_str):
    """Extracts total years of experience from formatted experience text."""
    total_years = 0
    matches = re.findall(r'(\w{3}) (\d{4}) - (\w{3}) (\d{4})', exp_str)

    for start_month, start_year, end_month, end_year in matches:
        start_year, end_year = int(start_year), int(end_year)
        total_years += (end_year - start_year)

    return total_years

def extract_skills_from_description(job_desc):
    """Extracts skills from job description using NLTK"""
    if not isinstance(job_desc, str):
        return []

    stop_words = set(stopwords.words("english"))
    words = word_tokenize(job_desc.lower())
    words = [word for word in words if word not in stop_words and word not in string.punctuation]

    extracted_skills = [word for word in words if word in COMMON_SKILLS]
    
    return extracted_skills

def calculate_skill_match(candidate_skills, job_skills):
    """Computes skill match score (Jaccard Similarity)"""
    try:
        candidate_set = set(ast.literal_eval(candidate_skills))
        job_set = set(ast.literal_eval(job_skills))
        return len(candidate_set & job_set) / len(candidate_set | job_set) if candidate_set and job_set else 0
    except:
        return 0

def project_relevance_score(projects, job_desc):
    """Calculates project relevance using NLP similarity."""
    if not isinstance(job_desc, str) or not isinstance(projects, str):
        return 0  

    try:
        project_text = " ".join([p["description"] for p in ast.literal_eval(projects) if p.get("isVerified")])
        vectorizer = CountVectorizer().fit_transform([project_text, job_desc])
        similarity = cosine_similarity(vectorizer)[0, 1]
        return similarity
    except:
        return 0

def job_desc_similarity(summary, job_desc):
    """Computes text similarity between job description & candidate summary."""
    if not isinstance(summary, str) or not isinstance(job_desc, str):
        return 0  

    try:
        vectorizer = CountVectorizer().fit_transform([summary, job_desc])
        return cosine_similarity(vectorizer)[0, 1]
    except:
        return 0