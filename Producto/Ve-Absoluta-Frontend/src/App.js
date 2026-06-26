import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Tu CSS principal

import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import HeatmapViewer from './components/HeatmapViewer';
import TechnicalBreakdown from './components/TechnicalBreakdown';

function App() {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const showError = (message) => alert(`Alerta Forense: ${message}`);

  const handleUpload = async () => {
    if (!file) return alert("Sube una imagen primero");
    if (file.size > 10485760) return alert("🚨 Alerta Forense: El archivo excede el tamaño máximo permitido (10MB).");

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('https://ve-absoluta-backend.onrender.com/api/v1/analizar/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (error) {
      console.error("Algo falló en la subida:", error);
      alert("Fallo en la comunicación con el servidor. Revisa la consola para más detalles.");
    } finally {
      setLoading(false);
    }
  };

  const prediccionFinal = result?.veredicto_final || result?.prediccion;
  const confianzaFinal = result?.confianza_global || result?.confianza;
  const isFake = prediccionFinal === 'FAKE';
  const certezaValor = Math.round(confianzaFinal > 1 ? confianzaFinal : confianzaFinal * 100);

  return (
    <div className="app-container">
      <div className="app-content">
        
        <Header />
        
        <ControlPanel 
          onFileChange={handleFileChange} 
          onUpload={handleUpload} 
          loading={loading} 
        />

        {result && (
          <div className="results-dashboard">
            
            <div className="results-header">
              <h2 className="results-title">Reporte de Evidencia Forense</h2>
              <div style={{ textAlign: 'right' }}>
                <span className="certeza-label">Nivel de Certeza</span>
                <div className={`certeza-value ${isFake ? 'text-fake' : 'text-real'}`}>
                  {certezaValor}% - {prediccionFinal}
                </div>
              </div>
            </div>

            <div className="images-container">
              <div className="original-image-box">
                <h3 className="original-title">Evidencia Recibida</h3>
                <div className="original-wrapper">
                  {imagePreview && <img src={imagePreview} alt="Original" className="original-img" />}
                </div>
              </div>

              <HeatmapViewer result={result} />
            </div>

            <TechnicalBreakdown desglose={result.desglose_pericial} id={result.id} nombreArchivo={result.nombreArchivo} />
            
          </div>
        )}
      </div>
    </div>
  );
}

export default App;