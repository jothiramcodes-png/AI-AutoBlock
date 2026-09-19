# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
"""
Generates synthetic freight traffic demand forecast per corridor section.
Freight rakes compete with maintenance blocks for line capacity.
Uses deterministic random seed (seed=42).
"""
import random
import pandas as pd

def generate_goods_forecast_df(sections_df: pd.DataFrame, seed: int = 42) -> pd.DataFrame:
    random.seed(seed)
    records = []
    
    for _, sec in sections_df.iterrows():
        sec_id = sec["section_id"]
        tier = sec["tier"]
        
        # Trunk routes have high freight rake volume (coal, steel, containers)
        if "Trunk" in tier:
            base_rakes = random.randint(35, 60)
            priority_freight = True
            tolerable_delay = round(random.uniform(1.5, 3.0), 1)
        elif "Main" in tier:
            base_rakes = random.randint(18, 30)
            priority_freight = random.choice([True, False])
            tolerable_delay = round(random.uniform(2.5, 5.0), 1)
        else:
            base_rakes = random.randint(5, 12)
            priority_freight = False
            tolerable_delay = round(random.uniform(4.0, 8.0), 1)
            
        records.append({
            "corridor_id": sec_id,
            "corridor_name": sec["name"],
            "week_number": 38,
            "projected_rakes_per_week": base_rakes,
            "priority_freight_flag": priority_freight,
            "max_tolerable_delay_hours": tolerable_delay,
            "disruption_penalty_factor": 1.5 if priority_freight else 1.0
        })
        
    df = pd.DataFrame(records)
    return df

if __name__ == "__main__":
    from generate_network import generate_network_df
    sec_df = generate_network_df()
    df = generate_goods_forecast_df(sec_df)
    df.to_csv("data/samples/goods_forecast.csv", index=False)
    print(f"Generated {len(df)} synthetic goods traffic forecast rows.")
