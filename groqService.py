import json
import requests
from datetime import datetime
import yaml
import re

class GROQResumeOptimizer:
    def __init__(self, api_endpoint, api_key, user_yaml_path):
        self.api_endpoint = api_endpoint
        self.api_key = api_key
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        self.user_yaml_path = user_yaml_path
        self.extracted_data = self.extract_relevant_content()

    def read_yaml(self, yaml_file):
        with open(yaml_file, 'r') as file:
            return yaml.safe_load(file)
    

    def extract_relevant_content(self):
        user_data = self.read_yaml(self.user_yaml_path)
        # Extract necessary content
        extracted_data = {
            "personal_information": user_data.get("personal_information", {}),
            "education_details": user_data.get("education_details", []),
            "experience_details": user_data.get("experience_details", []),
            "projects": user_data.get("projects", []),
            "achievements": user_data.get("achievements", []),
            "certifications": user_data.get("certifications", []),
            "languages": user_data.get("languages", [])
        }
        return extracted_data

    def create_prompt(self, job_description):
        prompt = {
    "context": [
        {
            "task": "Resume Optimization",
            "objective": (
                "Optimize the provided resume for maximum ATS compatibility while retaining core information. "
                "Ensure the response aligns with the provided job description and follows a structured format for easy YAML and LaTeX conversion."
            )
        },
        {
            "instruction": (
                "Respond with the resume content in JSON format, following the provided YAML structure exactly. "
                "Ensure there is no additional commentary, explanation, or formatting outside the JSON block. "
                "Only the JSON data should be returned, formatted for direct YAML serialization."
            )
        }
    ],
    "sections": [
        {
            "section": "personal_information",
            "details": (
                "Provide details including 'name', 'surname', 'date_of_birth', 'country', 'city', 'address', "
                "'phone_prefix', 'phone', 'email', 'github', and 'linkedin'. "
                "Ensure each field is filled accurately and professionally."
            )
        },
        {
            "section": "professional_summary",
            "details": (
                "Provide a 'summary' field with a concise and ATS-optimized professional summary, "
                "emphasizing relevant skills, experience, and specific achievements that align with the job description."
            )
        },
        {
            "section": "skills",
            "details": (
                "List relevant skills as individual items in an array, using ATS-friendly terminology. "
                "Ensure each skill directly relates to the job description."
            )
        },
        {
            "section": "experience_details",
            "details": [
                "For each role, include 'position', 'company', 'employment_period', 'location', and 'industry' fields. ",
                "Provide an array of 'key_responsibilities' with bullet-point achievements and responsibilities that are ATS-optimized, using quantified achievements where possible.",
                "Add an array of 'skills_acquired' relevant to each role, with each skill listed individually."
            ]
        },
        {
            "section": "education_details",
            "details": (
                "Include 'degree', 'university', 'gpa', 'graduation_year', and 'field_of_study' fields. "
                "Provide an array of 'courses' with each course listed as a key-value pair, where the key is the course name and the value is the grade."
            )
        },
        {
            "section": "certifications",
            "details": "Provide each certification as a string in an array, retaining original names and issuing organizations."
        },
        {
            "section": "projects",
            "details": [
                "List projects as objects with 'name', 'description', and 'link' fields. ",
                "Ensure each project highlights relevant technologies and outcomes."
            ]
        },
        {
            "section": "achievements",
            "details": [
                "Provide achievements as objects with 'name' and 'description' fields. ",
                "Highlight achievements relevant to the job description."
            ]
        },
        {
            "section": "languages",
            "details": (
                "List languages as objects, each containing 'language' and 'proficiency' fields. "
                "Use terminology like 'Professional', 'Fluent', or 'Native' to indicate proficiency."
            )
        },
        {
            "section": "ATS_Score_Check",
            "details": (
                "At the end, include an 'ATS_Score_Check' field with 'score' and 'improvement_suggestions'. "
                "Provide an overall ATS score as a numeric value, and suggest further improvements for keyword density, action verbs, and quantifiable achievements."
            )
        }
    ],
    "job_description": job_description,
    "response_format": (
        "Please respond only with the following strict JSON structure, without any extra explanation or formatting:\n\n"
        "{\n"
        "  \"personal_information\": {...},\n"
        "  \"professional_summary\": {\"summary\": \"...\"},\n"
        "  \"skills\": [...],\n"
        "  \"experience_details\": [{...}],\n"
        "  \"education_details\": [{...}],\n"
        "  \"certifications\": [...],\n"
        "  \"projects\": [{...}],\n"
        "  \"achievements\": [{...}],\n"
        "  \"languages\": [{...}],\n"
        "  \"ATS_Score_Check\": {\"score\": ..., \"improvement_suggestions\": [...]}\n"
        "}"
    ),
    "user_resume": self.extracted_data,
}
        return prompt

    def send_groq_request(self, prompt):
        payload = {
            'messages': [
                {'role': 'user', 'content': json.dumps(prompt)}
            ],
            'model': 'llama3-70b-8192'  # Replace with the correct model if needed
        }
        
        try:
            response = requests.post(self.api_endpoint, headers=self.headers, data=json.dumps(payload))
            if response.status_code == 200:
                response_json = response.json()
                # Assuming the content is nested within `choices` -> `message` -> `content`
                content = response_json.get('choices', [{}])[0].get('message', {}).get('content', "")
                if content:
                    return content  # Return only the relevant content
                else:
                    print("Content not found in response.")
                    return None
            else:
                print("Error:", response.status_code, response.text)
                return None
        except Exception as e:
            print(f"Request error: {e}")
            return None
    
    def extract_content(self, response):
        """
        Extracts JSON content from a plain text response, converts it to YAML, and saves it to a file.
    
        :param response_content: The raw response content from the model.
        :param filename: The name of the YAML file to save.
        :return: The name of the YAML file if successful, else None.
        """
        # Step 1: Locate the JSON content within the response
        start_index = response.find('{')
        end_index = response.rfind('}')

        if start_index == -1 or end_index == -1:
            print("No JSON content found in the response.")
            return None

        json_content = response[start_index:end_index + 1]

        # Step 2: Parse the extracted JSON content to a Python dictionary
        try:
            data = json.loads(json_content)
            return data
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")
            return None

    def optimize_resume(self, job_description):
        # Step 1: Extract relevant information

        # Step 2: Create prompt for GROQ model
        prompt = self.create_prompt(job_description)

        # Step 3: Send the request to GROQ and get optimized content
        response = self.send_groq_request(prompt)

        # Process the response (e.g., saving the response as a new YAML file) or return it directly
        if response:
            print("Received optimized resume content:", response)
            formatted_data = self.extract_content(response)
            print(f"formatted data {formatted_data}")
            filename = self.save_to_yaml(formatted_data)
            print(f"Saved YAML to {filename}")
            return filename  # Return filename for reference

        return None

    def save_to_yaml(self, data, filename="optimized_resume.yaml"):
        """
        Saves the given data to a YAML file.
        
        :param data: The structured data to save.
        :param filename: The name of the YAML file to create.
        """

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        full_filename = f"{filename.split('.')[0]}_{timestamp}.yaml"  # Adds timestamp for uniqueness
        
        with open(full_filename, "w") as file:
            yaml.dump(data, file, default_flow_style=False)
        return full_filename