
import os
import requests
from dotenv import load_dotenv
import json

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
model = os.getenv("GEMINI_MODEL") or "gemini-1.5-flash"

url = f"https://generativelanguage.googleapis.com/v1/models/{model}:generateContent?key={api_key}"
body = {
    "contents": [
        {
            "parts": [
                {"text": "Hello, say hi!"}
            ]
        }
    ]
}

try:
    r = requests.post(url, json=body, timeout=10)
    r.raise_for_status()
    print(json.dumps(r.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
    if hasattr(e, 'response') and e.response:
        print(f"Response: {e.response.text}")
