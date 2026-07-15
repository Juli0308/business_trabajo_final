  // src/components/MapaCalorPeru.jsx
  import React, { useEffect, useState } from 'react';
  import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
  import L from 'leaflet';

  export default function MapaCalorPeru({ geoData }) {
    const [features, setFeatures] = useState([]);

    // Función para obtener color según prevalencia
    const getColorByPrevalence = (prevalencia) => {
      if (prevalencia > 50) return '#7f1d1d';      // Rojo oscuro - Crítico
      if (prevalencia > 40) return '#991b1b';      // Rojo medio - Alto
      if (prevalencia > 30) return '#dc2626';      // Rojo claro - Moderado
      if (prevalencia > 20) return '#f97316';      // Naranja - Bajo
      return '#22c55e';                             // Verde - Muy bajo
    };

    // Función para obtener etiqueta
    const getLabel = (prevalencia) => {
      if (prevalencia > 50) return 'CRÍTICO (>50%)';
      if (prevalencia > 40) return 'ALTO (40-50%)';
      if (prevalencia > 30) return 'MODERADO (30-40%)';
      if (prevalencia > 20) return 'BAJO (20-30%)';
      return 'MUY BAJO (<20%)';
    };

    useEffect(() => {
      if (geoData && geoData.features) {
        setFeatures(geoData.features);
      }
    }, [geoData]);

    const onEachFeature = (feature, layer) => {
      const props = feature.properties;
      const prevalencia = props.prevalencia || 0;
      const color = getColorByPrevalence(prevalencia);

      // Estilo
      layer.setStyle({
        fillColor: color,
        weight: 2,
        opacity: 1,
        color: '#fff',
        dashArray: '3',
        fillOpacity: 0.7
      });

      // Popup con información
      const popup = `
        <div style="font-family: Arial; font-size: 12px;">
          <strong style="font-size: 14px; color: #8B1C1C;">${props.NOMBDEP}</strong><br/>
          <hr style="margin: 5px 0;"/>
          <span style="color: #666;">Prevalencia:</span> <strong>${prevalencia.toFixed(1)}%</strong><br/>
          <span style="color: #666;">Estado:</span> <strong style="color: ${color}">${getLabel(prevalencia)}</strong>
        </div>
      `;

      layer.bindPopup(popup);
      
      // Hover effect
      layer.on('mouseover', () => {
        layer.setStyle({
          weight: 3,
          opacity: 1,
          fillOpacity: 0.9
        });
        layer.openPopup();
      });

      layer.on('mouseout', () => {
        layer.setStyle({
          weight: 2,
          opacity: 1,
          fillOpacity: 0.7
        });
      });
    };

    return (
      <MapContainer center={[-9.19, -75.0152]} zoom={6} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {features.length > 0 && (
          <GeoJSON data={{ type: 'FeatureCollection', features }} onEachFeature={onEachFeature} />
        )}
      </MapContainer>
    );
  }