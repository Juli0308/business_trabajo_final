// src/pages/Pantalla2_Perfil.jsx
import { useEffect, useState } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import SlicerFiltro from '../components/SlicerFiltro';
import TarjetaKPI from '../components/TarjetaKPI';

export default function Pantalla2_Perfil() {
  const [data, setData] = useState([]);
  const [selectedAge, setSelectedAge] = useState('Todos');
  const [kpiData, setKpiData] = useState({
    totalNinios: 0,
    anemiaGeneral: 0,
    anemiaLeve: 0,
    anemiaModera: 0
  });

  useEffect(() => {
    // Carga tus datasets
    fetch('/data/fact_anemia.json')
      .then(r => r.json())
      .then(data => {
        setData(data);
        // Calcular KPIs básicos
        if (Array.isArray(data) && data.length > 0) {
          setKpiData({
            totalNinios: data.length,
            anemiaGeneral: Math.round((data.length * 42.5) / 100),
            anemiaLeve: Math.round((data.length * 18.3) / 100),
            anemiaModera: Math.round((data.length * 24.2) / 100)
          });
        }
      })
      .catch(err => console.error('Error cargando datos:', err));
  }, []);

  // Datos simulados para distribución etaria
  const distribucionEdad = [
    { name: '6-11 meses', value: 280, fill: '#dc2626' },
    { name: '12-23 meses', value: 450, fill: '#991b1b' },
    { name: '24-35 meses', value: 380, fill: '#7f1d1d' },
    { name: '36-59 meses', value: 290, fill: '#5a0a0a' }
  ];

  // Datos simulados para clasificación clínica
  const clasificacionClinica = [
    { name: 'Sin Anemia', pacientes: 574, porcentaje: 57.5 },
    { name: 'Anemia Leve', pacientes: 182, porcentaje: 18.3 },
    { name: 'Anemia Moderada', pacientes: 241, porcentaje: 24.2 }
  ];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex gap-4">
        <SlicerFiltro 
          label="Grupo Etario" 
          options={['Todos', '6-11 meses', '12-23 meses', '24-35 meses', '36-59 meses']}
          onChange={setSelectedAge}
        />
        <SlicerFiltro 
          label="Región" 
          options={['Todas', 'Amazonas', 'Ancash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali']}
          onChange={() => {}}
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <TarjetaKPI titulo="Total Niños Evaluados" valor={kpiData.totalNinios.toString()} />
        <TarjetaKPI titulo="Con Anemia General" valor={kpiData.anemiaGeneral.toString()} />
        <TarjetaKPI titulo="Anemia Leve" valor={kpiData.anemiaLeve.toString()} />
        <TarjetaKPI titulo="Anemia Moderada" valor={kpiData.anemiaModera.toString()} />
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-2 gap-6">
        {/* Distribución por Edad */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-bold text-red-900 mb-4">Distribución por Grupo Etario</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distribucionEdad}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {distribucionEdad.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Clasificación Clínica */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-bold text-red-900 mb-4">Clasificación Clínica</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clasificacionClinica}>
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pacientes" fill="#991b1b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de datos */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-bold text-red-900 mb-4">Resumen Clínico por Grupo Etario</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-red-50 border-b-2 border-red-900">
              <tr>
                <th className="p-3 font-semibold text-red-900">Grupo Etario</th>
                <th className="p-3 font-semibold text-red-900">Total Evaluados</th>
                <th className="p-3 font-semibold text-red-900">Sin Anemia</th>
                <th className="p-3 font-semibold text-red-900">Anemia Leve</th>
                <th className="p-3 font-semibold text-red-900">Anemia Moderada</th>
                <th className="p-3 font-semibold text-red-900">% Prevalencia</th>
              </tr>
            </thead>
            <tbody>
              {distribucionEdad.map((row, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-3">{row.name}</td>
                  <td className="p-3">{row.value}</td>
                  <td className="p-3">{Math.round(row.value * 0.575)}</td>
                  <td className="p-3">{Math.round(row.value * 0.183)}</td>
                  <td className="p-3">{Math.round(row.value * 0.242)}</td>
                  <td className="p-3 font-semibold text-red-900">42.5%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
