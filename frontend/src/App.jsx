import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Transfer } from './pages/Transfer';
import { Statement } from './pages/Statement';
import { Settings } from './pages/Settings';
import { Market } from './pages/Market'; // <-- IMPORTAÇÃO AQUI

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="transfer" element={<Transfer />} />
                        <Route path="statement" element={<Statement />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="market" element={<Market />} /> {/* <-- NOVA ROTA AQUI */}
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}