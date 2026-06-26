import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import './ForensicRadarChart.css';

const ForensicRadarChart = ({ metricas }) => {
  if (!metricas || metricas.length === 0) {
    return <div className="radar-placeholder">Esperando telemetría forense...</div>;
  }

const interpretarRadar = (data) => {
    // Calculamos un score promediado que sea sensible
    const totalAnomalia = data.reduce((acc, m) => acc + m.valor, 0) / data.length;
    
    // UMBRALES DE ACCIÓN AJUSTADOS:
    // 0.0 - 0.08 -> Celeste (Estado de Integridad)
    // 0.09 - 0.25 -> Naranja (Zona de Sospecha)
    // > 0.25 -> Rojo (Zona de Alerta Crítica)

    if (totalAnomalia > 0.25) {
      return { severidad: "critico", texto: "Desviación matemática severa. Se identificaron múltiples vectores anómalos. La dispersión estructural es incompatible con la física de un sensor real." };
    } else if (totalAnomalia > 0.08) {
      return { severidad: "sospechoso", texto: "Irregularidades estructurales localizadas. Se detectó actividad inusual consistente con compresión, filtros o alteraciones parciales." };
    } else {
      return { severidad: "seguro", texto: "Integridad matemática validada. Los vectores de frecuencia, ruido y entropía convergen dentro de los parámetros esperados." };
    }
  };

  const diagnostico = interpretarRadar(metricas);

  return (
    <div className="radar-container">
      <h3 className="radar-title">Análisis de Integridad Matemática</h3>
      
      <div className="radar-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={metricas}>
            <PolarGrid stroke="#475569" />
            <PolarAngleAxis dataKey="parametro" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
            <Radar 
              name="Firma Digital" 
              dataKey="valor" 
              stroke={diagnostico.severidad === 'critico' ? '#ef4444' : diagnostico.severidad === 'sospechoso' ? '#f59e0b' : '#38bdf8'} 
              strokeWidth={2} 
              fill={diagnostico.severidad === 'critico' ? '#ef4444' : diagnostico.severidad === 'sospechoso' ? '#f59e0b' : '#38bdf8'} 
              fillOpacity={0.4} 
            />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Caja de diagnóstico con estilo dinámico */}
      <div className={`radar-interpretation status-${diagnostico.severidad}`}>
        <h4 className="uppercase font-bold text-sm tracking-wider mb-1">Diagnóstico de Integridad</h4>
        <p>{diagnostico.texto}</p>
      </div>
    </div>
  );
};

export default ForensicRadarChart;