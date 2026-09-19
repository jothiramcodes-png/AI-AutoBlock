# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
"""
Generates realistic track network sections representing Northern / North Central Railway
high-density routes and branch connections.
"""
import pandas as pd

SECTIONS_DATA = [
    {
        "section_id": "SEC-001",
        "name": "New Delhi (NDLS) - Ghaziabad (GZB)",
        "division": "Delhi",
        "zone": "Northern Railway",
        "tier": "Tier-1 Trunk",
        "speed_limit_kmh": 130,
        "daily_gmt": 42.5,
        "length_km": 25.6,
        "num_tracks": 4,
        "max_weekly_block_hours": 16.0,
        "description": "High-density quad-track suburban and trunk corridor connecting Capital to UP"
    },
    {
        "section_id": "SEC-002",
        "name": "Ghaziabad (GZB) - Aligarh Jn (ALJN)",
        "division": "Prayagraj",
        "zone": "North Central Railway",
        "tier": "Tier-1 Trunk",
        "speed_limit_kmh": 160,
        "daily_gmt": 48.0,
        "length_km": 106.3,
        "num_tracks": 2,
        "max_weekly_block_hours": 14.0,
        "description": "Semi-high speed Delhi-Howrah main trunk corridor with Vande Bharat operations"
    },
    {
        "section_id": "SEC-003",
        "name": "Aligarh Jn (ALJN) - Tundla Jn (TDL)",
        "division": "Prayagraj",
        "zone": "North Central Railway",
        "tier": "Tier-1 Trunk",
        "speed_limit_kmh": 160,
        "daily_gmt": 45.2,
        "length_km": 78.4,
        "num_tracks": 2,
        "max_weekly_block_hours": 14.0,
        "description": "Heavy mixed traffic trunk line, critical container & freight artery"
    },
    {
        "section_id": "SEC-004",
        "name": "Tundla Jn (TDL) - Kanpur Central (CNB)",
        "division": "Prayagraj",
        "zone": "North Central Railway",
        "tier": "Tier-1 Trunk",
        "speed_limit_kmh": 160,
        "daily_gmt": 52.1,
        "length_km": 228.7,
        "num_tracks": 3,
        "max_weekly_block_hours": 18.0,
        "description": "Busiest passenger and freight corridor in Northern India with 3rd line"
    },
    {
        "section_id": "SEC-005",
        "name": "Ghaziabad (GZB) - Meerut City (MTC)",
        "division": "Delhi",
        "zone": "Northern Railway",
        "tier": "Tier-2 Main",
        "speed_limit_kmh": 110,
        "daily_gmt": 24.5,
        "length_km": 47.0,
        "num_tracks": 2,
        "max_weekly_block_hours": 12.0,
        "description": "Double line electrified main route to Saharanpur and Dehradun"
    },
    {
        "section_id": "SEC-006",
        "name": "Meerut City (MTC) - Saharanpur (SRE)",
        "division": "Delhi",
        "zone": "Northern Railway",
        "tier": "Tier-2 Main",
        "speed_limit_kmh": 110,
        "daily_gmt": 21.0,
        "length_km": 114.2,
        "num_tracks": 2,
        "max_weekly_block_hours": 12.0,
        "description": "Regional connector linking Western UP to Punjab and Jammu"
    },
    {
        "section_id": "SEC-007",
        "name": "Aligarh Jn (ALJN) - Bareilly Jn (BE)",
        "division": "Moradabad",
        "zone": "Northern Railway",
        "tier": "Tier-2 Main",
        "speed_limit_kmh": 100,
        "daily_gmt": 18.4,
        "length_km": 167.0,
        "num_tracks": 1,
        "max_weekly_block_hours": 10.0,
        "description": "Single line branch connecting North Central to Northern Railway loop"
    },
    {
        "section_id": "SEC-008",
        "name": "Tundla Jn (TDL) - Agra Cantt (AGC)",
        "division": "Agra",
        "zone": "North Central Railway",
        "tier": "Tier-1 Trunk",
        "speed_limit_kmh": 130,
        "daily_gmt": 36.8,
        "length_km": 28.5,
        "num_tracks": 2,
        "max_weekly_block_hours": 12.0,
        "description": "Tourist and express corridor connecting Delhi-Howrah to Delhi-Mumbai routes"
    },
    {
        "section_id": "SEC-009",
        "name": "Kanpur Central (CNB) - Lucknow (LKO)",
        "division": "Lucknow",
        "zone": "Northern Railway",
        "tier": "Tier-1 Trunk",
        "speed_limit_kmh": 130,
        "daily_gmt": 38.0,
        "length_km": 72.0,
        "num_tracks": 2,
        "max_weekly_block_hours": 14.0,
        "description": "Very high density intercity twin-city corridor with Shatabdi & Tejas"
    },
    {
        "section_id": "SEC-010",
        "name": "Hathras Jn (HRS) - Hathras Qilah (HRF)",
        "division": "Prayagraj",
        "zone": "North Central Railway",
        "tier": "Tier-3 Branch",
        "speed_limit_kmh": 75,
        "daily_gmt": 6.2,
        "length_km": 9.2,
        "num_tracks": 1,
        "max_weekly_block_hours": 8.0,
        "description": "Single line rural branch feeder"
    },
    {
        "section_id": "SEC-011",
        "name": "Shikohabad (SKB) - Farrukhabad (FBD)",
        "division": "Prayagraj",
        "zone": "North Central Railway",
        "tier": "Tier-3 Branch",
        "speed_limit_kmh": 80,
        "daily_gmt": 8.5,
        "length_km": 105.0,
        "num_tracks": 1,
        "max_weekly_block_hours": 8.0,
        "description": "Agricultural freight feeder branch line"
    },
    {
        "section_id": "SEC-012",
        "name": "Dadri Freight Bypass (DER - DBR)",
        "division": "Delhi",
        "zone": "Northern Railway",
        "tier": "Tier-1 Trunk",
        "speed_limit_kmh": 100,
        "daily_gmt": 40.0,
        "length_km": 34.0,
        "num_tracks": 2,
        "max_weekly_block_hours": 16.0,
        "description": "Dedicated freight interchange feeder connecting to Eastern DFC"
    }
]

def generate_network_df():
    df = pd.DataFrame(SECTIONS_DATA)
    return df

if __name__ == "__main__":
    df = generate_network_df()
    df.to_csv("data/samples/sections.csv", index=False)
    print(f"Generated {len(df)} network sections successfully.")
