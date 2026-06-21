import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import HeatMap from './HeatMap';

const API_BASE = "http://127.0.0.1:8000"; // Tera FastAPI server URL

function App() {
  // States for data
  const [sliderValue, setSliderValue] = useState(10);
  const [simulationResult, setSimulationResult] = useState(null);
  const [importanceData, setImportanceData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [aiReport, setAiReport] = useState("AI Agent analyzing satellite grids...");
  const [loadingAi, setLoadingAi] = useState(true);

  // Base feature values (Dwarka/Delhi region ke realistic averages as placeholder input)
  const baseInput = {
    ndvi: 0.15,
    ndbi: 0.45,
    humidity: 52.0,
    wind_speed: 3.2,
    albedo: 0.14,
    tree_cover: 12.0,
    building_density: 65.0
  };

  // Fetch Feature, Recommendations, AND Gemini Report on Load
useEffect(() => {
  // 1. Purana Code: Graph data lane ke liye
  axios.get(`${API_BASE}/feature-importance`)
    .then(res => setImportanceData(res.data.feature_importance))
    .catch(err => console.error("Error fetching importance", err));

  // 2. Purana Code: Recommendations lane ke liye
  axios.get(`${API_BASE}/recommendations`)
    .then(res => setRecommendations(res.data.recommended_actions))
    .catch(err => console.error("Error fetching recommendations", err));

  // 3. Naya Code: Gemini Agent Report lane ke liye (Saath mein jod diya)
  axios.get(`${API_BASE}/gemini-spatial-analysis`)
    .then(res => {
      setAiReport(res.data.ai_analysis);
      setLoadingAi(false);
    })
    .catch(err => {
      console.error("Gemini Agent failed:", err);
      setAiReport("Error: AI Agent response timeout or key invalid.");
      setLoadingAi(false);
    });
}, []);
 
  // Trigger Simulation when slider changes
  useEffect(() => {
    axios.post(`${API_BASE}/simulate-cooling`, {
      ...baseInput,
      increase_tree_cover: parseFloat(sliderValue),
      cool_roof_factor: parseFloat(sliderValue) / 100 // Scale albedo logically
    })
    .then(res => setSimulationResult(res.data))
    .catch(err => console.error("Error running simulation", err));
  }, [sliderValue]);

  // Chart Configuration for Explainable AI Panel
  const chartData = {
    labels: importanceData ? Object.keys(importanceData) : [],
    datasets: [{
      label: 'Feature Drivers of Heating',
      data: importanceData ? Object.values(importanceData) : [],
      backgroundColor: 'rgba(239, 68, 68, 0.6)',
      borderColor: 'rgba(239, 68, 68, 1)',
      borderWidth: 1,
    }]
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <header style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#1e3a8a' }}>☘️ Urban Heat Island Mitigation Platform</h1>
        <p style={{ color: '#4b5563' }}>AI-Driven Sustainable Tree Plantation & Cooling Simulation</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* LEFT PANEL: SIMULATION & SLIDERS */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>🌲 Digital Twin: Cooling Simulation</h3>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Slider ko drag karke check karein ki tree cover badhane se temperature kitna drop hota hai.</p>
          
          <div style={{ margin: '30px 0' }}>
            <label style={{ fontWeight: 'bold' }}>Proposed Tree Cover Increase: {sliderValue}%</label>
            <input 
              type="range" min="0" max="50" value={sliderValue} 
              onChange={(e) => setSliderValue(e.target.value)}
              style={{ width: '100%', marginTop: '10px', cursor: 'pointer' }}
            />
          </div>

          {simulationResult && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px', textAlign: 'center' }}>
              <div style={{ background: '#fee2e2', padding: '15px', borderRadius: '6px' }}>
                <span style={{ fontSize: '14px', color: '#991b1b' }}>Current Temp</span>
                <h2 style={{ color: '#991b1b', margin: '5px 0' }}>{simulationResult.current_temperature}°C</h2>
              </div>
              <div style={{ background: '#dcfce7', padding: '15px', borderRadius: '6px' }}>
                <span style={{ fontSize: '14px', color: '#166534' }}>Simulated Temp</span>
                <h2 style={{ color: '#166534', margin: '5px 0' }}>{simulationResult.future_temperature}°C</h2>
              </div>
              <div style={{ gridColumn: '1 / span 2', background: '#dbeafe', padding: '10px', borderRadius: '6px', marginTop: '5px' }}>
                <strong style={{ color: '#1e40af' }}>📉 Estimated Cooling Reduction: {simulationResult.estimated_reduction}°C</strong>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: EXPLAINABLE AI (CHARTS) */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>📊 Drivers of Heating (Explainable AI)</h3>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Random Forest model ke mutabik kaunsa factor garmi badhane ke liye sabse zyada zimmedar hai.</p>
          <div style={{ height: '250px', marginTop: '20px' }}>
            {importanceData ? <Bar data={chartData} options={{ maintainAspectRatio: false }} /> : <p>Loading Analytics...</p>}
          </div>
        </div>
        <div style={{ gridColumn: '1 / span 2', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
  <h3>🔴 Geospatial Hotspot Identification (Delhi NCR)</h3>
  <p style={{ fontSize: '14px', color: '#6b7280' }}>Ye map un areas ko highlight kar raha hai jahan temperature threshold se zyada hai.</p>
  <HeatMap />
</div>
  {/* PREMIUM GEMINI AI AGENT PANEL */}
<div style={{ 
  gridColumn: '1 / span 2', 
  backgroundColor: '#0f172a', // Dark slate black theme
  color: '#f8fafc', 
  padding: '25px', 
  borderRadius: '8px', 
  boxShadow: '0 4px 10px rgba(0,0,0,0.3)', 
  marginTop: '20px',
  borderLeft: '5px solid #e11d48' // Red highlight bar
}}>
  <h3 style={{ color: '#fbbf24', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
    ✨ Gemini Pro: Geospatial AI Agent Report
  </h3>
  <p style={{ fontSize: '14px', color: '#94a3b8' }}>
    Autonomous agent analyzing remote sensing parameters and identifying critical environmental zones:
  </p>

  {loadingAi ? (
    <div style={{ color: '#fbbf24', fontStyle: 'italic' }}>🔄 Satellite grid processing in progress... Please wait...</div>
  ) : (
    <pre style={{ 
      backgroundColor: '#1e293b', 
      padding: '15px', 
      borderRadius: '6px', 
      whiteSpace: 'pre-wrap', 
      fontFamily: 'monospace', 
      lineHeight: '1.7', 
      fontSize: '14px',
      color: '#cbd5e1',
      border: '1px solid #334155'
    }}>
      {aiReport}
    </pre>
  )}
</div>
        {/* BOTTOM PANEL: POLICY ACTION RECOMMENDATIONS */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', gridColumn: '1 / span 2' }}>
          <h3>📋 AI Suggested Recommendations for Government Bodies</h3>
          <ul style={{ lineHeight: '2' }}>
            {recommendations.map((action, index) => (
              <li key={index} style={{ color: '#374151', fontSize: '15px' }}>✅ {action}</li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}

export default App;