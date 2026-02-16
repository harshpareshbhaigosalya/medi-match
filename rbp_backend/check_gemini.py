
import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("GEMINI_API_KEY not found")
    exit(1)

url = f"https://generativelanguage.googleapis.com/v1/models?key={api_key}"
try:
    r = requests.get(url, timeout=10)
    r.raise_for_status()
    models = r.json().get("models", [])
    print(f"Successfully connected to Gemini API. Found {len(models)} models.")
    for m in models:
        print(f"- {m['name']} ({m.get('supportedGenerationMethods')})")
except Exception as e:
    print(f"Error: {e}")
    if hasattr(e, 'response') and e.response:
        print(f"Response: {e.response.text}")
