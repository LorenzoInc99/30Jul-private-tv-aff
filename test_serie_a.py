import requests
import datetime

# Your API token
API_TOKEN = "9RRfkWhjMRyWiIpf5Z7VOIARU8JsTZuXvvhZ26pU6G05Ntl5WueQhd5fptVY"

def test_serie_a_specific():
    """Test specifically for Serie A fixtures."""
    print("=== TESTING SERIE A SPECIFICALLY ===")
    
    # Calculate date range
    today = datetime.datetime.now()
    start_date = today - datetime.timedelta(days=2)  # 2 days ago
    end_date = datetime.datetime(2025, 8, 31)  # End of August
    
    # Format dates as YYYY-MM-DD for the API
    start_date_str = start_date.strftime("%Y-%m-%d")
    end_date_str = end_date.strftime("%Y-%m-%d")
    
    print(f"Date range: {start_date_str} to {end_date_str}")
    
    # Test 1: Check Serie A league directly
    print(f"\n--- Test 1: Check Serie A League #384 ---")
    url = "https://api.sportmonks.com/v3/football/leagues/384"
    params = {"api_token": API_TOKEN}
    
    try:
        response = requests.get(url, params=params)
        print(f"Serie A league status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if "data" in data:
                league = data["data"]
                print(f"✅ Serie A found: {league.get('name')}")
            else:
                print("❌ No Serie A data in response")
        else:
            print(f"❌ Serie A league not found: {response.text}")
    except Exception as e:
        print(f"❌ Error checking Serie A: {e}")
    
    # Test 2: Check for Serie A fixtures in date range
    print(f"\n--- Test 2: Check for Serie A fixtures in date range ---")
    url = f"https://api.sportmonks.com/v3/football/fixtures/between/{start_date_str}/{end_date_str}"
    
    params = {
        "api_token": API_TOKEN,
        "include": "league",
        "per_page": 100,
        "order": "starting_at:asc"
    }
    
    try:
        response = requests.get(url, params=params)
        print(f"Fixtures API status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if "data" in data and data["data"] is not None:
                fixtures = data["data"]
                if isinstance(fixtures, list):
                    print(f"Found {len(fixtures)} total fixtures")
                    
                    # Look for Serie A fixtures
                    serie_a_fixtures = []
                    for fixture in fixtures:
                        league_data = fixture.get("league", {})
                        if league_data and league_data.get("id") == 384:
                            serie_a_fixtures.append(fixture)
                    
                    print(f"Found {len(serie_a_fixtures)} Serie A fixtures")
                    
                    if serie_a_fixtures:
                        print("Serie A fixtures found:")
                        for fixture in serie_a_fixtures[:5]:  # Show first 5
                            name = fixture.get("name")
                            starting_at = fixture.get("starting_at")
                            print(f"  - {name} | {starting_at}")
                    else:
                        print("❌ No Serie A fixtures found in date range")
                        
                        # Check what leagues ARE found
                        found_leagues = set()
                        for fixture in fixtures:
                            league_data = fixture.get("league", {})
                            if league_data:
                                league_id = league_data.get("id")
                                league_name = league_data.get("name")
                                found_leagues.add((league_id, league_name))
                        
                        print(f"\nLeagues found in date range:")
                        for league_id, league_name in sorted(found_leagues):
                            print(f"  {league_id}: {league_name}")
                else:
                    print("Single fixture response")
            else:
                print("No fixtures data in response")
        else:
            print(f"❌ Fixtures API failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error checking fixtures: {e}")
    
    # Test 3: Check Serie A fixtures directly
    print(f"\n--- Test 3: Check Serie A fixtures directly ---")
    url = "https://api.sportmonks.com/v3/football/fixtures/leagues/384"
    
    params = {
        "api_token": API_TOKEN,
        "include": "participants;scores",
        "per_page": 50
    }
    
    try:
        response = requests.get(url, params=params)
        print(f"Serie A fixtures API status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if "data" in data and data["data"] is not None:
                fixtures = data["data"]
                if isinstance(fixtures, list):
                    print(f"Found {len(fixtures)} Serie A fixtures total")
                    
                    # Filter by date range
                    serie_a_in_range = []
                    for fixture in fixtures:
                        starting_at = fixture.get("starting_at")
                        if starting_at:
                            fixture_date = datetime.datetime.fromisoformat(starting_at.replace('Z', '+00:00'))
                            if start_date <= fixture_date <= end_date:
                                serie_a_in_range.append(fixture)
                    
                    print(f"Found {len(serie_a_in_range)} Serie A fixtures in date range")
                    
                    if serie_a_in_range:
                        print("Serie A fixtures in date range:")
                        for fixture in serie_a_in_range[:5]:  # Show first 5
                            name = fixture.get("name")
                            starting_at = fixture.get("starting_at")
                            print(f"  - {name} | {starting_at}")
                    else:
                        print("❌ No Serie A fixtures in date range")
                        
                        # Show some Serie A fixtures outside the range
                        print("Serie A fixtures outside date range:")
                        for fixture in fixtures[:5]:
                            name = fixture.get("name")
                            starting_at = fixture.get("starting_at")
                            print(f"  - {name} | {starting_at}")
                else:
                    print("Single Serie A fixture")
            else:
                print("No Serie A fixtures data in response")
        else:
            print(f"❌ Serie A fixtures API failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error checking Serie A fixtures: {e}")

if __name__ == "__main__":
    test_serie_a_specific() 