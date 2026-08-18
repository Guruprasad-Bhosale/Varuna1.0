import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// SVG Marker without animations, focusing on clear solid color
const createStatusMarker = (status) => {
  let color = '#16a34a'; // safe
  if (status === 'Moderate') color = '#d97706';
  if (status === 'Dangerous') color = '#dc2626';

  const svgIcon = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#ffffff" stroke-width="2"/>
      <circle cx="12" cy="10" r="3" fill="#ffffff"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-leaflet-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
};

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function NodeMap({ latestData }) {
  if (!latestData) return <div className="card-panel h-full flex items-center justify-center text-textMuted">Loading Map...</div>;

  const position = [latestData.latitude || 16.142, latestData.longitude || 73.528];

  return (
    <div className="card-panel h-full flex flex-col relative overflow-hidden">
      {/* Legend & Filter Overlay */}
      <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur px-3 py-2 rounded-md border border-border shadow-sm text-xs">
        <h4 className="font-semibold text-navy mb-2">Node Status</h4>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-safe block"></span> Safe</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-moderate block"></span> Moderate</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-dangerous block"></span> Dangerous</div>
        </div>
      </div>

      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={false} 
        className="w-full h-full z-0"
        zoomControl={true}
      >
        <MapUpdater center={position} />
        {/* Light theme modern tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <Marker position={position} icon={createStatusMarker(latestData.predicted_safety_level)}>
          <Popup className="custom-popup">
            <div className="p-1">
              <div className="font-semibold text-navy mb-1">{latestData.node_id}</div>
              <div className="text-xs text-textMain mb-1">Status: <strong>{latestData.predicted_safety_level}</strong></div>
              <div className="text-xs text-textMuted">WQI Score: {latestData.safety_score}/100</div>
              <div className="text-[10px] text-textMuted mt-2">{position[0].toFixed(4)}, {position[1].toFixed(4)}</div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
