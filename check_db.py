import requests
import json

SUPABASE_URL = 'https://qfvmqotkhjkewdwzibyb.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c'

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

def check_table(table_name):
    print(f"--- Checking {table_name} ---")
    url = f"{SUPABASE_URL}/rest/v1/{table_name}?select=*&limit=5"
    try:
        r = requests.get(url, headers=headers)
        if r.status_code != 200:
            print(f"Error: {r.status_code} {r.text}")
            return
        
        data = r.json()
        print(f"Count (limit 5): {len(data)}")
        if len(data) > 0:
            print("Sample Keys:", data[0].keys())
            print("Sample Data:", data[0])
        else:
            print("Table is empty (or no access).")
    except Exception as e:
        print(f"Exception: {e}")

check_table("finished_goods")
check_table("product_logistics_specs")
