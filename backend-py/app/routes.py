from flask import Blueprint, request, jsonify, render_template
from app.services.pdf_service import input_pdf_text
from app.services.gemini_service import get_gemini_response
from app.services.openrouter_service import resume_extractor
import logging
import os
from pathlib import Path
import requests

import joblib
import pandas as pd
from app.job_match_model.preprocess import (
    extract_experience_years, extract_skills_from_description,
    calculate_skill_match, project_relevance_score, job_desc_similarity
)

UPLOAD_PATH = Path("__DATA__")
UPLOAD_PATH.mkdir(exist_ok=True)

resume_bp = Blueprint("resume", __name__)

@resume_bp.route("/")
def index():
    return "Hello, World!"

# Load model
model = joblib.load("app/job_match_model/saved_models/job_match_model.pkl")

@resume_bp.route("/predict", methods=["POST"])
def predict():
    """Predicts job-candidate ranking based on input."""
    data = request.json
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
    return jsonify({
        "hiring_probability": prediction.tolist(),
        "skill_match_score": df["skill_match_score"].tolist(),
        "project_relevance": df["project_relevance"].tolist(),
        "job_desc_similarity": df["job_desc_similarity"].tolist()
    })


# @resume_bp.route("/process", methods=["POST"])
# def process_resume():
#     try:
#         if 'pdf_doc' not in request.files:
#             return jsonify({"error": "No file uploaded"}), 400

#         file = request.files['pdf_doc']
#         if file.filename == '':
#             return jsonify({"error": "No file selected"}), 400

#         if not file.filename.lower().endswith('.pdf'):
#             return jsonify({"error": "Only PDF files are allowed"}), 400

#         filepath = UPLOAD_PATH / "file.pdf"
#         file.save(filepath)

#         # Read PDF
#         text = input_pdf_text(filepath)
#         if not text.strip():
#             raise ValueError("PDF appears to be empty or unreadable")

#         # Extract resume data
#         result = resume_extractor(text)

#         # Clean up file
#         filepath.unlink()

#         return result

#     except Exception as e:
#         logging.exception("Error processing resume")
#         return jsonify({"error": str(e)}), 500

@resume_bp.route("/process", methods=["POST"])
def process_resume():
    try:
        if 'pdf_doc' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['pdf_doc']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        if not file.filename.lower().endswith('.pdf'):
            return jsonify({"error": "Only PDF files are allowed"}), 400

        filepath = UPLOAD_PATH / "file.pdf"
        file.save(filepath)

        # Read PDF
        text = input_pdf_text(filepath)
        if not text.strip():
            raise ValueError("PDF appears to be empty or unreadable")
        print(text)
        prompt = f"""
        You are an advanced resume parser. Extract structured information from the following resume text and return ONLY a well-formatted JSON object. Ensure accurate data extraction, following the exact structure below. 

        Resume: {text}

        Output JSON structure:
        {{
            "name": "",  # Full name of the candidate
            "email": "",  # Email address
            "mobile": "",  # Contact number
            "schoolAddress": "",  # Current address or university address
            "permanentAddress": "",  # Permanent home address
            "summary": "",  # Professional summary or objective statement

            "education": [
                {{
                    "institution": "",  # Name of university or school
                    "location": "",  # Location of the institution
                    "degree": "",  # Degree earned (e.g., BSc in Computer Science)
                    "major": "",  # Major subject (if applicable)
                    "gpa": "",  # GPA or percentage (if mentioned)
                    "honors": "",  # Any honors or distinctions received
                    "graduationYear": ""  # Year of graduation
                }}
            ],

            "experience": [
                {{
                    "role": "",  # Job title
                    "company": "",  # Company or organization name
                    "location": "",  # Work location
                    "duration": "",  # Employment period (e.g., Jan 2020 - Dec 2022)
                    "details": ""  # Key responsibilities and achievements
                }}
            ],

            "projects": [
                {{
                    "name": "",  # Project title
                    "description": "",  # Brief description of the project
                    "technologies": []  # List of technologies used
                }}
            ],

            "achievements": [
                {{
                    "title": "",  # Name of the achievement or award
                    "description": ""  # Additional details about the achievement
                }}
            ],

            "certifications": [
                {{
                    "title": "",  # Certification name
                    "issuer": "",  # Issuing organization
                    "year": ""  # Year of certification
                }}
            ],

            "skills": [{{ "name" : "", "level" : 0 }}],  # List of skills or technologies
            "languages": [],  # List of languages known
            "linkedin": "",  # LinkedIn profile link (if available)
            "github": "",  # GitHub profile link (if available)
            "portfolio": ""  # Personal website or portfolio link (if available)
        }}
        """
        response = get_gemini_response(prompt)
        return jsonify(response)

    except Exception as e:
        logging.exception("Error processing resume")
        return jsonify({"error": str(e)}), 500

@resume_bp.route("/rank-candidates", methods=["POST"])
def rank_candidates():
    """Ranks multiple candidates based on job relevance score and returns only user_id and final_score."""
    try:
        data = request.json

        # Validate input
        job_description = data.get("job_description")
        candidates = data.get("candidates", [])

        if not job_description:
            return jsonify({"error": "Job description is required"}), 400

        if not candidates or not isinstance(candidates, list):
            return jsonify({"error": "Candidates list is required"}), 400

        # Prepare dataframe
        df = pd.DataFrame(candidates)
        df["job_description"] = job_description  # Apply same JD to all candidates

        # Preprocess input
        df["experience_years"] = df["experience"].apply(lambda x: extract_experience_years(str(x)))
        df["job_skills"] = df["job_description"].apply(extract_skills_from_description)
        df["job_skills"] = df["job_skills"].apply(lambda x: str(x))
        df["skill_match_score"] = df.apply(lambda row: calculate_skill_match(row["skills"], row["job_skills"]), axis=1)
        df["project_relevance"] = df.apply(lambda row: project_relevance_score(row["projects"], row["job_description"]), axis=1)
        df["job_desc_similarity"] = df.apply(lambda row: job_desc_similarity(row["summary"], row["job_description"]), axis=1)

        # Define weights for ranking
        WEIGHT_SKILL_MATCH = 0.4
        WEIGHT_PROJECT_RELEVANCE = 0.3
        WEIGHT_JOB_DESC_SIMILARITY = 0.2
        WEIGHT_EXPERIENCE = 0.1  

        # Compute final composite score for ranking
        df["final_score"] = (
            df["skill_match_score"] * WEIGHT_SKILL_MATCH +
            df["project_relevance"] * WEIGHT_PROJECT_RELEVANCE +
            df["job_desc_similarity"] * WEIGHT_JOB_DESC_SIMILARITY +
            df["experience_years"] * WEIGHT_EXPERIENCE
        )

        # Rank candidates by final score (descending) and return only user_id & final_score
        ranked_candidates = df[["user_id", "final_score"]].sort_values(by="final_score", ascending=False).to_dict(orient="records")

        return jsonify(ranked_candidates)

    except Exception as e:
        logging.exception("Error ranking candidates")
        return jsonify({"error": str(e)}), 500

@resume_bp.route("/ats", methods=["POST"])
def ats_extraction():
    try:
        text = None

        # Check if resume URL is provided
        resume_url = request.form.get("resume_url")
        if resume_url:
            try:
                response = requests.get(resume_url)
                response.raise_for_status()
                temp_pdf_path = UPLOAD_PATH / "temp_resume.pdf"
                with open(temp_pdf_path, "wb") as f:
                    f.write(response.content)

                text = input_pdf_text(temp_pdf_path)
                temp_pdf_path.unlink()  # Cleanup temp file
            except Exception as e:
                return jsonify({"error": f"Failed to fetch resume from URL: {str(e)}"}), 400

        # Check if file is uploaded
        if not text and "pdf_doc" in request.files:
            file = request.files["pdf_doc"]
            if file.filename == "":
                return jsonify({"error": "No file selected"}), 400

            if not file.filename.lower().endswith(".pdf"):
                return jsonify({"error": "Only PDF files are allowed"}), 400

            filepath = UPLOAD_PATH / "ats_file.pdf"
            file.save(filepath)

            text = input_pdf_text(filepath)
            filepath.unlink()  # Cleanup file

        if not text or not text.strip():
            return jsonify({"error": "Resume appears to be empty or unreadable"}), 400

        jd = request.form.get("job_description")
        if not jd:
            return jsonify({"error": "Job description is required"}), 400

        prompt = f"""
        Hey, Act Like an ATS (Applicant Tracking System).
        Evaluate the resume based on the given job description.
        Assign a match percentage and list missing keywords.

        Resume: {text}
        Job Description: {jd}

        Output JSON structure:
        {{"JD Match":"%","MissingKeywords":[],"Profile Summary":""}}
        """

        response = get_gemini_response(prompt)

        return jsonify(response)

    except Exception as e:
        logging.exception("Error processing ATS extraction")
        return jsonify({"error": str(e)}), 500
    
@resume_bp.route("/extract-key-details", methods=["POST"])
def extract_key_details():
    try:
        resume_url = request.form.get("resume_url")
        if not resume_url:
            return jsonify({"error": "No resume URL provided"}), 400

        # Download the PDF from the provided URL
        try:
            response = requests.get(resume_url)
            response.raise_for_status()
            temp_pdf_path = UPLOAD_PATH / "resume_from_url.pdf"
            with open(temp_pdf_path, "wb") as f:
                f.write(response.content)
        except Exception as e:
            return jsonify({"error": f"Failed to fetch resume from URL: {str(e)}"}), 400

        # Extract text from the downloaded PDF
        text = input_pdf_text(temp_pdf_path)
        temp_pdf_path.unlink()  # Clean up the temp file after extraction

        if not text.strip():
            return jsonify({"error": "Resume appears to be empty or unreadable"}), 400

        # AI-powered parsing prompt
        prompt = f"""
        Extract only the following structured information from the resume text and return a well-formatted JSON response:

        Resume Text: {text}

        Expected JSON structure:
        {{
            "summary": "",  # Candidate's profile summary or objective
            "skills": [],  # List of technical and soft skills
            "projects": [
                {{
                    "name": "",  # Project title
                    "description": "",  # Brief project description
                    "technologies": []  # List of technologies used
                }}
            ],
            "experience": [
                {{
                    "role": "",  # Job title
                    "company": "",  # Company name
                    "duration": "",  # Employment period (e.g., Jan 2020 - Dec 2022)
                    "details": ""  # Key responsibilities and achievements
                }}
            ],
            education: [
                {{
                institution: "",
                degree: "",
                gpa: "",
                honors: "",
                }}
            ],
        }}
        """

        response = get_gemini_response(prompt)

        return jsonify(response)

    except Exception as e:
        logging.exception("Error extracting key details from resume")
        return jsonify({"error": str(e)}), 500
