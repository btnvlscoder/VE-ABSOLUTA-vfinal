import React, { useState } from 'react';
import './HeatmapViewer.css';

<<<<<<< HEAD
const HeatmapViewer = ({ result }) => {
  const [vista, setVista] = useState('raw');

  const obtenerImagenActiva = () => {
    if (vista === 'threshold' && result.heatmap_threshold) return result.heatmap_threshold;
    if (vista === 'rollout' && result.heatmap_rollout) return result.heatmap_rollout;
    return result.heatmap_base64 || result.heatmap; 
  };

=======
const VISTA_RAW = 'raw';
const VISTA_THRESHOLD = 'threshold';
const VISTA_ROLLOUT = 'rollout';

const HeatmapViewer = ({ result }) => {
  const [vista, setVista] = useState(VISTA_RAW);

  const obtenerImagenActiva = () => {
    if (vista === VISTA_THRESHOLD && result?.heatmap_threshold) return result.heatmap_threshold;
    if (vista === VISTA_ROLLOUT && result?.heatmap_rollout) return result.heatmap_rollout;
    return result?.heatmap_base64 || result?.heatmap;
  };

  const imagenActiva = obtenerImagenActiva();

>>>>>>> 6dc108a9540a1400c1cdf1af368075ce9c836e55
  return (
    <div className="heatmap-container">
      <h3 className="heatmap-title">Evidencia Analítica (Heatmap)</h3>
      
      <div className="controls-wrapper">
        <button 
<<<<<<< HEAD
          onClick={() => setVista('raw')} 
          className={`layer-btn ${vista === 'raw' ? 'active' : 'inactive'}`}
        >
          Capa Base
        </button>
        <button 
          onClick={() => setVista('threshold')} 
          className={`layer-btn ${vista === 'threshold' ? 'active' : 'inactive'}`}
        >
          Umbral
        </button>
        <button 
          onClick={() => setVista('rollout')} 
          className={`layer-btn ${vista === 'rollout' ? 'active' : 'inactive'}`}
        >
=======
          onClick={() => setVista(VISTA_RAW)} 
          className={`layer-btn ${vista === VISTA_RAW ? 'active' : ''}`}>
          Capa Base
        </button>
        <button 
          onClick={() => setVista(VISTA_THRESHOLD)} 
          className={`layer-btn ${vista === VISTA_THRESHOLD ? 'active' : ''}`}>
          Umbral
        </button>
        <button 
          onClick={() => setVista(VISTA_ROLLOUT)} 
          className={`layer-btn ${vista === VISTA_ROLLOUT ? 'active' : ''}`}>
>>>>>>> 6dc108a9540a1400c1cdf1af368075ce9c836e55
          Rollout
        </button>
      </div>

      <div className="heatmap-wrapper">
<<<<<<< HEAD
        {obtenerImagenActiva() ? (
          <img src={obtenerImagenActiva()} alt={`Heatmap - ${vista}`} className="heatmap-img" />
        ) : (
          <span className="heatmap-loading">Cargando capas visuales...</span>
=======
        {imagenActiva ? (
          <img src={imagenActiva} alt="Heatmap" className="heatmap-img" />
        ) : (
          <span className="heatmap-loading">Cargando...</span>
>>>>>>> 6dc108a9540a1400c1cdf1af368075ce9c836e55
        )}
      </div>
    </div>
  );
};

export default HeatmapViewer;