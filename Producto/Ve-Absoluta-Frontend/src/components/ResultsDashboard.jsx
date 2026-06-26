import React from 'react';
import './ResultsDashboard.css';
import HeatmapViewer from './HeatmapViewer';
import ForensicRadarChart from './ForensicRadarChart';
import { generarNarrativaPericial } from '../utils/interpreteForense';

const ResultsDashboard = ({ result, imagePreview }) => {
  if (!result) {
    return <div className="loading-state">Esperando resultados del análisis...</div>;
  }

  // Procesamos los datos crudos que vienen del backend
  const reporteDinámico = result.datos_crudos_frontend 
    ? generarNarrativaPericial(result.datos_crudos_frontend) 
    : null;

  return (
    <div className="results-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Reporte de Evidencia Forense</h2>
        
        {/* Badge Dinámico basado en la matriz de conflictos */}
        {reporteDinámico ? (
          <div className="veredicto-badge">
            <span>Estado del Archivo:</span>
            {/* Usamos el color y texto exacto calculado por el intérprete */}
            <span className={`certeza badge-${reporteDinámico.badge.color}`}>
              {reporteDinámico.badge.texto} ({result.confianza_global || 0}%)
            </span>
          </div>
        ) : (
          /* Fallback en caso de que el backend aún no envíe los datos crudos */
          <div className="veredicto-badge">
            <span>Nivel de Certeza</span>
            <span className={`certeza ${result.veredicto_final === 'REAL' ? 'seguro' : 'critico'}`}>
              {result.confianza_global}% - {result.veredicto_final}
            </span>
          </div>
        )}
      </div>

      <div className="images-container">
        <div className="original-image-box">
          <h3>Evidencia Recibida</h3>
          {imagePreview ? (
            <img src={imagePreview} alt="Original" className="original-img" />
          ) : (
            <p>No hay imagen original cargada</p>
          )}
        </div>

        <HeatmapViewer result={result} />
      </div>

      <div className="radar-section">
        <ForensicRadarChart metricas={result.metadata?.metricas_heuristicas} />
      </div>

      <div className="peritaje-directo">
        <h3 className="peritaje-titulo">Dictamen Pericial Detallado</h3>
        
        {/* Renderizado Dinámico de los Bloques Narrativos */}
        {reporteDinámico ? (
          <div className="peritaje-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {reporteDinámico.textos.map((bloque, index) => (
              <div key={index} className="analisis-box">
                <h4 style={{ color: '#60a5fa', marginBottom: '0.5rem' }}>{bloque.titulo}</h4>
                <p>{bloque.contenido}</p>
              </div>
            ))}
          </div>
        ) : (
          /* Fallback al sistema antiguo si no está el intérprete */
          <div className="peritaje-grid">
            <div className="analisis-box">
              <h4>Inteligencia Artificial (ViT)</h4>
              <p>{result.desglose_pericial?.analisis_ia_vit?.detalle || "Sin datos crudos para analizar."}</p>
            </div>
            <div className="analisis-box">
              <h4>Integridad Digital (ELA)</h4>
              <p>{result.desglose_pericial?.analisis_ela?.detalle || "Sin datos crudos para analizar."}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDashboard;