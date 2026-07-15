// src/App.jsx
import { useState } from 'react';
import './index.css';
import Pantalla1_Mapa from './pages/Pantalla1_Mapa';
import Pantalla2_Perfil from './pages/Pantalla2_Perfil';
import Pantalla3_Social from './pages/Pantalla3_Social';
import Pantalla4_Historico from './pages/Pantalla4_Historico';

export default function App() {
  const [view, setView] = useState('Mapa');
  
  const screens = { 
    Mapa: <Pantalla1_Mapa />, 
    Perfil: <Pantalla2_Perfil />, 
    Social: <Pantalla3_Social />, 
    Historico: <Pantalla4_Historico /> 
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <nav className="w-64 bg-gradient-to-b from-red-900 to-red-800 text-white p-6 shadow-lg overflow-y-auto">
        <h1 className="text-2xl font-bold mb-8 text-white">📊 Anemia Perú</h1>
        <div className="space-y-2">
          {Object.keys(screens).map(item => (
            <button 
              key={item} 
              className={`sidebar-btn ${view === item ? 'bg-red-700' : ''}`}
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
  );
}
