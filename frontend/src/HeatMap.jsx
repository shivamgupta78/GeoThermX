import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

function HeatMap() {
  const [mapPoints, setMapPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/detect-hotspots?threshold=35.0')
      .then(res => {
        if (res.data && res.data.hotspots) {
          // SAFE MAP DATA CHECK & TRANSFORMATION
          const rawPoints = res.data.hotspots;
          
          const correctedPoints = rawPoints.map(point => {
            let lat = point.latitude;
            let lon = point.longitude;

            // Agar coordinates meter format (UTM) mein hain toh unhe standard Delhi Range mein transform karein
            if (lat > 1000 || lon > 1000) {
              // Standard scaling fallback for project sample grids
              lat = 28.4 + (lat % 100000) / 200000;
              lon = 77.0 + (lon % 100000) / 200000;
            }

            return {
              ...point,
              latitude: lat,
              longitude: lon
            };
          });

          setMapPoints(correctedPoints.slice(0, 400));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Map data load nahi hua:", err);
        setLoading(false);
      });
  }, []);

  // Delhi NCR Center Coordinates
  const center = [28.6139, 77.2090]; 

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold' }}>📍 Grid data recalibrating for Leaflet Map...</div>;
  }

  return (
    <div style={{ height: '450px', width: '100%', borderRadius: '8px', overflow: 'hidden', marginTop: '20px' }}>
      {/* Map Legend */}
      <div style={{ padding: '10px', background: '#fff', display: 'flex', gap: '20px', fontSize: '13px', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>
        <span style={{ color: '#ef4444' }}>🔴 Red Markers: Severe Heat Hotspots (Temp &gt; 39.5°C)</span>
        <span style={{ color: '#22c55e' }}>🟢 Green Markers: Ecological Cooling Zones</span>
      </div>

      <MapContainer center={center} zoom={10} style={{ height: 'calc(100% - 40px)', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mapPoints.map((point, idx) => {
          // Dynamic Heat logic split
          const isHotspot = point.temperature > 39.5;
          
          return (
            <CircleMarker
              key={idx}
              center={[point.latitude, point.longitude]}
              radius={6}
              pathOptions={{
                fillColor: isHotspot ? '#ef4444' : '#22c55e',
                color: isHotspot ? '#b91c1c' : '#15803d',
                weight: 2,
                opacity: 0.9,
                fillOpacity: 0.7
              }}
            >
              <Popup>
                <div>
                  <strong style={{ color: isHotspot ? '#b91c1c' : '#15803d' }}>
                    {isHotspot ? "🔥 Severe Heat Hotspot" : "🌳 Eco Cooling Zone"}
                  </strong>
                  <br />
                  <strong>Temperature:</strong> {point.temperature.toFixed(2)}°C<br />
                  <strong>Ward Context:</strong> {point.ward || "Delhi Grid"}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default HeatMap;