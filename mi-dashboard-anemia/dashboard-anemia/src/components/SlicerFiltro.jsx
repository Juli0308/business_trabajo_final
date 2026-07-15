// src/components/SlicerFiltro.jsx
export default function SlicerFiltro({ label, options = [], value, onChange }) {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const selectedValue = value || (options.length > 0 ? options[0] : '');

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-red-900 uppercase mb-1 tracking-wide">{label}</label>
      <select 
        value={selectedValue} 
        onChange={handleChange}
        className="px-4 py-2 border-2 border-red-200 rounded-lg bg-white text-gray-700 font-medium shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200 transition-colors duration-200 cursor-pointer"
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
