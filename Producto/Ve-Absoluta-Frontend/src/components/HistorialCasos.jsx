import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HistorialCasos.css';
import { API_BASE_URL } from '../utils/constants';

const HistorialCasos = () => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/analizar/historial`);
        
        console.log("Datos que llegan del Backend:", response.data[0]); 
        
        setHistorial(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar el historial:", err);
        setError("No se pudo conectar con el servidor central.");
        setLoading(false);
      }
    };

    fetchHistorial();
  }, []);

  if (loading) return <div className="historial-loading">Cargando base de datos forense...</div>;
  if (error) return <div className="historial-error">{error}</div>;

  return (
    <div className="historial-container">
      <div className="historial-header">
        <h2>Registro de Evidencias</h2>
        <p>Total de casos analizados: {historial.length}</p>
      </div>

      <div className="table-wrapper">
        <table className="forense-table">
          <thead>
            <tr>
              <th>ID Caso</th>
              <th>Evidencia</th>
              <th>Fecha de Análisis</th>
              <th>Certeza IA</th>
              <th>Dictamen Final</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((caso) => {
              // ==========================================
              // 🛡️ NORMALIZACIÓN A PRUEBA DE BALAS
              // Buscamos todas las posibles formas en las que Spring Boot pudo mandar el JSON
              // ==========================================
              const imgUrl = caso.rutaArchivo || caso.ruta_archivo || caso.url_imagen || '/placeholder-forense.png';
              const dictamen = caso.prediccion || caso.veredicto_final || 'INDEFINIDO';
              const certezaBase = caso.confianza || caso.confianza_global || 0;
              
              // Ajustamos la certeza (Si viene como 0.83, la pasamos a 83%)
              const certezaPorcentaje = certezaBase <= 1 ? (certezaBase * 100) : certezaBase;
              
              // Verificación segura para el color de la etiqueta
              const esReal = dictamen.trim().toUpperCase() === 'REAL';

              return (
                <tr key={caso.id}>
                  <td>#{caso.id}</td>
                  <td>
                    <img 
                      src={imgUrl} 
                      alt="Evidencia" 
                      className="thumbnail" 
                      onError={(e) => { e.target.src = '/placeholder-forense.png'; }}
                    />
                  </td>
                  <td>{caso.fecha ? new Date(caso.fecha).toLocaleDateString() : 'N/A'}</td>
                  <td>{certezaPorcentaje.toFixed(2)}%</td>
                  <td>
                    <span className={`badge ${esReal ? 'badge-real' : 'badge-fake'}`}>
                      {dictamen}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistorialCasos;