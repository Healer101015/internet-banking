import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Wallet } from 'lucide-react';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao conectar ao servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-brand/10 p-3 rounded-full mb-4">
                        <Wallet className="text-brand" size={40} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Acesse sua conta</h1>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-field" placeholder="seu@email.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input-field" placeholder="••••••••" />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary mt-6">
                        {loading ? 'Autenticando...' : 'Entrar na Conta'}
                    </button>
                </form>
            </div>
        </div>
    );
};