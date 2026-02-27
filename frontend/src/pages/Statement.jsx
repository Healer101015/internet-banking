import React from 'react';
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const Statement = () => {
    const [transactions, setTransactions] = useState([]);
    const [myAccountId, setMyAccountId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const accRes = await api.get('/accounts/balance');
            setMyAccountId(accRes.data.id);
            const txRes = await api.get('/transactions');
            setTransactions(txRes.data.data);
        };
        fetchData();
    }, []);

    const formatCurrency = (cents) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatDate = (dateString) => new Date(dateString).toLocaleString('pt-BR');

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-slate-800">Extrato de Movimentações</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-sm">
                            <th className="p-4 font-medium">Data</th>
                            <th className="p-4 font-medium">Descrição</th>
                            <th className="p-4 font-medium">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(tx => {
                            const isOut = tx.from_account_id === myAccountId;
                            return (
                                <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-sm text-gray-600">{formatDate(tx.created_at)}</td>
                                    <td className="p-4">
                                        <p className="font-medium text-gray-800">{tx.description || 'Transferência'}</p>
                                        <p className="text-xs text-gray-400">
                                            {isOut ? `Para conta: ${tx.to_account_id}` : `De conta: ${tx.from_account_id}`}
                                        </p>
                                    </td>
                                    <td className="p-4">
                                        <span className={`flex items-center gap-1 font-semibold ${isOut ? 'text-red-500' : 'text-green-500'}`}>
                                            {isOut ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                            {formatCurrency(tx.amount_cents)}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        {transactions.length === 0 && (
                            <tr><td colSpan="3" className="p-8 text-center text-gray-400">Nenhuma movimentação encontrada.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};