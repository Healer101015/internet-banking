import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    withCredentials: true // Permite envio/recebimento de cookies (Refresh Token)
});

// Interceptor para injetar o Access Token em memória
let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// Interceptor para gerenciar renovação automática (Refresh Token) no caso de 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login') {
            originalRequest._retry = true;
            try {
                const { data } = await api.post('/auth/refresh');
                setAccessToken(data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                setAccessToken(null);
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);