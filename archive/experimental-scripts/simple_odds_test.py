# SIMPLE ODDS TEST - JUST FETCH AND DISPLAY

import requests
import json
import time

# Configuration
API_TOKEN = "9RRfkWhjMRyWiIpf5Z7VOIARU8JsTZuXvvhZ26pU6G05Ntl5WueQhd5fptVY"

def test_single_fixture(fixture_id):
    """Test fetching odds for a single fixture."""
    print(f"\n=== TESTING FIXTURE {fixture_id} ===")
    
    url = f"https://api.sportmonks.com/v3/football/fixtures/{fixture_id}"
    params = {
        "api_token": API_TOKEN,
        "include": "odds"
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        if "data" in data and data["data"] is not None:
            fixture = data["data"]
            odds_data = fixture.get("odds", [])
            
            print(f"Fixture: {fixture.get('name', 'Unknown')}")
            print(f"Date: {fixture.get('starting_at', 'Unknown')}")
            print(f"Odds found: {len(odds_data) if isinstance(odds_data, list) else 1 if odds_data else 0}")
            
            if odds_data:
                if isinstance(odds_data, list):
                    for i, odd in enumerate(odds_data[:3]):  # Show first 3
                        print(f"  Odd {i+1}: {odd.get('label', 'Unknown')} = {odd.get('value', 'Unknown')}")
                else:
                    print(f"  Odd: {odds_data.get('label', 'Unknown')} = {odds_data.get('value', 'Unknown')}")
            else:
                print("  No odds available for this fixture")
                
        else:
            print("No fixture data found")
            
    except Exception as e:
        print(f"Error: {e}")

def test_multiple_fixtures():
    """Test a few fixtures to see which ones have odds."""
    test_fixtures = [
        19441640,  # From your list
        19441644,  # From your list
        19425287,  # From your list
    ]
    
    for fixture_id in test_fixtures:
        test_single_fixture(fixture_id)
        time.sleep(0.5)  # Small delay between requests

if __name__ == "__main__":
    print("=== SIMPLE ODDS TEST ===")
    test_multiple_fixtures() 