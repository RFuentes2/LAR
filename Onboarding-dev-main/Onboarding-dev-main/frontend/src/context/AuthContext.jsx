import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLogin = async () => {
            const token = localStorage.getItem('eduai_token');
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    if (response.data.success) {
                        setUser(response.data.data.user);
                    } else {
                        localStorage.removeItem('eduai_token');
                    }
                } catch (error) {
                    console.error('Error checking auth:', error);
                    localStorage.removeItem('eduai_token');
                }
            }
            setLoading(false);
        };

        checkLogin();
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.success) {
            const { token, user } = response.data.data;
            localStorage.setItem('eduai_token', token);
            setUser(user);
        }
        return response.data;
    };

    const register = async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.success) {
            const { token, user } = response.data.data;
            localStorage.setItem('eduai_token', token);
            setUser(user);
        }
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('eduai_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
