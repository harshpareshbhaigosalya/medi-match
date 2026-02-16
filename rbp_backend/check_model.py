
import os
import requests
from dotenv import load_dotenv
import json

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("GEMINI_API_KEY not found")
    exit(1)

model = os.getenv("GEMINI_MODEL") or "gemini-1.5-flash"
if model.startswith("models/"):
    model_name = model
else:
    model_name = f"models/{model}"

url = f"https://generativelanguage.googleapis.com/v1/{model_name}?key={api_key}"
try:
    r = requests.get(url, timeout=10)
    r.raise_for_status()
    print(json.dumps(r.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
    if hasattr(e, 'response') and e.response:
        print(f"Response: {e.response.text}")
