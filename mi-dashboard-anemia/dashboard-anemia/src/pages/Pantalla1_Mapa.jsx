import React, { useEffect, useState } from 'react';
import MapaCalorPeru from '../components/MapaCalorPeru';
import TarjetaKPI from '../components/TarjetaKPI';
import SlicerFiltro from '../components/SlicerFiltro';

export default function Pantalla1_Mapa() {
  const [geoData, setGeoData] = useState(null);
  const [factData, setFactData] = useState([]);

  useEffect(() => {
    // Carga de archivos desde tu estructura public/data/
    fetch('/data/peru_departamentos.geojson').then(r => r.json()).then(setGeoData);
    fetch('/data/fact_anemia.json').then(r => r.json()).then(setFactData);
  }, []);

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6">
        <SlicerFiltro label="Año" options={['2023', '2024']} />
        <SlicerFiltro label="Residencia" options={['Urbano', 'Rural']} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <MapaCalorPeru geoData={geoData} />
        </div>
        <div className="space-y-4">
          <TarjetaKPI titulo="Niños Evaluados" valor={factData.length.toString()} />
          <TarjetaKPI titulo="% Anemia General" valor="42.5%" />
        </div>
      </div>
    </div>
  );
}