export const API_BASE_URL = 'https://ve-absoluta-backend.onrender.com/api/v1';
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const SERVER_LIMIT_BYTES = 1 * 1024 * 1024;

export const formatFileSize = (bytes) => (bytes / 1024 / 1024).toFixed(2);

export const showError = (message) => alert(`Alerta Forense: ${message}`);
