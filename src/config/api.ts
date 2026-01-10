// Configure your Python backend API URLs here
export const API_CONFIG = {
  // Main API (DenseNet model, leaf analysis, 3D models)
  PYTHON_BACKEND_URL: import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000',
  ANALYZE_ENDPOINT: '/analyze-leaf',
  
  // Azure Table Storage API (plant data)
  AZURE_TABLE_URL: 'http://localhost:8001',
  
  // GLB Proxy for 3D models
  GLB_PROXY_URL: 'http://localhost:8000/proxy-glb'
};
