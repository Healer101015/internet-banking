import React, { createContext, useState, useEffect, useContext } from 'react';
import { api, setAccessToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSession = async () => {
            try {
                // Tenta renovar o token caso o usuário reabra a aba (o cookie httpOnly faz o trabalho pesado)
                const { data: refreshData } = await api.post('/auth/refresh');
                setAccessToken(refreshData.accessToken);
                const { data: userData } = await api.get('/me');
                setUser(userData);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        loadSession();
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        setAccessToken(data.accessToken);
        setUser(data.user);
    };

    const logout = async () => {
        await api.post('/auth/logout');
        setAccessToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);