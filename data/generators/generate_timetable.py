# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
"""
Generates synthetic timetable corridor availability windows and passenger train paths.
Models low-traffic lull windows (night/afternoon) vs high-density peak paths.
Uses deterministic random seed (seed=42).
"""
import random
from datetime import datetime, timedelta
import pandas as pd

# Typical maintenance window slots per day on Indian Railways
STANDARD_SLOTS = [
    {"slot_name": "Night Lull Window 1", "start_hour": 1.0, "end_hour": 4.5, "traffic_tier": "Low (Night Lull)", "base_pax_trains": 0},
    {"slot_name": "Night Lull Window 2", "start_hour": 2.0, "end_hour": 5.0, "traffic_tier": "Low (Night Lull)", "base_pax_trains": 1},
    {"slot_name": "Midday Window", "start_hour": 11.5, "end_hour": 14.5, "traffic_tier": "Medium (Midday)", "base_pax_trains": 3},
    {"slot_name": "Evening Window", "start_hour": 15.0, "end_hour": 18.0, "traffic_tier": "High (Traffic Margin)", "base_pax_trains": 5},
    {"slot_name": "Late Night Window", "start_hour": 23.5, "end_hour": 2.5, "traffic_tier": "Low (Night Lull)", "base_pax_trains": 1},
]

def generate_timetable_windows_df(sections_df: pd.DataFrame, days: int = 7, seed: int = 42) -> pd.DataFrame:
    random.seed(seed)
    start_date = datetime(2026, 9, 16)
    records = []
    window_counter = 1
    
    for day_idx in range(days):
        current_date = start_date + timedelta(days=day_idx)
        date_str = current_date.strftime("%Y-%m-%d")
        
        for _, sec in sections_df.iterrows():
            sec_id = sec["section_id"]
            
            # Trunk corridors have 2-3 standard maintenance slots per day; branches have 1-2
            num_slots = 3 if "Trunk" in sec["tier"] else 2
            selected_slots = random.sample(STANDARD_SLOTS, num_slots)
            
            for slot in selected_slots:
                start_h = slot["start_hour"]
                end_h = slot["end_hour"]
                # Duration calculation taking care of midnight wrap if any
                if end_h > start_h:
                    duration = round(end_h - start_h, 1)
                else:
                    duration = round((24.0 - start_h) + end_h, 1)
                    
                # Passenger trains affected
                extra_pax = random.choice([0, 1]) if "Trunk" in sec["tier"] else 0
                pax_affected = slot["base_pax_trains"] + extra_pax
                
                records.append({
                    "window_id": f"WIN-{sec_id}-{day_idx+1}-{window_counter:03d}",
                    "section_id": sec_id,
                    "date": date_str,
                    "day_offset": day_idx,
                    "start_hour": start_h,
                    "end_hour": end_h,
                    "duration_hours": duration,
                    "traffic_density_tier": slot["traffic_tier"],
                    "passenger_trains_affected": pax_affected,
                    "is_available": True
                })
                window_counter += 1
                
    df = pd.DataFrame(records)
    return df

if __name__ == "__main__":
    from generate_network import generate_network_df
    sec_df = generate_network_df()
    df = generate_timetable_windows_df(sec_df, days=7)
    df.to_csv("data/samples/train_timetable_windows.csv", index=False)
    print(f"Generated {len(df)} synthetic block availability windows over 7 days.")
