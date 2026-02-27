import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const Dashboard = () => {
    const [account, setAccount] = useState(null);

    useEffect(() => {
        const fetchBalance = async () => {
            const { data } = await api.get('/accounts/balance');
            setAccount(data);
        };
        fetchBalance();
    }, []);

    const formatCurrency = (cents) => {
        return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Visão Geral</h1>
            <div className="bg-brand text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-brand-light font-medium mb-1">Saldo Disponível</p>
                    <h2 className="text-4xl font-bold">
                        {account ? formatCurrency(account.balance_cents) : 'R$ ---,--'}
                    </h2>
                    <p className="mt-4 text-sm opacity-80">Conta: {account?.id ? String(account.id).padStart(5, '0') : '...'}</p>
                </div>
                {/* Background decoration */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            </div>
        </div>
    );
};