import React from 'react';
import './ControlPanel.css';

const ControlPanel = ({ onFileChange, onUpload, loading }) => {
  return (
    <div className="control-panel">
      <input 
        type="file" 
        onChange={onFileChange} 
        accept="image/jpeg, image/png, image/webp"
        className="file-input"
      />
      <button 
        onClick={onUpload} 
        disabled={loading}
        className={`upload-button ${loading ? 'btn-loading' : 'btn-active'}`}
      >
        {loading ? 'Analizando en Nodo GPU...' : 'Ejecutar Análisis'}
      </button>
    </div>
  );
};

export default ControlPanel;