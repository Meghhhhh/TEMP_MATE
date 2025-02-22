import requests

# url = "https://python-job-portal-backend.onrender.com/rank-candidates"
url = "http://127.0.0.1:5001/rank-candidates"
data = {
    "job_description": "Looking for a Python Backend Developer with Flask and MongoDB experience.",
    "candidates": [
        {
            "user_id": "123",
            "experience": "5 years in backend development",
            "skills": "Python, Flask, MongoDB, AWS",
            "summary": "Backend engineer with cloud experience",
            "projects": ["E-commerce API", "Authentication system"]
        },
        {
            "user_id": "456",
            "experience": "3 years in web development",
            "skills": "Python, Django, PostgreSQL",
            "summary": "Django developer passionate about REST APIs",
            "projects": ["Portfolio website", "Blog system"]
        }
    ]
}

response = requests.post(url, json=data)
print(response.json())