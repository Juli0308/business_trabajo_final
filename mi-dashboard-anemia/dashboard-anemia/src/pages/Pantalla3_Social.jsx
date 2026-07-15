// src/pages/Pantalla3_Social.jsx
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SlicerFiltro from '../components/SlicerFiltro';

export default function Pantalla3_Social() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Carga tus datasets
    fetch('/data/fact_anemia.json').then(r => r.json()).then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <SlicerFiltro label="Región" options={['Amazonas', 'Cajamarca', 'Lima']} onChange={() => {}} />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm h-96">
          <h3 className="font-bold text-red-900 mb-4">Anemia por Nivel Socioeconómico</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="SocioKey" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Hemoglobina" fill="#991b1b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}