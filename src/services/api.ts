import axios from 'axios';
import { getToken } from './authService';

const API_URL = 'https://api-dev.overinspect.pro'; 

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
