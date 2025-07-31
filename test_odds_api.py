# TEST ODDS API ENDPOINT

import requests
import json

# Configuration
API_TOKEN = "9RRfkWhjMRyWiIpf5Z7VOIARU8JsTZuXvvhZ26pU6G05Ntl5WueQhd5fptVY"

def test_odds_endpoints():
    """Test different odds API endpoints to find the correct one."""
    
    # Test fixture ID (let's try a few different ones)
    test_fixtures = [
        19441640,  # From your list
        19441644,  # From your list
        1000000,   # Try a different range
        2000000,   # Try another range
    ]
    
    # Test different endpoint patterns
    endpoints = [
        "https://api.sportmonks.com/v3/football/odds/fixtures/{fixture_id}",
        "https://api.sportmonks.com/v3/football/fixtures/{fixture_id}/odds",
        "https://api.sportmonks.com/v3/football/odds/{fixture_id}",
        "https://api.sportmonks.com/v3/football/fixtures/{fixture_id}?include=odds",
    ]
    
    for fixture_id in test_fixtures:
        print(f"\n=== TESTING FIXTURE {fixture_id} ===")
        
        for endpoint in endpoints:
            url = endpoint.format(fixture_id=fixture_id)
            params = {"api_token": API_TOKEN}
            
            try:
                print(f"  Testing: {url}")
                response = requests.get(url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"    ✅ SUCCESS! Status: {response.status_code}")
                    print(f"    Data keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
                    
                    if "data" in data and data["data"]:
                        if isinstance(data["data"], list):
                            print(f"    Found {len(data['data'])} odds records")
                        else:
                            print(f"    Found odds data: {type(data['data'])}")
                    else:
                        print(f"    No odds data found")
                        
                else:
                    print(f"    ❌ FAILED! Status: {response.status_code}")
                    
            except Exception as e:
                print(f"    ❌ ERROR: {e}")
            
            print()

def test_fixture_details():
    """Test getting fixture details to see if odds are included."""
    
    test_fixture = 19441640
    
    url = f"https://api.sportmonks.com/v3/football/fixtures/{test_fixture}"
    params = {
        "api_token": API_TOKEN,
        "include": "odds,bookmakers"
    }
    
    try:
        print(f"=== TESTING FIXTURE DETAILS FOR {test_fixture} ===")
        print(f"URL: {url}")
        print(f"Params: {params}")
        
        response = requests.get(url, params=params)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys())}")
            
            if "data" in data:
                fixture = data["data"]
                print(f"Fixture keys: {list(fixture.keys())}")
                
                if "odds" in fixture:
                    print(f"Odds data: {fixture['odds']}")
                else:
                    print("No odds in fixture data")
                    
        else:
            print(f"Error response: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("=== TESTING ODDS API ENDPOINTS ===")
    test_odds_endpoints()
    
    print("\n" + "="*50)
    test_fixture_details() 