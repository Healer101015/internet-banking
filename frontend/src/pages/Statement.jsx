import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BookOpen, Sword, ShieldAlert } from 'lucide-react';

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
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end gap-6 mb-10 border-b border-[#3d2c1d]/50 pb-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-amber-500/10 blur-xl rounded-full"></div>
                    <BookOpen className="text-[#d4af37] drop-shadow-[0_0_10px_rgba(212,175,55,0.5)] relative z-10" size={56} strokeWidth={1.2} />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-brand font-black text-gold-gradient tracking-widest uppercase drop-shadow-lg">Tomo de Registros</h1>
                    <p className="text-[#8c7457] font-heading uppercase tracking-[0.2em] text-xs mt-3">Histórico das movimentações do cofre.</p>
                </div>
            </header>

            <div className="obsidian-card overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] gold-sheen opacity-60"></div>
                <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#080503] border-b-2 border-[#3d2c1d] text-[#a38a6d] font-heading uppercase tracking-[0.2em] text-[10px]">
                                <th className="p-6 font-bold">Data do Éden</th>
                                <th className="p-6 font-bold">Escrito no Pergaminho</th>
                                <th className="p-6 font-bold text-right">Ouro Movimentado</th>
                            </tr>
                        </thead>
                        <tbody className="bg-[#100d0a]/50 text-[#e1d2bc] font-body">
                            {transactions.map(tx => {
                                const isOut = tx.from_account_id === myAccountId;
                                return (
                                    <tr key={tx.id} className="border-b border-[#2a1e14] hover:bg-[#1f160e] transition-colors">
                                        <td className="p-6 text-sm text-[#8c7457]">{formatDate(tx.created_at)}</td>
                                        <td className="p-6">
                                            <p className="font-bold font-heading text-lg tracking-wide text-[#f3e8d3]">{tx.description || 'Tributo Não Especificado'}</p>
                                            <p className="text-[10px] text-[#5c4a35] font-bold font-heading uppercase tracking-[0.2em] mt-2">
                                                {isOut ? `Para cofre nº: ${tx.to_account_id}` : `Do cofre nº: ${tx.from_account_id}`}
                                            </p>
                                        </td>
                                        <td className="p-6 text-right">
                                            <span className={`inline-flex items-center justify-end gap-3 font-brand font-black text-xl tracking-wider ${isOut ? 'text-[#d95d5d] drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]' : 'text-[#6bba84] drop-shadow-[0_0_8px_rgba(107,186,132,0.4)]'}`}>
                                                {isOut ? <Sword size={20} /> : <ShieldAlert size={20} className="rotate-180" />}
                                                {isOut ? '-' : '+'}{formatCurrency(tx.amount_cents)}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {transactions.length === 0 && (
                                <tr><td colSpan="3" className="p-16 text-center text-[#5c4a35] font-heading font-bold text-sm tracking-widest uppercase">As páginas deste tomo estão vazias.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};