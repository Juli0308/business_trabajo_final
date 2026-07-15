import React, { useEffect, useState } from 'react';
import MapaCalorPeru from '../components/MapaCalorPeru';
import TarjetaKPI from '../components/TarjetaKPI';
import SlicerFiltro from '../components/SlicerFiltro';

export default function Pantalla1_Mapa() {
  const [geoData, setGeoData] = useState(null);
  const [factData, setFactData] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedResidencia, setSelectedResidencia] = useState('Urbano');

  useEffect(() => {
    // Simular datos de departamentos GeoJSON
    const mockGeoData = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { NOMBDEP: 'Amazonas' },
          geometry: { type: 'Point', coordinates: [-77.8, -5.5] }
        },
        {
          type: 'Feature',
          properties: { NOMBDEP: 'Ancash' },
          geometry: { type: 'Point', coordinates: [-77.9, -9.2] }
        },
        {
          type: 'Feature',
          properties: { NOMBDEP: 'Apurímac' },
          geometry: { type: 'Point', coordinates: [-73.5, -13.6] }
        },
        {
          type: 'Feature',
          properties: { NOMBDEP: 'Arequipa' },
          geometry: { type: 'Point', coordinates: [-71.5, -16.4] }
        },
        {
          type: 'Feature',
          properties: { NOMBDEP: 'Ayacucho' },
          geometry: { type: 'Point', coordinates: [-74.2, -13.2] }
        },
        {
          type: 'Feature',
          properties: { NOMBDEP: 'Cajamarca' },
          geometry: { type: 'Point', coordinates: [-78.5, -7.2] }
        },
        {
          type: 'Feature',
          properties: { NOMBDEP: 'Lima' },
          geometry: { type: 'Point', coordinates: [-77.0, -12.0] }
        },
      ]
    };
    
    setGeoData(mockGeoData);
    
    // Simular datos de hechos
    const mockFactData = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      hemoglobina: Math.random() * 15,
      edad: Math.floor(Math.random() * 4) + 6
    }));
    setFactData(mockFactData);
  }, []);

  const totalNinios = factData.length;
  const anemiaGeneral = Math.round(totalNinios * 0.425);
  const anemiaLeve = Math.round(totalNinios * 0.183);
  const anemiaModera = Math.round(totalNinios * 0.242);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-red-900 mb-8">📍 Mapa Geográfico - Prevalencia de Anemia</h1>
      
      {/* Filtros */}
      <div className="grid grid-cols-2 gap-4 mb-8 max-w-sm">
        <SlicerFiltro 
          label="Año" 
          options={['2023', '2024']} 
          value={selectedYear}
          onChange={setSelectedYear}
        />
        <SlicerFiltro 
          label="Residencia" 
          options={['Urbano', 'Rural']} 
          value={selectedResidencia}
          onChange={setSelectedResidencia}
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <TarjetaKPI titulo="Total Niños" valor={totalNinios.toLocaleString()} icono="👶" />
        <TarjetaKPI titulo="Con Anemia" valor={anemiaGeneral.toLocaleString()} icono="⚠️" />
        <TarjetaKPI titulo="% Prevalencia" valor="42.5%" icono="📈" />
        <TarjetaKPI titulo="Período" valor={selectedYear} icono="📅" />
      </div>

      {/* Mapa */}
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-lg font-bold text-red-900 mb-4">Distribución Geográfica</h2>
            <MapaCalorPeru geoData={geoData} />
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 shadow-sm border border-red-200">
            <h3 className="font-bold text-red-900 mb-4">Resumen Filtrado</h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600">Año seleccionado</p>
                <p className="text-xl font-bold text-red-900">{selectedYear}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600">Residencia</p>
                <p className="text-xl font-bold text-red-900">{selectedResidencia}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600">Niños evaluados</p>
                <p className="text-2xl font-bold text-red-900">{totalNinios.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
