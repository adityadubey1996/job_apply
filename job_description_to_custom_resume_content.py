from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium import webdriver

class JobScraper:
    def __init__(self, driver):
        """
        Initializes the JobScraper class with a Selenium WebDriver instance.

        :param driver: Selenium WebDriver instance to navigate and interact with web pages.
        """
        self.driver = driver

    def scrape_job_page(self, job_url):
        """
        Navigates to the job URL and scrapes both the job description and company details.

        :param job_url: URL of the job listing page.
        :return: Tuple containing job description and about company information.
        """
        self.driver.get(job_url)
        WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        
        job_description = self.scrape_job_description()
        about_company = self.scrape_about_company()

        return job_description, about_company

    def scrape_job_description(self):
        """
        Scrapes the job description section from the job listing page.

        :return: Text of the job description if found, otherwise None.
        """
        try:
            job_desc_section = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "styles_job-desc-container__txpYf"))
            )
            job_description = job_desc_section.text
            print("Job Description Scraped Successfully!")
            return job_description
        except Exception as e:
            print(f"Error occurred while scraping job description: {e}")
            return None

    def scrape_about_company(self):
        """
        Scrapes the about company section from the job listing page.

        :return: Text of the about company information if found, otherwise None.
        """
        try:
            about_company_section = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "styles_about-company__lOsvW"))
            )
            about_company = about_company_section.text
            print("About Company Scraped Successfully!")
            return about_company
        except Exception as e:
            print(f"Error occurred while scraping about company: {e}")
            return None
