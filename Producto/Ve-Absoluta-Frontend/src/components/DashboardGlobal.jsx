import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Database, ShieldCheck, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../utils/constants';
import './DashboardGlobal.css';

const DashboardGlobal = () => {
  const [stats, setStats] = useState({ total: 0, reales: 0, fake: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/analizar/estadisticas`);
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error cargando estadísticas:", err);
        setError("Error de conexión con el motor central VE ABSOLUTA.");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="dashboard-loading">Cargando telemetría global...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;

  const pieData = [
    { name: 'Contenido Real', value: stats.reales },
    { name: 'Generado por IA', value: stats.fake },
  ];

  const barData = [
    { name: 'Verificados', cantidad: stats.reales },
    { name: 'Manipulados', cantidad: stats.fake }
  ];

  const COLORS = ['#10b981', '#ef4444']; 

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard Global de Amenazas</h1>
        <p>Visión general de la integridad digital analizada por VE ABSOLUTA.</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card total">
          <div className="kpi-icon"><Database size={24} /></div>
          <div className="kpi-data">
            <h3>Total Analizado</h3>
            <p className="kpi-value">{stats.total}</p>
            <p className="kpi-subtitle">Registros en base de datos</p>
          </div>
        </div>

        <div className="kpi-card real">
          <div className="kpi-icon"><ShieldCheck size={24} /></div>
          <div className="kpi-data">
            <h3>Total Reales</h3>
            <p className="kpi-value">{stats.reales}</p>
            <p className="kpi-subtitle">Firmas ópticas verificadas</p>
          </div>
        </div>

        <div className="kpi-card fake">
          <div className="kpi-icon"><AlertTriangle size={24} /></div>
          <div className="kpi-data">
            <h3>Detecciones IA</h3>
            <p className="kpi-value">{stats.fake}</p>
            <p className="kpi-subtitle">Contenido manipulado</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-wrapper">
          <h3>Distribución de Integridad</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-wrapper">
          <h3>Métricas Comparativas</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(51, 65, 85, 0.2)' }}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardGlobal;