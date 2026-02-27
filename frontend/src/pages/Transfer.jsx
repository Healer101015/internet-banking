import React from 'react';
import { useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const Transfer = () => {
    const [toAccountId, setToAccountId] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState({ type: '', msg: '' });
    const navigate = useNavigate();

    const handleTransfer = async (e) => {
        e.preventDefault();
        setStatus({ type: '', msg: '' });

        // Converte o valor em reais (string/float) para centavos (inteiro)
        const amountCents = Math.round(parseFloat(amount.replace(',', '.')) * 100);

        if (amountCents <= 0 || isNaN(amountCents)) {
            return setStatus({ type: 'error', msg: 'Valor inválido.' });
        }

        try {
            await api.post('/transfers', {
                toAccountId: parseInt(toAccountId),
                amountCents,
                description
            });
            setStatus({ type: 'success', msg: 'Transferência enviada com sucesso!' });
            setTimeout(() => navigate('/statement'), 2000);
        } catch (err) {
            // Pega o erro validado pelo backend
            const errorMessage = err.response?.data?.error?.[0]?.message || err.response?.data?.error || 'Erro na transferência.';
            setStatus({ type: 'error', msg: errorMessage });
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Nova Transferência</h2>

            {status.msg && (
                <div className={`p-4 rounded-lg mb-6 ${status.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {status.msg}
                </div>
            )}

            <form onSubmit={handleTransfer} className="space-y-5 max-w-md">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID da Conta de Destino</label>
                    <input type="number" required value={toAccountId} onChange={e => setToAccountId(e.target.value)} className="input-field" placeholder="Ex: 2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                    <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} className="input-field" placeholder="0,00" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (Opcional)</label>
                    <input type="text" maxLength="255" value={description} onChange={e => setDescription(e.target.value)} className="input-field" placeholder="Motivo da transferência" />
                </div>
                <button type="submit" className="btn-primary">Confirmar Transferência</button>
            </form>
        </div>
    );
};