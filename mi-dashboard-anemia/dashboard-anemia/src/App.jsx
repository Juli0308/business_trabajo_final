// src/App.jsx
import { useEffect, useState } from 'react';
import './index.css';
import { loadAllData } from './data/dataService';
import { FiltersProvider } from './context/FiltersContext';
import Pantalla1_Mapa from './pages/Pantalla1_Mapa';
import Pantalla2_Perfil from './pages/Pantalla2_Perfil';
import Pantalla3_Social from './pages/Pantalla3_Social';
import Pantalla4_Historico from './pages/Pantalla4_Historico';

export default function App() {
  const [view, setView] = useState('Mapa');

  useEffect(() => {
    loadAllData(); // Cargar datos al iniciar la app
  }, []);

  const screens = { 
    Mapa: <Pantalla1_Mapa />, 
    Perfil: <Pantalla2_Perfil />, 
    Social: <Pantalla3_Social />, 
    Historico: <Pantalla4_Historico /> 
  };

  return (
    <FiltersProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <nav className="w-64 bg-gradient-to-b from-red-900 to-red-800 text-white p-6 shadow-lg overflow-y-auto">
          <h1 className="text-2xl font-bold mb-8 text-white">📊 Anemia Perú</h1>
          <p className="text-xs text-red-100 mb-6">Sistema de Vigilancia ENDES 2016-2024</p>
          <div className="space-y-2">
            {Object.keys(screens).map(item => (
              <button 
                key={item} 
                className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-all duration-200 font-semibold text-white hover:bg-red-800 active:bg-red-700 ${view === item ? 'bg-red-700' : ''}`}
                onClick={() => setView(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="w-full">
            {screens[view]}
          </div>
        </main>
      </div>
    </FiltersProvider>
  );
}