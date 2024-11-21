import yaml

def generate_google_job_search_query(data):
    # Format designations with OR separator
    designations = " OR ".join([f'"{designation}"' for designation in data['designations']])
    
    # Format experience requirement
    experience = f'"{data["experience"]} years experience"'
    
    # Format job types with OR separator
    job_types = " OR ".join([f'"{job_type}"' for job_type in data['job_type']])
    
    # Format locations with OR separator
    locations = " OR ".join([f'"{location}"' for location in data.get('location', [])])
    
    # Construct the search query
    query = f"{designations} {experience} ({job_types}) ({locations}) site:linkedin.com/jobs OR site:indeed.com OR site:naukri.com"
    
    return query

def load_config(file_path="credentials.yml"):
    with open(file_path, "r") as file:
        credentials = yaml.safe_load(file)
    return credentials



# Generate and print the search query
google_query = generate_google_job_search_query(load_config())
print("Google Search Query:")
print(google_query)