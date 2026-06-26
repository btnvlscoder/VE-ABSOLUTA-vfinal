import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, LayoutDashboard, History, Settings } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [motorOnline, setMotorOnline] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Hacemos un ping ligero al backend
        await axios.get(`${API_BASE_URL}/analizar/estadisticas`);
        setMotorOnline(true);
      } catch (error) {
        setMotorOnline(false);
      }
    };

    checkConnection();

    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <ShieldAlert size={32} className="logo-icon" />
        <h2>VE ABSOLUTA</h2>
      </div>
      
      <nav className="sidebar-nav">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard Global</span>
        </Link>
        
        <Link to="/analisis" className={`nav-link ${location.pathname === '/analisis' ? 'active' : ''}`}>
          <ShieldAlert size={20} />
          <span>Nuevo Análisis</span>
        </Link>
        
        <Link to="/historial" className={`nav-link ${location.pathname === '/historial' ? 'active' : ''}`}>
          <History size={20} />
          <span>Historial de Casos</span>
        </Link>
      </nav>

      {/* FOOTER CON ESTADO REAL DEL SISTEMA */}
      <div className="sidebar-footer" style={{ cursor: 'default' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            backgroundColor: motorOnline ? '#10b981' : '#ef4444', 
            borderRadius: '50%', 
            boxShadow: motorOnline ? '0 0 8px #10b981' : '0 0 8px #ef4444',
            transition: 'all 0.3s ease'
          }}></div>
          <span style={{ fontSize: '0.85rem', color: motorOnline ? '#64748b' : '#ef4444' }}>
            {motorOnline ? 'Motor IA Conectado' : 'Fallo de Conexión'}
          </span>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#475569', marginTop: '5px', display: 'block' }}>
          v1.0.0-MVP
        </span>
      </div>
    </div>
  );
};

export default Sidebar;