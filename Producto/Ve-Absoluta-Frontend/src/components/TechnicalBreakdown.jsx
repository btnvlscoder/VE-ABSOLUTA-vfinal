import React from 'react';
import './TechnicalBreakdown.css';

const TechnicalBreakdown = ({ desglose, id, nombreArchivo }) => {
  if (!desglose) {
    return (
      <div className="breakdown-empty">
        Registro ID: #{id} | Archivo Procesado: {nombreArchivo}
      </div>
    );
  }

  const Box = ({ title, detail, color }) => (
    <div className="box-container" style={{ borderLeft: `4px solid ${color}` }}>
      <p className="box-title">{title}</p>
      <p className="box-detail">{detail}</p>
    </div>
  );

  return (
    <div className="breakdown-container">
      <h4 className="breakdown-title">Análisis Técnico Detallado</h4>
      <Box 
        title="🔍 Análisis de Coherencia Visual (IA)" 
        detail={desglose.analisis_ia_vit?.detalle} 
        color={desglose.analisis_ia_vit?.estado === 'CRÍTICO' ? '#ef4444' : '#22c55e'} 
      />
      <Box 
        title="💾 Auditoría de Integridad del Archivo (ELA)" 
        detail={desglose.analisis_ela?.detalle} 
        color={desglose.analisis_ela?.estado === 'ADVERTENCIA' ? '#eab308' : '#22c55e'} 
      />
    </div>
  );
};

export default TechnicalBreakdown;