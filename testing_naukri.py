import os
import time
import yaml
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import base64
from job_description_to_custom_resume_content import JobScraper
from groqService import GROQResumeOptimizer
from resume_generator import ResumeGenerator


# Add your GROQ API details here
groq_api_endpoint = "https://api.groq.com/openai/v1/chat/completions"  # Replace with actual endpoint
groq_api_key = "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"  # Replace with actual API key

# Initialize the communicator
groq_resume_optimizer = GROQResumeOptimizer(api_endpoint=groq_api_endpoint, api_key=groq_api_key, user_yaml_path="plain_text_resume.yaml")

# Assuming GroqCommunicator class is defined elsewhere in your codebase

def init_browser():
    # Check environment variable to determine if remote or local browser should be used
    use_remote = os.getenv('USE_REMOTE_SELENIUM', 'True').lower() == 'false'
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    if use_remote:
        # Use the remote Selenium server
        selenium_url = os.getenv('SELENIUM_URL', 'http://localhost:4444/wd/hub')
        driver = webdriver.Remote(command_executor=selenium_url, options=options)
        print("Using remote Selenium server.")
    else:
        # Use local Chrome browser
        driver = webdriver.Chrome(options=options)
        print("Using local Chrome browser for debugging.")
    
    # selenium_url = os.getenv('SELENIUM_URL', 'http://localhost:4444/wd/hub')
    # driver = webdriver.Remote(command_executor=selenium_url, options=options)
    return driver
def load_config(file_path="credentials.yml"):
    with open(file_path, "r") as file:
        credentials = yaml.safe_load(file)
    return credentials

def load_credentials(file_path="credentials.yml"):
    with open(file_path, "r") as file:
        credentials = yaml.safe_load(file)
    return credentials.get("naukri", {})

def capture_screenshot(driver):
    screenshot = driver.get_screenshot_as_png()
    return base64.b64encode(screenshot).decode('utf-8')  # Return screenshot as a base64-encoded string

def get_page_html(driver):
    return driver.page_source  # Return HTML content

def load_designations(file_path="credentials.yml"):
    with open(file_path, "r") as file:
        config = yaml.safe_load(file)
    return config.get("designations", [])

def activate_search_field(driver):
    # Locate the search box placeholder and click to activate the field
    search_placeholder = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//span[contains(text(), 'Search jobs here')]"))
    )
    search_placeholder.click()
    print(f"Clicked on search field placeholder.")  

def search_and_select_first_option(driver, designation):
    try:
        

        # Wait for the actual input field to become visible
        input_field = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//input[@placeholder='Enter keyword / designation / companies']"))
        )
        
        # Type in the designation
        input_field.send_keys(designation)
        print(f"Typed '{designation}' in the search field.")
        time.sleep(2)  # Pause briefly to allow suggestions to load

        # Select the first option from the dropdown
        first_option = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//ul[@class='layer-wrap']/li[1]"))
        )
        first_option.click()
        print(f"Selected the first dropdown option for '{designation}'.")

    except Exception as e:
        print(f"Error occurred while searching for designation '{designation}': {e}")

def select_experience(driver, experience):
    try:
        # Convert experience to the appropriate display text (e.g., "3 years" or "Fresher" for 0 years)
        experience_text = "Fresher" if experience == 0 else f"{experience} year" if experience == 1 else f"{experience} years"

        # Click on the experience input field to reveal the dropdown
        experience_input = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "experienceDD"))
        )
        experience_input.click()
        print("Clicked on experience dropdown.")

        # Wait for the dropdown container to appear and locate all items by XPath
        dropdown_items = WebDriverWait(driver, 10).until(
            EC.visibility_of_all_elements_located((By.XPATH, "//*[@id='sa-dd-scrollexperienceDD']/div[1]/ul/li"))
        )
         # Check if the desired experience index is within bounds
        if 0 <= experience < len(dropdown_items):
            # Select the experience by index
            dropdown_items[experience].click()
            print(f"Selected experience level: {experience} year(s)")
        else:
            print(f"Experience level {experience} is out of range. No selection made.")
    except Exception as e:
        print(f"Error occurred while selecting experience level: {e}")
        
# Function to search and select location
def search_and_select_location(driver, location):
    try:
        location_input = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//input[@placeholder='Enter location']"))
        )
        location_input.send_keys(location)
        time.sleep(2)  # Brief pause for suggestions to load

        # Select the first option from dropdown if available
        first_option = WebDriverWait(driver, 5).until(
            EC.visibility_of_element_located((By.XPATH, "//ul[@class='layer-wrap']/li[1]"))
        )
        first_option.click()
        print(f"Selected location: {location}")
    except Exception as e:
        print(f"No match found for location '{location}': {e}")

def extract_job_links(driver):
    try:
        # Wait for the job results to load by waiting for job card elements to be visible
        job_cards = WebDriverWait(driver, 10).until(
            EC.visibility_of_all_elements_located((By.CLASS_NAME, "srp-jobtuple-wrapper"))
        )
        
        job_links = []
        for job_card in job_cards:
            # Find the anchor tag with the job title within each job card
            job_title_element = job_card.find_element(By.CLASS_NAME, "title")
            job_url = job_title_element.get_attribute("href")
            job_links.append(job_url)

        print("Extracted job links:")
        for link in job_links:
            print(link)

        return job_links  # Optionally return the list if needed elsewhere

    except Exception as e:
        print(f"Error occurred while extracting job links: {e}")
        return []

def customize_resume(yaml_file_path, job_description, about_company):
    """
    Reads the existing resume YAML file, updates it with custom content based on job description 
    and company details, and writes the updated resume back.
    """
    with open(yaml_file_path, 'r') as file:
        resume_data = yaml.safe_load(file)

    # Customize the summary section based on job description and company information
    resume_data['summary'] = f"Experienced {resume_data['experience_details'][0]['position']} with expertise in " \
                             f"{resume_data['experience_details'][0]['industry']}. Skilled in {', '.join(resume_data['experience_details'][0]['skills_acquired'])}. " \
                             f"Currently seeking opportunities that align with the mission and vision of {about_company.split()[1]}."

    # Update key points to align with job description
    key_points = job_description.split("Key Responsibilities:")[1] if "Key Responsibilities:" in job_description else job_description
    resume_data['experience_details'][0]['key_responsibilities'].append({
        "customized_for_job": key_points.strip()
    })

    # Save the customized resume
    with open('custom_resume.yml', 'w') as file:
        yaml.dump(resume_data, file)

    print("Custom resume created based on job description and company information.")



def scrape_job_description(driver):
    """Scrapes the job description section from the job listing page."""
    try:
        # Wait and locate the job description section
        job_desc_section = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "styles_job-desc-container__txpYf"))
        )
        job_description = job_desc_section.text
        print("Job Description Scraped Successfully!")
        return job_description

    except Exception as e:
        print(f"Error occurred while scraping job description: {e}")
        return None

def scrape_about_company(driver):
    """Scrapes the about company section from the job listing page."""
    try:
        # Wait and locate the about company section
        about_company_section = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "styles_about-company__lOsvW"))
        )
        about_company = about_company_section.text
        print("About Company Scraped Successfully!")
        return about_company

    except Exception as e:
        print(f"Error occurred while scraping about company: {e}")
        return None

def scrape_job_page(driver, job_url):
    """Navigates to the job URL and scrapes both the job description and company details."""
    driver.get(job_url)
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    
    job_description = scrape_job_description(driver)
    about_company = scrape_about_company(driver)

    return job_description, about_company

def main():
    driver = init_browser()
    job_url = "https://www.naukri.com/"
    config = load_config()
    credentials = config['naukri']
    designations = config['designations']
    experience = config['experience']
    locations = config['location']
    print('Desingations', designations)
    try:
        # driver.get(job_url)
        # time.sleep(5)

        # # Click the initial "Login" link
        # login_button = driver.find_element(By.LINK_TEXT, "Login")
        # login_button.click()
        # print("Clicked the login button.")

        # # Wait for email field and enter email
        # email_input = WebDriverWait(driver, 10).until(
        #     EC.visibility_of_element_located((By.XPATH, "//input[@placeholder='Enter your active Email ID / Username']"))
        # )
        # email_input.send_keys(credentials.get("email"))
        # print("Entered email.")

        # # Wait for password field and enter password
        # password_input = WebDriverWait(driver, 10).until(
        #     EC.visibility_of_element_located((By.XPATH, "//input[@placeholder='Enter your password']"))
        # )
        # password_input.send_keys(credentials.get("password"))
        # print("Entered password.")
        
        # # Wait for and click the "Login" button to submit the form
        # submit_button = WebDriverWait(driver, 10).until(
        #     EC.element_to_be_clickable((By.XPATH, "//button[@type='submit' and contains(@class, 'loginButton')]"))
        # )
        # submit_button.click()
        # print("Submitted login form.")

        # time.sleep(10)


        # # Save a screenshot after logging in to verify login success
        # driver.save_screenshot("after_login_screenshot.png")
        # print("Saved screenshot after login as 'after_login_screenshot.png'.")

        # activate_search_field(driver)
        # time.sleep(3)
        # # After logging in, iterate through designations and search for each one
        # for designation in designations:
        #     search_and_select_first_option(driver, designation)
        #     time.sleep(3)  # Pause before moving to the next designation

        # # Select experience
        # select_experience(driver, experience)

        # # Enter and select locations
        # for location in locations:
        #     search_and_select_location(driver, location)

        # # Click the search button
        # search_button = WebDriverWait(driver, 10).until(
        #     EC.element_to_be_clickable((By.XPATH, "//button[contains(@class, 'nI-gNb-sb__icon-wrapper')]"))
        # )
        # search_button.click()
        # print("Clicked the search button to initiate job search.")

        # driver.save_screenshot("after_applying_filteres_screenshot.png")
        # print("Saved screenshot after applying filter as 'after_applying_filteres_screenshot.png'.")

        # # Wait for results to load and extract job links
        # job_links = extract_job_links(driver)
        # print('job_links extracted', job_links)

        scraper = JobScraper(driver)

        job_url = "https://www.naukri.com/job-listings-react-js-developer-kalyani-studio-technology-partner-of-kalyani-forge-pune-0-to-4-years-291024004596?src=simJobDeskACP&sid=17314994709778819&xp=1&px=1"

        # Scrape job description and about company details
        job_description, about_company = scraper.scrape_job_page(job_url)
        
        # Print the results
        # print("Job Description:", job_description)
        # print("About Company:", about_company)

        # filename = groq_resume_optimizer.optimize_resume(job_description)
        
        # print(f"file Name received is filename ${filename}")
        # generator = ResumeGenerator(yaml_file=filename)
        # generator.compile_latex()




        # Customize the resume based on scraped content
        # customize_resume("sample_resume.yml", job_description, about_company)

    except Exception as e:
        print(f"Error occurred: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    main()