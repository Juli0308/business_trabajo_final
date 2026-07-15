// src/pages/Pantalla4_Historico.jsx
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import SlicerFiltro from '../components/SlicerFiltro';

export default function Pantalla4_Historico() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/data/fact_anemia.json').then(r => r.json()).then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <SlicerFiltro label="Residencia" options={['Urbano', 'Rural']} onChange={() => {}} />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm h-96">
        <h3 className="font-bold text-red-900 mb-4">Evolución Histórica (2016-2024)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="TiempoKey" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="Hemoglobina" stroke="#991b1b" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-bold text-red-900 mb-4">Ranking: Regiones con Mayor Mejora</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-2">Región</th>
              <th className="p-2">Reducción %</th>
            </tr>
          </thead>
          <tbody>
            {/* Aquí mapearías tus datos de regiones */}
          </tbody>
        </table>
      </div>
    </div>
  );
}