import React from 'react';
import { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const Settings = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [status, setStatus] = useState({ type: '', msg: '' });
    const { logout } = useAuth();

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/me/change-password', { oldPassword, newPassword });
            setStatus({ type: 'success', msg: data.message });
            setTimeout(() => logout(), 3000); // Força logout após trocar senha
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.error || 'Erro ao alterar senha' });
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Segurança</h2>
            {status.msg && <div className={`p-4 rounded-lg mb-6 ${status.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{status.msg}</div>}

            <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
                    <input type="password" required value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="input-field" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                    <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field" minLength={8} />
                </div>
                <button type="submit" className="btn-primary mt-4">Alterar Senha</button>
            </form>
        </div>
    );
};