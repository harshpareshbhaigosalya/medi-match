
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
supabase = create_client(url, key)

try:
    # Try to fetch columns info by describing the table via select('*')
    res = supabase.table("orders").select("*").limit(0).execute()
    # Note: select('*') with limit 0 still returns column names in some clients or we can check a sample row
    res_sample = supabase.table("orders").select("*").limit(1).execute()
    if res_sample.data:
        cols = list(res_sample.data[0].keys())
        print("COLUMNS_FOUND:", cols)
        print("stripe_session_id_exists:", "stripe_session_id" in cols)
        print("payment_id_exists:", "payment_id" in cols)
    else:
        print("NO_DATA_TO_INSPECT")
except Exception as e:
    print(f"ERROR_INSPECTING: {e}")
