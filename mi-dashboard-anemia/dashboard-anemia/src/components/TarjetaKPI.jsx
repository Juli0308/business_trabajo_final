// src/components/TarjetaKPI.jsx
export default function TarjetaKPI({ titulo, valor }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-500">{titulo}</h3>
      <p className="text-3xl font-extrabold text-red-900 mt-2">{valor}</p>
    </div>
  );
}