// src/components/MapaCalorPeru.jsx
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapaCalorPeru({ geoData }) {
  if (!geoData) {
    return <div className="h-96 bg-gray-200 rounded-xl flex items-center justify-center animate-pulse">
      <p className="text-gray-600">Cargando mapa...</p>
    </div>;
  }

  // Estilos para el GeoJSON
  const onEachFeature = (feature, layer) => {
    const props = feature.properties;
    const popupContent = `<div style="font-size:12px"><strong>${props.NOMBDEP || 'Región'}</strong><br/>Prevalencia: 42.5%</div>`;
    layer.bindPopup(popupContent);
  };

  const style = {
    fillColor: '#b91c1c',
    weight: 2,
    opacity: 1,
    color: '#fff',
    dashArray: '3',
    fillOpacity: 0.7
  };

  // Fix para iconos de Leaflet
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });

  return (
    <div className="rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <MapContainer 
        center={[-9.19, -75.01]} 
        zoom={5} 
        style={{ height: '450px', width: '100%' }}
        className="rounded-xl"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <GeoJSON data={geoData} style={style} onEachFeature={onEachFeature} />
      </MapContainer>
    </div>
  );
}
