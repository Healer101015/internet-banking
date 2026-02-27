// FILE: frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Crown, Sparkles, Gem, Send, ScrollText, Shield } from 'lucide-react'; // Shield adicionado aqui
import { Link } from 'react-router-dom';

export const Dashboard = () => {
    const [account, setAccount] = useState(null);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const { data } = await api.get('/accounts/balance');
                setAccount(data);
            } catch (err) {
                console.error("Erro ao buscar ouro:", err);
            }
        };
        fetchBalance();
    }, []);

    const formatCurrency = (cents) => {
        return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#3d2c1d]/50 pb-6">
                <div>
                    <p className="text-[#8c7457] font-heading uppercase tracking-[0.3em] text-xs font-bold mb-2 flex items-center gap-2">
                        <Sparkles size={12} /> Saudações, Vassalo
                    </p>
                    <h1 className="text-4xl md:text-5xl font-brand font-black text-gold-gradient tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                        Salão do Tesouro
                    </h1>
                </div>
            </header>

            {/* Baú do Tesouro */}
            <div className="obsidian-card p-10 lg:p-16 relative group">
                <div className="absolute top-0 left-0 w-full h-[3px] gold-sheen opacity-80"></div>
                <div className="engraved-border"></div>

                <div className="absolute top-1/2 right-10 -translate-y-1/2 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-amber-500/20 transition-colors duration-1000"></div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                    <div>
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                            <Gem className="text-[#d95d5d] drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" size={24} />
                            <p className="text-[#a38a6d] font-heading uppercase tracking-[0.3em] text-sm font-bold">Reserva de Ouro Atual</p>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-brand font-black text-gold-gradient drop-shadow-[0_5px_15px_rgba(212,175,55,0.3)] mb-8 tracking-wider">
                            {account ? formatCurrency(account.balance_cents) : 'R$ ---,--'}
                        </h2>
                        <div className="inline-flex items-center gap-5 text-xs bg-[#0a0705]/80 px-5 py-3 rounded-sm border border-[#2a1e14] shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] font-heading uppercase tracking-[0.2em] font-bold">
                            <p className="text-[#7c6a54]">Cofre Nº: <span className='text-[#d4af37]'>{account?.id ? String(account.id).padStart(5, '0') : '...'}</span></p>
                            <span className="text-[#3d2c1d]">|</span>
                            <p className="text-[#6bba84] flex items-center gap-2 drop-shadow-[0_0_5px_rgba(107,186,132,0.5)]"><Shield size={14} /> Selo Ativo</p>
                        </div>
                    </div>

                    <div className="hidden md:flex relative">
                        <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full animate-pulse"></div>
                        <Crown size={120} className="text-[#d4af37] drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] relative z-10 opacity-90" strokeWidth={0.5} />
                    </div>
                </div>
            </div>

            {/* Ações Rápidas */}
            <section>
                <h3 className="text-sm font-heading font-bold mb-6 text-[#8c7457] uppercase tracking-[0.3em] flex items-center gap-3">
                    <ScrollText size={16} className="text-[#d4af37]" /> Decretos Reais
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Link to="/transfer" className="obsidian-card p-8 flex items-center gap-6 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                        <div className="engraved-border opacity-50"></div>
                        <div className="bg-[#1a120b] p-5 rounded-sm border border-[#3d2c1d] group-hover:border-[#d4af37] transition-all">
                            <Send size={32} className="text-[#d4af37]" />
                        </div>
                        <div>
                            <p className="font-heading font-bold text-lg text-[#e1d2bc] group-hover:text-[#d4af37] tracking-widest uppercase">Enviar Caravana</p>
                            <p className="text-xs font-body text-[#7c6a54] mt-2">Transferir ouro para outros cofres.</p>
                        </div>
                    </Link>

                    <Link to="/statement" className="obsidian-card p-8 flex items-center gap-6 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                        <div className="engraved-border opacity-50"></div>
                        <div className="bg-[#1a120b] p-5 rounded-sm border border-[#3d2c1d] group-hover:border-[#d4af37] transition-all">
                            <ScrollText size={32} className="text-[#d4af37]" />
                        </div>
                        <div>
                            <p className="font-heading font-bold text-lg text-[#e1d2bc] group-hover:text-[#d4af37] tracking-widest uppercase">Consultar Tomo</p>
                            <p className="text-xs font-body text-[#7c6a54] mt-2">Verificar o histórico de tributos.</p>
                        </div>
                    </Link>
                </div>
            </section>
        </div>
    );
};