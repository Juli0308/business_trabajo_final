// src/components/SlicerFiltro.jsx
export default function SlicerFiltro({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-bold text-red-900 uppercase mb-1">{label}</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="p-2 border border-red-200 rounded-lg bg-white shadow-sm outline-none"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}