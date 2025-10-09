#!/usr/bin/env python3
import requests
import json

# Configuration
API_TOKEN = "9RRfkWhjMRyWiIpf5Z7VOIARU8JsTZuXvvhZ26pU6G05Ntl5WueQhd5fptVY"

def test_team_logo(team_id):
    """Test retrieving team logo from SportMonks API"""
    print(f"Testing team logo retrieval for team ID: {team_id}")
    
    # Test the SportMonks team endpoint
    url = f"https://api.sportmonks.com/v3/football/teams/{team_id}"
    params = {
        "api_token": API_TOKEN,
        "include": "image"  # Try to include image data
    }
    
    print(f"Making request to: {url}")
    print(f"With params: {params}")
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        data = response.json()
        print(f"Response status: {response.status_code}")
        
        # Extract logo information
        team_data = data.get('data', {})
        team_name = team_data.get('name', 'Unknown')
        
        logo_info = {
            "teamId": team_id,
            "teamName": team_name,
            "logoUrl": None,
            "imageData": None,
            "availableFields": list(team_data.keys())
        }
        
        # Check different possible logo fields
        if team_data.get('image_path'):
            logo_info['logoUrl'] = team_data['image_path']
        elif team_data.get('image'):
            logo_info['imageData'] = team_data['image']
        elif team_data.get('logo'):
            logo_info['logoUrl'] = team_data['logo']
        elif team_data.get('image_url'):
            logo_info['logoUrl'] = team_data['image_url']
        
        # Also check if there's an image object in the response
        if team_data.get('image') and isinstance(team_data['image'], dict):
            logo_info['imageData'] = team_data['image']
        
        print("\n=== TEAM LOGO INFO ===")
        print(f"Team ID: {logo_info['teamId']}")
        print(f"Team Name: {logo_info['teamName']}")
        print(f"Logo URL: {logo_info['logoUrl']}")
        print(f"Image Data: {logo_info['imageData']}")
        print(f"Available Fields: {logo_info['availableFields']}")
        
        # Test if the logo URL is accessible
        if logo_info['logoUrl']:
            print(f"\n=== TESTING LOGO URL ===")
            try:
                logo_response = requests.head(logo_info['logoUrl'])
                print(f"Logo URL accessible: {logo_response.status_code == 200}")
                if logo_response.status_code == 200:
                    print(f"Logo URL: {logo_info['logoUrl']}")
                else:
                    print(f"Logo URL not accessible: {logo_response.status_code}")
            except Exception as e:
                print(f"Error testing logo URL: {e}")
        
        return logo_info
        
    except requests.exceptions.RequestException as e:
        print(f"Error making request: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        return None

def main():
    """Test multiple team IDs to find logo patterns"""
    test_team_ids = [1, 2, 3, 10, 20, 50, 100, 200, 500, 1000]
    
    print("=== TESTING TEAM LOGO RETRIEVAL ===")
    print("Testing multiple team IDs to understand the API structure...\n")
    
    successful_tests = []
    
    for team_id in test_team_ids:
        print(f"\n{'='*50}")
        result = test_team_logo(team_id)
        if result:
            successful_tests.append(result)
        
        # Add a small delay to avoid rate limiting
        import time
        time.sleep(0.5)
    
    print(f"\n{'='*50}")
    print("=== SUMMARY ===")
    print(f"Successfully tested {len(successful_tests)} teams")
    
    if successful_tests:
        print("\nTeams with logo URLs:")
        for test in successful_tests:
            if test['logoUrl']:
                print(f"- {test['teamName']} (ID: {test['teamId']}): {test['logoUrl']}")
        
        print("\nCommon available fields:")
        all_fields = set()
        for test in successful_tests:
            all_fields.update(test['availableFields'])
        print(f"Available fields: {sorted(all_fields)}")

if __name__ == "__main__":
    main() 