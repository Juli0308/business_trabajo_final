// src/App.jsx
import { useState } from 'react';
import './styles/dashboard.css';
import Pantalla1_Mapa from './pages/Pantalla1_Mapa';
import Pantalla2_Perfil from './pages/Pantalla2_Perfil';
import Pantalla3_Social from './pages/Pantalla3_Social';
import Pantalla4_Historico from './pages/Pantalla4_Historico';

export default function App() {
  const [view, setView] = useState('Mapa');
  const screens = { Mapa: <Pantalla1_Mapa />, Perfil: <Pantalla2_Perfil />, Social: <Pantalla3_Social />, Historico: <Pantalla4_Historico /> };

  return (
    <div className="flex h-screen">
      <nav className="w-64 bg-red-900 text-white p-6">
        <h1 className="text-xl font-bold mb-10">Anemia Perú</h1>
        {Object.keys(screens).map(item => (
          <button key={item} className="sidebar-btn" onClick={() => setView(item)}>{item}</button>
        ))}
      </nav>
      <main className="flex-1 p-8 bg-gray-50 overflow-y-auto">{screens[view]}</main>
    </div>
  );
}