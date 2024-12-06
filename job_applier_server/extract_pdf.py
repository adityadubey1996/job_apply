import sys
import json
import pymupdf4llm  # Assuming you are using pymupdf4llm

def log_to_stderr(message):
    """
    Log messages to stderr to avoid interfering with stdout.
    """
    print(message, file=sys.stderr)

def main(file_path):
    try:

        # Extract text using pymupdf4llm
        extracted_text = pymupdf4llm.to_markdown(file_path)

        # Sanitize the extracted text
        sanitized_text = extracted_text.encode("utf-8", "ignore").decode("utf-8")

        # Create structured JSON
        structured_data = {"content": sanitized_text}

        # Output only JSON to stdout
        print(json.dumps(structured_data))
    except Exception as e:
        # Log errors to stderr
        log_to_stderr(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        log_to_stderr("Usage: python extract_pdf.py <file_path>")
        sys.exit(1)

    file_path = sys.argv[1]
    main(file_path)