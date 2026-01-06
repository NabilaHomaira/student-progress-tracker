import axios from 'axios';

// Normalize REACT_APP_API_URL so user can set either
// - REACT_APP_API_URL=http://localhost:5000
// or
// - REACT_APP_API_URL=http://localhost:5000/api
// and the client will still call the backend at <base>/api
const rawUrl = process.env.REACT_APP_API_URL || '';
const trimmed = rawUrl.replace(/\/$/, '');
const baseHost = trimmed ? (trimmed.endsWith('/api') ? trimmed.slice(0, -4) : trimmed) : 'http://localhost:5000';

const api = axios.create({
  baseURL: `${baseHost}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
