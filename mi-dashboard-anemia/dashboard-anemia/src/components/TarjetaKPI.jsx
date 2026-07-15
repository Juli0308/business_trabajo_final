// src/components/TarjetaKPI.jsx
export default function TarjetaKPI({ titulo, valor, icono = '📊' }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{titulo}</h3>
          <p className="text-4xl font-bold text-red-900 mt-3">{valor}</p>
        </div>
        <span className="text-3xl">{icono}</span>
      </div>
    </div>
  );
}
