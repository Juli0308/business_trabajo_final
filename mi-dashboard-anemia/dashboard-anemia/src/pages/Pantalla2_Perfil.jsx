import { useContext, useEffect, useState, useMemo } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import SlicerFiltro from '../components/SlicerFiltro';
import TarjetaKPI from '../components/TarjetaKPI';
import { FiltersContext } from '../context/FiltersContext';
import { 
  loadAllData,
  getAnosDisponibles,
  getRegionesDisponibles,
  getDistribucionPorEdad,
  getClasificacionClinica,
  calcularKPIsFiltrados
} from '../data/dataService';

export default function Pantalla2_Perfil() {
  const { filters, updateFilters } = useContext(FiltersContext);
  const [anos, setAnos] = useState([]);
  const [regiones, setRegiones] = useState([]);
  const [distribucionEdad, setDistribucionEdad] = useState([]);
  const [clasificacionClinica, setClasificacionClinica] = useState([]);
  const [kpis, setKpis] = useState({});

  useEffect(() => {
    const initData = async () => {
      await loadAllData();
      setAnos(getAnosDisponibles());
      setRegiones(getRegionesDisponibles());
      setDistribucionEdad(getDistribucionPorEdad());
      setClasificacionClinica(getClasificacionClinica());
    };
    initData();
  }, []);

  useEffect(() => {
    const kpisCalculados = calcularKPIsFiltrados(filters);
    setKpis(kpisCalculados);
  }, [filters]);

  const COLORS = ['#dc2626', '#991b1b', '#7f1d1d', '#5a0a0a'];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-red-900 mb-2">👶 Análisis de Perfiles - Demografía y Clínica</h1>
      <p className="text-gray-600 mb-8">Distribución por edad y clasificación clínica de anemia infantil</p>

      {/* Filtros */}
      <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl">
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
        <SlicerFiltro 
          label="Año" 
          options={anos}
          value={filters.year}
          onChange={(v) => updateFilters({ year: v })}
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <TarjetaKPI titulo="Total Niños Evaluados" valor={kpis.totalNinios?.toLocaleString() || '0'} icono="👶" />
        <TarjetaKPI titulo="Con Anemia General" valor={kpis.conAnemia?.toLocaleString() || '0'} icono="⚠️" />
        <TarjetaKPI titulo="Anemia Leve" valor={kpis.anemiaLeve?.toLocaleString() || '0'} icono="🟡" />
        <TarjetaKPI titulo="Anemia Moderada" valor={kpis.anemiaModera?.toLocaleString() || '0'} icono="🔴" />
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Distribución por Edad */}
<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
  <h3 className="font-bold text-red-900 mb-4">Distribución por Grupo Etario</h3>
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={distribucionEdad}
        cx="50%"
        cy="50%"
        labelLine={true}
        label={({ grupo, casos, prevalencia }) => `${grupo}: ${casos.toLocaleString()} (${prevalencia}%)`}
        outerRadius={100}
        fill="#8884d8"
        dataKey="casos"
      >
        {distribucionEdad.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip 
        formatter={(value) => `${value.toLocaleString()} casos`}
        labelFormatter={(label) => `Grupo: ${label}`}
      />
    </PieChart>
  </ResponsiveContainer>
</div>

{/* Clasificación Clínica */}
<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
  <h3 className="font-bold text-red-900 mb-4">Clasificación Clínica</h3>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={clasificacionClinica}>
      <XAxis dataKey="categoria" angle={-15} textAnchor="end" height={80} />
      <YAxis />
      <Tooltip formatter={(value) => value.toLocaleString()} />
      <Bar dataKey="casos" fill="#991b1b" radius={[8, 8, 0, 0]}>
        {clasificacionClinica.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index]} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</div>

        {/* Clasificación Clínica */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-red-900 mb-4">Clasificación Clínica</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clasificacionClinica}>
              <XAxis dataKey="categoria" angle={-15} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Bar dataKey="casos" fill="#991b1b" radius={[8, 8, 0, 0]}>
                {clasificacionClinica.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de datos */}
<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
  <h3 className="font-bold text-red-900 mb-4">Resumen Clínico por Grupo Etario</h3>
  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm">
      <thead className="bg-red-50 border-b-2 border-red-900">
        <tr>
          <th className="p-3 font-semibold text-red-900">Grupo Etario</th>
          <th className="p-3 font-semibold text-red-900">Total de Casos</th>
          <th className="p-3 font-semibold text-red-900">Prevalencia de Anemia %</th>
          <th className="p-3 font-semibold text-red-900">Nivel de Riesgo</th>
        </tr>
      </thead>
      <tbody>
        {distribucionEdad.map((row, idx) => {
          let nivelRiesgo = 'Desconocido';
          let colorBg = 'bg-gray-100';
          
          if (row.prevalencia > 60) {
            nivelRiesgo = 'Crítico (>60%)';
            colorBg = 'bg-red-900 text-white';
          } else if (row.prevalencia > 40) {
            nivelRiesgo = 'Alto (40-60%)';
            colorBg = 'bg-orange-600 text-white';
          } else if (row.prevalencia > 20) {
            nivelRiesgo = 'Moderado (20-40%)';
            colorBg = 'bg-yellow-600 text-white';
          } else {
            nivelRiesgo = 'Bajo (<20%)';
            colorBg = 'bg-green-600 text-white';
          }

          return (
            <tr key={idx} className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium">{row.grupo} meses</td>
              <td className="p-3">{row.casos.toLocaleString()} niños</td>
              <td className="p-3 font-bold text-red-900">{row.prevalencia}%</td>
              <td className="p-3">
                <span className={`px-3 py-1 rounded text-xs font-semibold ${colorBg}`}>
                  {nivelRiesgo}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
</div>
    </div>
  );
}