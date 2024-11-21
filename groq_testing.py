import requests
import json

def test_groq_basic_request(api_endpoint, api_key):
    """
    Sends a basic request to the GROQ API to check if the endpoint and headers are correct.
    
    :param api_endpoint: The GROQ API endpoint URL.
    :param api_key: The API key for authentication.
    :return: The status code and response from the API.
    """
    # Basic headers
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    # Minimal payload
    payload = {
        'messages': [
            {'role': 'user', 'content': 'Hello, GROQ! Can you analyze this basic text?'}
        ],
        'model': 'llama3-70b-8192'  # Replace with the correct model if needed
    }
    
    try:
        # Send the request to the API
        response = requests.post(api_endpoint, headers=headers, data=json.dumps(payload))
        
        # Print response details for debugging
        print("Status Code:", response.status_code)
        print("Response Text:", response.text)
        
        # Return status and response for further checks if needed
        return response.status_code, response.json()

    except Exception as e:
        print(f"Error during test request: {e}")
        return None, None

# Replace with actual endpoint and API key
api_endpoint = "https://api.groq.com/openai/v1/chat/completions"  # Update to match your endpoint
api_key = "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"

# Run the basic test
test_groq_basic_request(api_endpoint, api_key)