import requests

url = "https://python-job-portal-backend.onrender.com/predict"
# url = "http://127.0.0.1:5000/predict"
data = {
    "experience": "Mar 2020 - Sep 2023",
    "skills": '[{"name": "python"}, {"name": "tensorflow"}]',
    "summary": "Experienced machine learning engineer.",
    "projects": '[{"description": "Built an AI chatbot", "isVerified": true}]',
    "job_description": "Devops engineer with experience in AWS and Docker."
}

response = requests.post(url, json=data)
print(response.json())