# ☘️ Urban Heat Island Mitigation Platform

An AI-driven Digital Twin and Geospatial Analytics platform designed to predict, simulate, and mitigate Urban Heat Islands (UHI) in the Delhi NCR region using satellite remote sensing parameters and autonomous AI agents.

## 🚀 Key Features

- **🔮 Machine Learning Digital Twin:** Powered by a *Random Forest Regressor* to model Land Surface Temperature (LST) and simulate cooling impacts when environmental factors like tree cover change.
- **📍 Geospatial Hotspot Identification:** Interactive GIS mapping utilizing *React-Leaflet* to overlay live severe heat grids and ecological cooling zones directly onto Delhi NCR coordinates.
- **✨ Autonomous Executive Reporting:** Integrated with *Gemini AI Models* acting as a virtual climate scientist to parse spatial anomalies and auto-generate executive briefings for environmental policymakers.
- **📊 Explainable AI (XAI):** Built-in feature driver analytics using Chart.js to clearly display structural metrics (NDVI, NDBI, Albedo, Building Density) causing urban heating.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, React-Leaflet, Chart.js, Axios, Tailwind CSS
- **Backend:** FastAPI (Python), Uvicorn
- **Data Science & AI:** Scikit-Learn, Pandas, NumPy, Google GenAI SDK (Gemini Flash/Pro)

---

## 📁 System Architecture & Folder Layout

```text
Urban-Heat-Mitigation-Platform/
├── backend/            # FastAPI, Random Forest Model, & Gemini Agent
├── frontend/           # React dashboard & Leaflet GIS Map
├── .gitignore          # Production security configuration
└── README.md           # Product documentation



🏃‍♂️ Local Installation & Setup
1. Prerequisites
Make sure you have Python 3.11+ and Node.js (v18+) installed on your system.

2. Backend Setup
Navigate to the backend directory, configure environment variables, and start the API server:

```bash
cd backend
```

# Create a .env file inside the backend folder and add your API key:
```text
GEMINI_API_KEY="your_real_api_key_here"
```

# Install required Python dependencies
```bash
pip install fastapi uvicorn pandas numpy scikit-learn google-genai python-dotenv
```

# Run the FastAPI server
```bash
python -m uvicorn main_advanced-1:app --reload
```

The backend service will start running on http://127.0.0.1:8000.

3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, install node modules, and boot up Vite:
```bash
cd frontend
```

# Install packages
```bash
npm install
```

# Run the development server
```bash
npm run dev
```

Open your browser and navigate to http://localhost:5173 to view the live dashboard.

📈 Data Parameters Tracked
LST (Land Surface Temperature): Core target variable representing heat signatures.

NDVI (Normalized Difference Vegetation Index): Measures green canopy coverage.

NDBI (Normalized Difference Built-up Index): Quantifies concrete and urban density.

Albedo: Surface reflectivity factor