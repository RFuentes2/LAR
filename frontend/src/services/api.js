import axios from 'axios';

// Use relative path to leverage Nginx proxy in production
// This avoids hardcoding random Google Cloud URLs
const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log('🚀 LAR University API initialized at:', API_URL);

// Request interceptor for adding the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('eduai_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
