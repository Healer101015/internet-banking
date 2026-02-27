import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import {
    Coins,
    ArrowRightLeft,
    ScrollText,
    Settings,
    Crown,
    Shield,
    Sparkles,
    Flame,
    ArrowUpRight,
    ArrowDownLeft
} from "lucide-react";

export const Dashboard = () => {
    const { user } = useAuth();
    const [balance, setBalance] = useState(0);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const balanceCardRef = useRef(null);

    // BUSCA DE DADOS REAIS DO BANCO
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Busca o saldo e descobre qual é o ID da conta do usuário logado
                const balanceRes = await api.get('/accounts/balance');
                const myAccountId = balanceRes.data.id;
                const valorReal = balanceRes.data.balance_cents / 100;
                setBalance(valorReal);

                // 2. Busca o histórico de transações (limitado a 3 para a Dashboard)
                const txRes = await api.get('/transactions?limit=3');

                // 3. Formata os dados para saber se foi Entrada (IN) ou Saída (OUT)
                const formattedTx = txRes.data.data.map(tx => {
                    const isOut = tx.from_account_id === myAccountId;

                    // Formata a data (Ex: "12 nov")
                    const dateObj = new Date(tx.created_at);
                    const formattedDate = dateObj.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short'
                    }).replace('.', '');

                    return {
                        id: tx.id,
                        type: isOut ? 'OUT' : 'IN',
                        amount: tx.amount_cents / 100,
                        // Se não houver descrição, usamos um nome genérico baseado no tipo
                        name: tx.description || (isOut ? 'Moedas Enviadas' : 'Moedas Recebidas'),
                        date: formattedDate
                    };
                });

                setRecentTransactions(formattedTx);

            } catch (error) {
                console.error("Erro ao inspecionar os cofres e pergaminhos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    // Efeito 3D (Parallax)
    const handleMouseMove = (e) => {
        if (!balanceCardRef.current) return;
        const rect = balanceCardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;
        balanceCardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const handleMouseLeave = () => {
        if (balanceCardRef.current) {
            balanceCardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        }
    };

    // Brasas ao fundo
    const embersLayout = useMemo(() => {
        return Array.from({ length: 15 }).map(() => ({
            left: `${Math.random() * 100}%`,
            size: `${Math.random() * 4 + 2}px`,
            delay: `${Math.random() * 5}s`,
            duration: `${Math.random() * 8 + 8}s`,
            blur: Math.random() > 0.5 ? '1px' : '0px',
        }));
    }, []);

    return (
        <div className="relative w-full min-h-full flex flex-col gap-8 font-body selection:bg-amber-700/40 select-none pb-12 pt-4">

            <style>{`
                @keyframes float-slow {
                    0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 0.15; }
                    50% { transform: translate(40px, -30px) rotate(180deg) scale(1.1); opacity: 0.25; }
                    100% { transform: translate(-20px, 20px) rotate(360deg) scale(1); opacity: 0.15; }
                }
                @keyframes metalSheen {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes pulseGlow {
                    0%, 100% { filter: drop-shadow(0 0 15px rgba(212,175,55,0.4)); }
                    50% { filter: drop-shadow(0 0 25px rgba(212,175,55,0.8)); }
                }
                @keyframes emberRise {
                    0% { transform: translateY(100vh) translateX(0) scale(1); opacity: 0; }
                    20% { opacity: 0.8; }
                    80% { opacity: 0.4; }
                    100% { transform: translateY(-10vh) translateX(40px) scale(0.3); opacity: 0; }
                }
                .engraved-border {
                    position: absolute;
                    inset: 8px;
                    border: 1px solid rgba(197,152,62,0.15);
                    pointer-events: none;
                    mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
                }
                .grain-overlay {
                    position: fixed; inset: 0; pointer-events: none; z-index: 5; opacity: 0.12;
                    background-image: repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px);
                    mix-blend-mode: overlay;
                }
            `}</style>

            <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1] fixed">
                <div className="absolute magic-mist bg-amber-600/15 w-[800px] h-[800px] -top-40 -right-40 blur-[120px]" style={{ animation: "float-slow 35s infinite linear" }} />
                <div className="absolute magic-mist bg-red-900/15 w-[600px] h-[600px] bottom-[-100px] left-[-100px] blur-[120px]" style={{ animation: "float-slow 28s infinite reverse linear" }} />

                {embersLayout.map((e, i) => (
                    <div key={i} className="absolute bottom-[-20px] bg-[#ff6600] rounded-full z-[0] shadow-[0_0_10px_#ff3300,0_0_20px_#ff9900]"
                        style={{ left: e.left, width: e.size, height: e.size, filter: `blur(${e.blur})`, animation: `emberRise ${e.duration} linear ${e.delay} infinite` }}
                    />
                ))}
            </div>
            <div className="grain-overlay" />

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#36291d]/50 pb-6 relative z-10">
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-amber-600/0 via-amber-600/50 to-amber-600/0"></div>

                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-[#100d0a] border-2 border-[#8f724e] shadow-[0_0_20px_rgba(212,175,55,0.25)] flex items-center justify-center relative group">
                        <div className="absolute inset-0 rounded-full border border-amber-500/30 animate-[spin_10s_linear_infinite] group-hover:border-amber-500/80 transition-colors"></div>
                        <Crown size={30} className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-800 border-2 border-[#100d0a] rounded-full shadow-[0_0_8px_#22c55e] z-10"></div>
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-brand font-black bg-gradient-to-r from-[#fff2cc] via-[#d4af37] to-[#8a631c] bg-clip-text text-transparent tracking-widest uppercase">
                            Cofre Pessoal
                        </h1>
                        <p className="text-[#9c8466] font-heading tracking-[0.2em] text-[12px] mt-1 uppercase">
                            Saudações, Cavaleiro <span className="text-[#d4af37] font-bold">{user?.name?.split(' ')[0] || 'Aventureiro'}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-[#1a140f]/80 px-4 py-2 rounded-sm border border-[#36291d] shadow-inner text-[#9c8466] font-heading text-[10px] tracking-[0.2em] uppercase backdrop-blur-sm">
                    <Shield size={14} className="text-amber-600/70" />
                    Selo de Segurança Ativo
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">

                <div className="lg:col-span-2 flex flex-col gap-6">

                    <div
                        ref={balanceCardRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        className="relative group transition-transform duration-200 ease-out"
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#d4af37]/30 via-transparent to-red-600/20 rounded-lg blur-lg opacity-40 group-hover:opacity-70 transition duration-700"></div>

                        <div className="bg-[#0c0907]/95 rounded-lg border border-[#36291d] shadow-[0_30px_60px_rgba(0,0,0,0.9),inset_0_2px_2px_rgba(255,255,255,0.05)] relative backdrop-blur-md p-10 overflow-hidden min-h-[280px] flex flex-col justify-between">

                            <div className="absolute -right-20 -top-20 w-80 h-80 border-[0.5px] border-amber-500/10 rounded-full border-dashed animate-[spin_60s_linear_infinite] pointer-events-none"></div>
                            <div className="absolute -right-10 -top-10 w-60 h-60 border-[0.5px] border-amber-500/5 rounded-full animate-[spin_40s_linear_infinite_reverse] pointer-events-none"></div>

                            <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: "linear-gradient(90deg, #1c1611, #8f724e, #1c1611, #8f724e, #1c1611)", backgroundSize: "200% 100%", animation: "metalSheen 6s infinite ease-in-out" }} />
                            <div className="engraved-border" />

                            <div className="relative z-10" style={{ transform: 'translateZ(30px)' }}>
                                <div className="flex items-center gap-3 mb-6 text-[#a68a61] font-heading font-bold uppercase tracking-[0.3em] text-[12px]">
                                    <Coins size={18} className="text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
                                    Reserva Real
                                </div>

                                {loading ? (
                                    <div className="flex items-center gap-4 py-4">
                                        <Sparkles className="animate-spin text-amber-500/50" size={36} />
                                        <span className="text-3xl font-brand text-amber-500/50 animate-pulse tracking-widest">Avaliando...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-baseline gap-2 py-2" style={{ animation: 'pulseGlow 4s infinite ease-in-out' }}>
                                        <span className="text-6xl md:text-7xl font-brand font-black bg-gradient-to-b from-[#ffffff] via-[#f7d683] to-[#b8860b] bg-clip-text text-transparent tracking-wider drop-shadow-lg">
                                            {formatCurrency(balance)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="relative z-10 mt-8 flex flex-col sm:flex-row gap-4" style={{ transform: 'translateZ(20px)' }}>
                                <Link to="/transfer" className="flex-1 px-6 py-4 bg-gradient-to-b from-[#2a1f16] to-[#140e0a] border border-[#523d24] hover:border-[#d4af37] text-[#e1d2bc] hover:text-[#fff] font-heading text-[12px] uppercase tracking-[0.25em] rounded-sm transition-all duration-300 flex justify-center items-center gap-3 shadow-[0_5px_15px_rgba(0,0,0,0.8)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] group/btn">
                                    <ArrowRightLeft size={16} className="text-amber-500 group-hover/btn:rotate-180 transition-transform duration-500" />
                                    Forjar Transferência
                                </Link>
                                <Link to="/statement" className="px-6 py-4 bg-[#0a0806]/80 border border-[#2a2016] hover:border-[#8f724e] text-[#9c8466] hover:text-[#d4af37] font-heading text-[12px] uppercase tracking-[0.25em] rounded-sm transition-all duration-300 flex justify-center items-center gap-3 hover:bg-[#14100c]">
                                    <ScrollText size={16} />
                                    Ver Pergaminhos
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#100d0a]/80 rounded-lg border border-[#36291d] p-6 backdrop-blur-sm relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-600/50 to-transparent"></div>
                        <h3 className="text-[11px] font-heading font-bold text-[#8c7457] uppercase tracking-[0.3em] mb-6 pl-2 flex items-center gap-2">
                            <HistoryIcon size={14} className="text-amber-600/70" /> Últimos Feitos
                        </h3>

                        <div className="flex flex-col gap-3">
                            {loading ? (
                                <p className="text-[#786149] text-xs font-heading uppercase text-center py-4">Lendo pergaminhos...</p>
                            ) : recentTransactions.length > 0 ? (
                                recentTransactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-sm bg-[#17120e] border border-[#2a2016] hover:border-[#4a3826] transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'IN' ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}>
                                                {tx.type === 'IN' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                            </div>
                                            <div>
                                                <p className="text-[#d4af37] font-heading text-sm tracking-wider">{tx.name}</p>
                                                <p className="text-[#786149] font-body text-xs">{tx.date}</p>
                                            </div>
                                        </div>
                                        <span className={`font-brand font-bold tracking-widest ${tx.type === 'IN' ? 'text-green-400' : 'text-red-400'}`}>
                                            {tx.type === 'IN' ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[#786149] text-xs font-heading uppercase text-center py-4">Nenhum feito registrado neste cofre.</p>
                            )}
                        </div>
                    </div>

                </div>

                <div className="lg:col-span-1 flex flex-col gap-5">
                    <h2 className="text-[11px] font-heading font-bold text-[#8c7457] uppercase tracking-[0.3em] pl-2 flex items-center gap-2 drop-shadow-md">
                        <Flame size={14} className="text-amber-600" /> Ordens do Rei
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                        <QuickActionButton
                            to="/transfer"
                            icon={ArrowRightLeft}
                            title="Transferência"
                            desc="Envie ouro a aliados"
                        />
                        <QuickActionButton
                            to="/statement"
                            icon={ScrollText}
                            title="Pergaminhos"
                            desc="Histórico detalhado"
                        />
                        <QuickActionButton
                            to="/settings"
                            icon={Settings}
                            title="Ajustes Rúnicos"
                            desc="Forje sua conta"
                        />
                    </div>

                    <div className="mt-auto pt-6 border-t border-[#36291d]/50">
                        <div className="bg-gradient-to-br from-[#1c140d] to-[#0a0806] rounded-sm border border-[#36291d] p-5 text-center relative overflow-hidden group">
                            <div className="absolute -inset-10 bg-amber-600/10 blur-2xl group-hover:bg-amber-600/20 transition-colors duration-700"></div>
                            <Shield size={24} className="text-[#8c7457] mx-auto mb-3 opacity-50 group-hover:opacity-100 group-hover:text-amber-500 transition-all duration-500" />
                            <p className="text-[#786149] font-heading text-[9px] uppercase tracking-[0.3em] relative z-10 leading-relaxed">
                                "Que a honra guie sua espada e o ouro encha seus cofres."
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

const HistoryIcon = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" /><path d="M12 7v5l4 2" />
    </svg>
);

const QuickActionButton = ({ to, icon: Icon, title, desc }) => (
    <Link to={to} className="group relative bg-[#0f0c09]/90 border border-[#2a2016] hover:border-[#8f724e] rounded-lg p-5 flex items-center gap-4 transition-all duration-300 overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.8)] backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/0 via-amber-600/10 to-amber-600/0 -translate-x-full group-hover:translate-x-full transition-transform duration-[800ms] ease-in-out"></div>

        <div className="w-14 h-14 rounded-md bg-gradient-to-br from-[#1c1611] to-[#0a0806] border border-[#36291d] group-hover:border-[#d4af37]/60 flex items-center justify-center transition-all duration-300 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] relative">
            <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/10 transition-colors duration-300 rounded-md"></div>
            <Icon size={22} className="text-[#a68a61] group-hover:text-amber-400 transition-colors drop-shadow-[0_0_5px_rgba(212,175,55,0)] group-hover:drop-shadow-[0_0_10px_rgba(212,175,55,0.8)] relative z-10" />
        </div>

        <div className="relative z-10">
            <h3 className="font-heading font-bold text-[#d4af37] text-[13px] uppercase tracking-[0.2em] mb-1 group-hover:translate-x-1 transition-transform">{title}</h3>
            <p className="font-body text-[#786149] text-[11px] group-hover:text-[#a68a61] transition-colors">{desc}</p>
        </div>
    </Link>
);