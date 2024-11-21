import requests
import json
import logging
from selenium import webdriver
from bs4 import BeautifulSoup
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import yaml

# Initialize logging
logging.basicConfig(filename="groq_resume_builder.log", level=logging.INFO)

class GroqService:
    def __init__(self, api_endpoint, api_key=None):
        self.api_endpoint = api_endpoint
        self.api_key = api_key
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}' if api_key else None
        }

    def send_content_for_analysis(self, html_content):
        payload = {
            "html_content": html_content,
            "context": "extract_job_information"
        }
        
        logging.info("Sending content to GROQ for analysis.")
        
        try:
            response = requests.post(self.api_endpoint, headers=self.headers, data=json.dumps(payload))
            if response.status_code == 200:
                logging.info("GROQ analysis successful.")
                return response.json()  # Returns structured JSON response
            else:
                logging.warning(f"Failed to analyze content. Status Code: {response.status_code} and response {response.json()}")
                return None
        except Exception as e:
            logging.error(f"Error during GROQ request: {str(e)}")
            return None

def scrape_job_details(driver, job_url):
    """Scrapes the job description and company information from a job listing page."""
    
    # Load the job URL and wait until the page is fully loaded
    driver.get(job_url)
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    
    # Get the full page HTML content
    html_content = driver.page_source

    # Parse the HTML content with BeautifulSoup
    soup = BeautifulSoup(html_content, 'html.parser')

    # Extract job description text
    job_desc_section = soup.find('section', class_='styles_job-desc-container__txpYf')
    job_description_text = job_desc_section.get_text(separator='\n', strip=True) if job_desc_section else "Job description not found"

    # Extract about company text
    about_company_section = soup.find('section', class_='styles_about-company__lOsvW')
    about_company_text = about_company_section.get_text(separator='\n', strip=True) if about_company_section else "About company not found"

    return job_description_text, about_company_text

def create_custom_resume(structured_data, resume_template_path="resume_template.yml"):
    """
    Uses the structured job data to create a custom resume by modifying a template file.
    """

    with open(resume_template_path, 'r') as file:
        resume_data = yaml.safe_load(file)

    # Populate resume fields with structured data from GROQ
    resume_data['summary'] = f"Experienced {structured_data['job_title']} with a background in " \
                             f"{structured_data['company_name']}. Skilled in relevant technologies " \
                             f"and methodologies as required by the role."

    resume_data['experience_details'][0]['key_responsibilities'].append({
        "customized_for_job": structured_data.get('responsibilities', "No specific responsibilities listed.")
    })
    resume_data['skills'] = structured_data.get('key_skills', resume_data['skills'])

    # Save the customized resume to a new YAML file
    with open('custom_resume.yml', 'w') as file:
        yaml.dump(resume_data, file)

    logging.info("Custom resume created successfully.")
    print("Custom resume generated as 'custom_resume.yml'.")

# Main execution
if __name__ == "__main__":
    # Define the GROQ API details
    groq_api_endpoint = "https://api.groq.com/openai/v1/chat/completions"  # Update to match your endpoint
    groq_api_key = "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"

    # Initialize the GROQ service
    groq_service = GroqService(api_endpoint=groq_api_endpoint, api_key=groq_api_key)

    # Setup Selenium WebDriver
    driver = webdriver.Chrome()  # Update this with your driver setup

    # Example job listing URL
    job_url = "https://www.naukri.com/job-listings-react-js-developer-novel-office-bengaluru-0-to-2-years-130824014928"

    # Scrape the full HTML content
    html_content = scrape_job_details(driver, job_url)

    logging.info('html_content retrieved', html_content)


    # Send HTML content to GROQ for analysis
    structured_data = groq_service.send_content_for_analysis(html_content)

    # Process the GROQ response and generate a custom resume
    if structured_data:
        create_custom_resume(structured_data)
    else:
        print("Failed to retrieve structured data from GROQ.")

    # Close the WebDriver
    driver.quit()