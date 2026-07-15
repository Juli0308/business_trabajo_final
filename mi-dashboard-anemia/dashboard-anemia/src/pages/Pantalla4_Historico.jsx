import { useContext, useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import SlicerFiltro from '../components/SlicerFiltro';
import TarjetaKPI from '../components/TarjetaKPI';
import { FiltersContext } from '../context/FiltersContext';
import { 
  loadAllData,
  getRegionesDisponibles,
  getEvolucionHistorica,
  getRankingMejora,
  calcularKPIsFiltrados
} from '../data/dataService';

export default function Pantalla4_Historico() {
  const { filters, updateFilters } = useContext(FiltersContext);
  const [regiones, setRegiones] = useState([]);
  const [datosHistoricos, setDatosHistoricos] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [kpis, setKpis] = useState({});

  useEffect(() => {
    const initData = async () => {
      await loadAllData();
      setRegiones(getRegionesDisponibles());
      setDatosHistoricos(getEvolucionHistorica(filters.region !== 'Todos' ? filters.region : null));
      setRanking(getRankingMejora());
    };
    initData();
  }, [filters.region]);

  useEffect(() => {
    const kpisCalculados = calcularKPIsFiltrados(filters);
    setKpis(kpisCalculados);
  }, [filters]);

  const cambio2016a2024 = datosHistoricos.length > 0 
    ? ((datosHistoricos[0]?.prevalencia - datosHistoricos[datosHistoricos.length - 1]?.prevalencia) || 0).toFixed(1)
    : 0;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-red-900 mb-2">📈 Análisis Histórico - Evolución 2016-2024</h1>
      <p className="text-gray-600 mb-8">Tendencias de prevalencia de anemia infantil a lo largo del tiempo</p>

      {/* Filtros */}
      <div className="grid grid-cols-1 gap-4 mb-8 max-w-xl">
        <SlicerFiltro 
          label="Departamento" 
          options={regiones}
          value={filters.region}
          onChange={(v) => updateFilters({ region: v })}
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <TarjetaKPI 
          titulo="Prevalencia 2016" 
          valor={`${datosHistoricos.length > 0 ? datosHistoricos[0].prevalencia : 0}%`} 
          icono="📊" 
        />
        <TarjetaKPI 
          titulo="Prevalencia 2024" 
          valor={`${datosHistoricos.length > 0 ? datosHistoricos[datosHistoricos.length - 1].prevalencia : 0}%`} 
          icono="📊" 
        />
        <TarjetaKPI 
          titulo="Reducción (2016-2024)" 
          valor={`${cambio2016a2024}%`} 
          icono="✅" 
        />
        <TarjetaKPI 
          titulo="Años de Datos" 
          valor={datosHistoricos.length}
          icono="📅" 
        />
      </div>

      {/* Gráfico de evolución histórica */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h3 className="font-bold text-red-900 mb-2 text-lg">Evolución de Prevalencia</h3>
        <p className="text-xs text-gray-600 mb-4">
          {filters.region !== 'Todos' ? `Departamento: ${filters.region}` : 'Promedio nacional'}
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={datosHistoricos} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="year" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              label={{ value: 'Prevalencia (%)', angle: -90, position: 'insideLeft' }}
              domain={[0, 100]}
            />
            <Tooltip 
              formatter={(value) => `${value}%`}
              labelFormatter={(label) => `Año: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="prevalencia" 
              name="Prevalencia de Anemia (%)"
              stroke="#991b1b" 
              strokeWidth={3}
              dot={{ fill: '#991b1b', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-green-900">
            <strong>✅ Tendencia Observada:</strong> Cambio de {cambio2016a2024}% en la prevalencia de anemia infantil 
            entre 2016 y 2024.
          </p>
        </div>
      </div>

      {/* Ranking de mejora por departamento */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-red-900 mb-4 text-lg">🏆 Top 10: Departamentos con Mayor Mejora</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-red-50 border-b-2 border-red-900">
              <tr>
                <th className="p-3 font-semibold text-red-900">Ranking</th>
                <th className="p-3 font-semibold text-red-900">Departamento</th>
                <th className="p-3 font-semibold text-red-900">Reducción %</th>
                <th className="p-3 font-semibold text-red-900">Período</th>
                <th className="p-3 font-semibold text-red-900">Progreso</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((row, idx) => (
                <tr key={idx} className="border-b hover:bg-red-50 transition-colors">
                  <td className="p-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-red-900 text-white rounded-full text-xs font-bold">
                      {idx + 1}
                    </span>
                  </td>
                  <td className="p-3 font-medium">{row.region}</td>
                  <td className="p-3 font-bold text-green-700">{row.reduccion}%</td>
                  <td className="p-3 text-xs">{row.anoInicio}-{row.anoFin}</td>
                  <td className="p-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(parseFloat(row.reduccion) * 2, 100)}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-900">
            <strong>📌 Interpretación:</strong> Los departamentos que muestran mayor reducción en prevalencia 
            de anemia son aquellos con programas más efectivos.
          </p>
        </div>
      </div>

      {/* Resumen general */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
          <p className="text-xs font-semibold text-red-900">Total Evaluados</p>
          <p className="text-2xl font-bold text-red-900">{kpis.totalNinios?.toLocaleString() || '0'}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
          <p className="text-xs font-semibold text-yellow-900">Con Anemia</p>
          <p className="text-2xl font-bold text-yellow-900">{kpis.conAnemia?.toLocaleString() || '0'}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <p className="text-xs font-semibold text-green-900">Sin Anemia</p>
          <p className="text-2xl font-bold text-green-900">{Math.max(0, (kpis.totalNinios || 0) - (kpis.conAnemia || 0)).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}