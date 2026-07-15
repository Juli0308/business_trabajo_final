import { useContext, useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Cell } from 'recharts';
import SlicerFiltro from '../components/SlicerFiltro';
import TarjetaKPI from '../components/TarjetaKPI';
import { FiltersContext } from '../context/FiltersContext';
import { 
  loadAllData,
  getAnosDisponibles,
  getRegionesDisponibles,
  getDistribucionSocioeconomico,
  calcularKPIsFiltrados
} from '../data/dataService';

export default function Pantalla3_Social() {
  const { filters, updateFilters } = useContext(FiltersContext);
  const [anos, setAnos] = useState([]);
  const [regiones, setRegiones] = useState([]);
  const [dataSocio, setDataSocio] = useState([]);
  const [kpis, setKpis] = useState({});

  useEffect(() => {
    const initData = async () => {
      await loadAllData();
      setAnos(getAnosDisponibles());
      setRegiones(getRegionesDisponibles());
      setDataSocio(getDistribucionSocioeconomico());
    };
    initData();
  }, []);

  useEffect(() => {
    const kpisCalculados = calcularKPIsFiltrados(filters);
    setKpis(kpisCalculados);
  }, [filters]);

  const COLORS = ['#7f1d1d', '#991b1b', '#b91c1c', '#dc2626', '#ef4444'];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-red-900 mb-2">💼 Análisis Socioeconómico - Anemia Infantil</h1>
      <p className="text-gray-600 mb-8">Prevalencia de anemia por nivel socioeconómico</p>

      {/* Filtros */}
      <div className="grid grid-cols-2 gap-4 mb-8 max-w-xl">
        <SlicerFiltro 
          label="Año" 
          options={anos}
          value={filters.year}
          onChange={(v) => updateFilters({ year: v })}
        />
        <SlicerFiltro 
          label="Departamento" 
          options={regiones}
          value={filters.region}
          onChange={(v) => updateFilters({ region: v })}
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <TarjetaKPI titulo="Total Niños" valor={kpis.totalNinios?.toLocaleString() || '0'} icono="👶" />
        <TarjetaKPI titulo="Con Anemia" valor={kpis.conAnemia?.toLocaleString() || '0'} icono="⚠️" />
        <TarjetaKPI titulo="% Prevalencia General" valor={`${kpis.prevalencia || 0}%`} icono="📊" />
      </div>

      {/* Gráfico de barras */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h3 className="font-bold text-red-900 mb-4 text-lg">Anemia por Nivel Socioeconómico</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dataSocio} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="nivel" 
              angle={-45} 
              textAnchor="end" 
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis label={{ value: 'Prevalencia (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            <Bar dataKey="prevalencia" name="Prevalencia %" fill="#991b1b" radius={[8, 8, 0, 0]}>
              {dataSocio.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla de detalles */}
<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
  <h3 className="font-bold text-red-900 mb-4 text-lg">Detalle por Nivel Socioeconómico</h3>
  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm">
      <thead className="bg-red-50 border-b-2 border-red-900">
        <tr>
          <th className="p-3 font-semibold text-red-900">Clasificación Socioeconómica</th>
          <th className="p-3 font-semibold text-red-900">Niños con Anemia</th>
          <th className="p-3 font-semibold text-red-900">Total Evaluados</th>
          <th className="p-3 font-semibold text-red-900">Prevalencia %</th>
          <th className="p-3 font-semibold text-red-900">Estado de Riesgo</th>
        </tr>
      </thead>
      <tbody>
        {dataSocio.map((row, idx) => {
          let estadoRiesgo = '';
          let color = '';
          
          if (row.prevalencia > 50) {
            estadoRiesgo = 'Crítico (>50%)';
            color = 'text-red-900 font-semibold';
          } else if (row.prevalencia > 40) {
            estadoRiesgo = 'Alto (40-50%)';
            color = 'text-orange-600 font-semibold';
          } else {
            estadoRiesgo = 'Moderado (<40%)';
            color = 'text-yellow-600 font-semibold';
          }

          return (
            <tr key={idx} className="border-b hover:bg-red-50 transition-colors">
              <td className="p-3 font-medium">{row.nivel}</td>
              <td className="p-3">{row.casos.toLocaleString()} niños</td>
              <td className="p-3">{row.total.toLocaleString()} niños</td>
              <td className="p-3 font-bold text-red-900">{row.prevalencia}%</td>
              <td className={`p-3 ${color}`}>
                {estadoRiesgo}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
    <p className="text-xs text-blue-900">
      <strong>📌 Interpretación:</strong> Se observan brechas significativas en la prevalencia de anemia 
      entre grupos socioeconómicos, con mayor prevalencia en poblaciones más vulnerables.
    </p>
  </div>
</div>
    </div>
  );
}