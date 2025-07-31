import requests
import datetime
import time

# Your API token
API_TOKEN = "9RRfkWhjMRyWiIpf5Z7VOIARU8JsTZuXvvhZ26pU6G05Ntl5WueQhd5fptVY"

# European league IDs (your target leagues)
EUROPEAN_LEAGUE_IDS = {
    8, 27, 39, 61, 78, 135, 140, 203, 218, 244, 245, 257, 262, 263, 271, 301, 384, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510
}

def test_api_directly():
    """Test the API directly to see what fixtures are available."""
    print("=== TESTING SPORTMONKS API DIRECTLY ===")
    
    # Calculate date range
    today = datetime.datetime.now()
    start_date = today - datetime.timedelta(days=2)  # 2 days ago
    end_date = datetime.datetime(2025, 8, 31)  # End of August 2025
    
    # Format dates as YYYY-MM-DD for the API
    start_date_str = start_date.strftime("%Y-%m-%d")
    end_date_str = end_date.strftime("%Y-%m-%d")
    
    print(f"Date range: {start_date_str} to {end_date_str}")
    print(f"Today: {today.strftime('%Y-%m-%d')}")
    
    # Test the API endpoint
    url = f"https://api.sportmonks.com/v3/football/fixtures/between/{start_date_str}/{end_date_str}"
    
    params = {
        "api_token": API_TOKEN,
        "include": "participants;scores;league;venue;state",
        "per_page": 10,  # Just get first 10 for testing
        "order": "starting_at:asc"
    }
    
    print(f"\nTesting URL: {url}")
    print(f"Params: {params}")
    
    try:
        response = requests.get(url, params=params)
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API call successful!")
            
            if "data" in data and data["data"] is not None:
                fixtures = data["data"]
                if isinstance(fixtures, list):
                    print(f"Found {len(fixtures)} fixtures in first page")
                    
                    # Show first few fixtures
                    for i, fixture in enumerate(fixtures[:5]):
                        fixture_id = fixture.get("id")
                        name = fixture.get("name")
                        starting_at = fixture.get("starting_at")
                        league_id = fixture.get("league_id")
                        print(f"  {i+1}. ID: {fixture_id} | {name} | {starting_at} | League: {league_id}")
                        
                        # Check if it's in our target leagues
                        if league_id in EUROPEAN_LEAGUE_IDS:
                            print(f"     ✅ In target league!")
                        else:
                            print(f"     ❌ Not in target league")
                else:
                    print(f"Single fixture found: {fixtures}")
            else:
                print("No fixtures found in response")
                
            # Check pagination
            if "pagination" in data and data["pagination"] is not None:
                pagination = data["pagination"]
                print(f"\nPagination info:")
                print(f"  Current page: {pagination.get('current_page')}")
                print(f"  Total pages: {pagination.get('total_pages')}")
                print(f"  Total results: {pagination.get('total_results')}")
                print(f"  Has more: {pagination.get('has_more')}")
        else:
            print(f"❌ API call failed with status {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing API: {e}")

def test_specific_date_range():
    """Test a specific date range that should have fixtures."""
    print(f"\n=== TESTING SPECIFIC DATE RANGE ===")
    
    # Test July 2025 specifically
    start_date_str = "2025-07-01"
    end_date_str = "2025-07-31"
    
    print(f"Testing July 2025: {start_date_str} to {end_date_str}")
    
    url = f"https://api.sportmonks.com/v3/football/fixtures/between/{start_date_str}/{end_date_str}"
    
    params = {
        "api_token": API_TOKEN,
        "include": "participants;scores;league;venue;state",
        "per_page": 10,
        "order": "starting_at:asc"
    }
    
    try:
        response = requests.get(url, params=params)
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if "data" in data and data["data"] is not None:
                fixtures = data["data"]
                if isinstance(fixtures, list):
                    print(f"Found {len(fixtures)} fixtures in July 2025")
                    
                    # Show first few fixtures
                    for i, fixture in enumerate(fixtures[:5]):
                        fixture_id = fixture.get("id")
                        name = fixture.get("name")
                        starting_at = fixture.get("starting_at")
                        league_id = fixture.get("league_id")
                        print(f"  {i+1}. ID: {fixture_id} | {name} | {starting_at} | League: {league_id}")
                        
                        # Check if it's in our target leagues
                        if league_id in EUROPEAN_LEAGUE_IDS:
                            print(f"     ✅ In target league!")
                        else:
                            print(f"     ❌ Not in target league")
                else:
                    print(f"Single fixture found: {fixtures}")
            else:
                print("No fixtures found in July 2025")
        else:
            print(f"❌ API call failed with status {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing API: {e}")

if __name__ == "__main__":
    test_api_directly()
    test_specific_date_range() 