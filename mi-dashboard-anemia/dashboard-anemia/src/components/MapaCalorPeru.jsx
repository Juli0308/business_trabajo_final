// src/components/MapaCalorPeru.jsx
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapaCalorPeru({ geoData }) {
  if (!geoData) return <div className="h-96 bg-gray-100 animate-pulse rounded-xl"></div>;

  return (
    <MapContainer center={[-9.19, -75.01]} zoom={6} className="h-96 w-full rounded-xl shadow-sm">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <GeoJSON data={geoData} style={{ fillColor: '#b91c1c', weight: 1, color: '#fff', fillOpacity: 0.6 }} />
    </MapContainer>
  );
}