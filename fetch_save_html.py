import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def init_browser():
    try:
        print("Initializing the browser...")
        # Get the Selenium URL from environment variables, with a default for local testing
        selenium_url = os.getenv('SELENIUM_URL', 'http://localhost:4444/wd/hub')
        
        # Setup Chrome options
        options = webdriver.ChromeOptions()
        options.add_argument("--start-maximized")  # Maximize browser window
        
        # Use Remote WebDriver to connect to the remote Selenium server
        driver = webdriver.Remote(command_executor=selenium_url, options=options)
        print("Browser initialized successfully.")
        return driver
    except Exception as e:
        print(f"Error occurred during browser initialization: {e}")
        raise

def save_page_html(driver, filename="naukri_page_source.html"):
    try:
        # Get the rendered HTML
        print("Saving page HTML...")
        rendered_html = driver.page_source

        # Save the HTML content to a file
        with open(filename, 'w', encoding='utf-8') as file:
            file.write(rendered_html)

        print(f"HTML content saved to {filename}")

    except Exception as e:
        print(f"Error occurred while saving HTML: {e}")

def main():
    try:
        driver = init_browser()
        job_url = "https://www.naukri.com/"
        print("Navigating to Naukri URL...")

        # Load the job portal page
        driver.get(job_url)
        print("Page loaded. Waiting for content to render...")
        time.sleep(5)  # Give time for JavaScript to execute and the page to fully load

        # Find the "Login" button by text and click it
        try:
            login_button = driver.find_element(By.LINK_TEXT, "Login")
            login_button.click()
            print("Clicked the login button.")
        except Exception as e:
            print(f"Error finding or clicking the login button: {e}")
            driver.quit()
            return

        # Wait for the email input field to appear
        try:
            email_input = WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.XPATH, "//input[@placeholder='Enter your active Email ID / Username']"))
            )
            print("Email input field is visible.")
            
            # Take a screenshot after clicking the login button
            driver.save_screenshot("login_page_screenshot.png")
            print("Screenshot saved as 'login_page_screenshot.png'")
            
            # Save the page HTML
            save_page_html(driver, "naukri_login_page_source.html")

        except Exception as e:
            print(f"Email input field is not visible or there was an error: {e}")

    except Exception as e:
        print(f"Error occurred: {e}")
    finally:
        print("Closing the browser...")
        driver.quit()

if __name__ == "__main__":
    main()