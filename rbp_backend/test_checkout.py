
import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "https://medi-match-8u18.onrender.com/api"
# Use a test token if possible, or we might need to skip auth for this test or use a real token
# For now, I'll just check if the endpoint responds correctly to a dummy request
# Actually, I can't easily get a token without user interaction.

# I'll try to call it and see if it hits the "DEBUG" prints.
try:
    # Just a ping to see if server is up
    res = requests.get(f"{BASE_URL}/cart/", headers={"Authorization": "Bearer DUMMY"})
    print("Server response:", res.status_code)
except Exception as e:
    print("Error connecting:", e)
