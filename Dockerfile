# Use Python base image
FROM python:3.10.5

# Set working directory
WORKDIR /app

# Copy requirements.txt and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy your application files into the container
COPY . .

# Define environment variable for the Selenium URL
ENV SELENIUM_URL=http://selenium-chrome:4444/wd/hub

# Run your Python application (adjust the command as needed)
CMD ["python", "fetch_save_html.py"]