from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.cluster import KMeans

# Gemini Modular Agent ko import karna
try:
    from gemini_agent import analyze_spatial_data
except ImportError:
    analyze_spatial_data = None

app = FastAPI(title="Urban Heat Mitigation Backend Advanced")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # React app ka access allow karne ke liye
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = "app.csv"

FEATURES = [
    "ndvi","ndbi","humidity","wind_speed",
    "albedo","tree_cover","building_density"
]

class PredictionInput(BaseModel):
    ndvi: float
    ndbi: float
    humidity: float
    wind_speed: float
    albedo: float
    tree_cover: float
    building_density: float

class ScenarioInput(PredictionInput):
    increase_tree_cover: float = 10.0
    cool_roof_factor: float = 0.1
    
model = None
df = None # Global dataframe data handling ke liye

def train_model():
    global model, df
    df = pd.read_csv(DATA_FILE)
    X = df[FEATURES]
    y = df["lst"]

    model = RandomForestRegressor(
        n_estimators=200,
        random_state=42
    )
    model.fit(X, y)

    return {
        "rows": len(df),
        "features": FEATURES
    }

@app.on_event("startup")
def startup():
    train_model()

@app.get("/")
def root():
    return {"message": "Advanced Urban Heat Backend Running"}

@app.post("/train-model")
def retrain():
    return train_model()

@app.post("/predict-temperature")
def predict(data: PredictionInput):
    x = np.array([[
        data.ndvi,data.ndbi,data.humidity,
        data.wind_speed,data.albedo,
        data.tree_cover,data.building_density
    ]])
    pred = float(model.predict(x)[0])
    return {"predicted_lst": round(pred,2)}

# FIXED MAP ENDPOINT: Frontend map dots and markers ke liye coordinates list bhejega
@app.get("/detect-hotspots")
def detect_hotspots(threshold: float = 39.0):
    global df
    if df is None:
        df = pd.read_csv(DATA_FILE)
        
    if "latitude" not in df.columns or "longitude" not in df.columns:
        return {"hotspots": []}
        
    # Dynamic logic filters for threshold parameter
    hotspots_df = df[df["lst"] >= threshold]
    
    # Coordinates aur temperatures return karna react-leaflet map panels ke liye
    result = hotspots_df[["latitude", "longitude", "lst", "ward"]].rename(columns={"lst": "temperature"})
    return {"hotspots": result.to_dict(orient="records")}

@app.post("/simulate-cooling")
def simulate(data: ScenarioInput):
    current = float(model.predict(np.array([[
        data.ndvi,data.ndbi,data.humidity,
        data.wind_speed,data.albedo,
        data.tree_cover,data.building_density
    ]]))[0])

    tree_cover = min(100,data.tree_cover + data.increase_tree_cover)
    albedo = min(1.0,data.albedo + data.cool_roof_factor)

    future = float(model.predict(np.array([[
        data.ndvi,data.ndbi,data.humidity,
        data.wind_speed,albedo,
        tree_cover,data.building_density
    ]]))[0])

    return {
        "current_temperature": round(current,2),
        "future_temperature": round(future,2),
        "estimated_reduction": round(current-future,2)
    }

# NEW ENDPOINT 1: Autonomous AI Agent Data Extraction
@app.get("/gemini-spatial-analysis")
def get_gemini_analysis():
    global df
    if df is None:
        df = pd.read_csv(DATA_FILE)
        
    if analyze_spatial_data is not None:
        report = analyze_spatial_data(df)
        return {"ai_analysis": report}
    return {"ai_analysis": "Gemini Agent script mapping pending or key initialization failed."}

@app.get("/heatmap-data")
def heatmap_data():
    global df
    if df is None: df = pd.read_csv(DATA_FILE)
    return df[["latitude","longitude","lst"]].to_dict(orient="records")

@app.get("/feature-importance")
def feature_importance():
    importance = dict(zip(FEATURES, model.feature_importances_))
    return {"feature_importance": importance}

@app.get("/recommendations")
def recommendations():
    return {
        "recommended_actions":[
            "Increase tree cover by 15%",
            "Install cool roofs",
            "Reduce impervious surfaces",
            "Develop urban green corridors",
            "Create urban water bodies"
        ],
        "expected_reduction_celsius":"2-5"
    }

