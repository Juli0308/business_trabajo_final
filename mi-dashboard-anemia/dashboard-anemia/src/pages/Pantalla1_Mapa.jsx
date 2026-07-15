import { useContext, useEffect, useState } from 'react';
import { FiltersContext } from '../context/FiltersContext';
import SlicerFiltro from '../components/SlicerFiltro';
import MapaCalorPeru from '../components/MapaCalorPeru';
import TarjetaKPI from '../components/TarjetaKPI';
import { 
  loadAllData,
  getAnosDisponibles,
  getRegionesDisponibles,
  calcularKPIsFiltrados,
  calcularPrevalenciaPorRegion,
  normalizarNombreDepartamento  // Agregar esta importación
} from '../data/dataService';

export default function Pantalla1_Mapa() {
  const { filters, updateFilters } = useContext(FiltersContext);
  const [anos, setAnos] = useState([]);
  const [regiones, setRegiones] = useState([]);
  const [kpis, setKpis] = useState({});
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    const initData = async () => {
      await loadAllData();
      setAnos(getAnosDisponibles());
      setRegiones(getRegionesDisponibles());
    };
    initData();
  }, []);

  useEffect(() => {
  const kpisCalculados = calcularKPIsFiltrados(filters);
  setKpis(kpisCalculados);

  // Cargar GeoJSON y enriquecer con datos de prevalencia
  const cargarGeoJSON = async () => {
    try {
      const response = await fetch('/data/peru_departamentos.geojson');
      const geoJsonData = await response.json();
      
      // Calcular prevalencia por región
      const prevalenciaPorRegion = calcularPrevalenciaPorRegion(filters);

      console.log(prevalenciaPorRegion);
      console.table(prevalenciaPorRegion);
      
      console.log('Prevalencia por región:', prevalenciaPorRegion); // Debug
      console.log('GeoJSON features:', geoJsonData.features.map(f => f.properties.NOMBDEP)); // Debug
      
      // Enriquecer el GeoJSON con datos de prevalencia
      const geoJsonEnriquecido = {
        ...geoJsonData,
        features: geoJsonData.features.map(feature => {
          let nombreDep = feature.properties.NOMBDEP || 
                         feature.properties.nombre || 
                         feature.properties.properties?.NOMBDEP;
          
          // Normalizar el nombre
          nombreDep = normalizarNombreDepartamento(nombreDep);
          
          console.log("GeoJSON:", nombreDep);

          console.log(
            "Regiones BD:",
            prevalenciaPorRegion.map(p => normalizarNombreDepartamento(p.region))
          );

      const prevData = prevalenciaPorRegion.find(
        p => normalizarNombreDepartamento(p.region) === nombreDep
      );

      console.log(
        "Encontrado:",
        prevData?.region,
        prevData?.total,
        prevData?.conAnemia,
        prevData?.prevalencia
      );
          
      console.log(`Buscando: ${nombreDep}, Encontrado:`, prevData); // Debug
        
        return {
          ...feature,
          properties: {
            ...feature.properties,
            NOMBDEP: nombreDep,
            prevalencia: prevData ? prevData.prevalencia : 0,
            casos: prevData ? prevData.conAnemia : 0,
            total: prevData ? prevData.total : 0
          }
        };
      })
    };
      
      setGeoData(geoJsonEnriquecido);
    } catch (error) {
      console.error('Error cargando GeoJSON:', error);
    }
  };

  cargarGeoJSON();
}, [filters]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-red-900 mb-2">🗺️ Mapa de Calor - Prevalencia de Anemia Infantil</h1>
      <p className="text-gray-600 mb-8">Visualización de la prevalencia de anemia por departamento. El color más oscuro indica mayor prevalencia.</p>
      
      {/* Filtros */}
      <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl">
        <SlicerFiltro 
          label="Año" 
          options={anos}
          value={filters.year}
          onChange={(v) => updateFilters({ year: v })}
        />
        <SlicerFiltro 
          label="Región" 
          options={regiones}
          value={filters.region}
          onChange={(v) => updateFilters({ region: v })}
        />
        <SlicerFiltro 
          label="Residencia" 
          options={['Todos', 'Urbano', 'Rural']}
          value={filters.residencia}
          onChange={(v) => updateFilters({ residencia: v })}
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <TarjetaKPI titulo="Total Niños" valor={kpis.totalNinios?.toLocaleString() || '0'} icono="👶" />
        <TarjetaKPI titulo="Con Anemia" valor={kpis.conAnemia?.toLocaleString() || '0'} icono="⚠️" />
        <TarjetaKPI titulo="% Prevalencia" valor={`${kpis.prevalencia || 0}%`} icono="📈" />
        <TarjetaKPI titulo="Período" valor={filters.year} icono="📅" />
      </div>

      {/* Mapa */}
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-lg font-bold text-red-900 mb-4">Distribución Geográfica - Mapa de Calor</h2>
            <MapaCalorPeru geoData={geoData} />
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 shadow-sm border border-red-200">
            <h3 className="font-bold text-red-900 mb-4">📊 Resumen Filtrado</h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600">Año</p>
                <p className="text-lg font-bold text-red-900">{filters.year}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600">Región</p>
                <p className="text-lg font-bold text-red-900">{filters.region}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600">Residencia</p>
                <p className="text-lg font-bold text-red-900">{filters.residencia}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600">Prevalencia</p>
                <p className="text-2xl font-bold text-red-900">{kpis.prevalencia || 0}%</p>
              </div>
            </div>
          </div>

          {/* Leyenda de colores */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-bold text-red-900 mb-3 text-sm">Escala de Prevalencia</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-900 rounded"></div>
                <span>Crítico (&gt; 50%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-700 rounded"></div>
                <span>Alto (40-50%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Moderado (30-40%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>Bajo (20-30%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Muy Bajo (&lt; 20%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}