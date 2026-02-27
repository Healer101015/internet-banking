import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import {
    Store, Sparkles, FlaskConical, Scroll, Gem,
    BookOpen, Shield, ArrowLeft, PackageOpen
} from "lucide-react";
import { Link } from "react-router-dom";

// O Catálogo do Mercado (Itens fictícios que simulam serviços)
const MARKET_ITEMS = [
    { id: 1, name: "Poção de Vida (500ml)", desc: "Recarga de Comunicação (Telemóvel)", icon: "FlaskConical", price: 15.00, color: "text-red-500" },
    { id: 2, name: "Pergaminho de Teletransporte", desc: "Vale-Transporte Mágico (Uber/Cabify)", icon: "Scroll", price: 50.00, color: "text-blue-400" },
    { id: 3, name: "Baú de Gemas Brilhantes", desc: "Créditos de Entretenimento (Steam/PSN)", icon: "Gem", price: 100.00, color: "text-purple-400" },
    { id: 4, name: "Elixir do Conhecimento", desc: "Vale-Livro ou Cursos na Guilda", icon: "BookOpen", price: 30.00, color: "text-amber-400" }
];

export const Market = () => {
    const [balance, setBalance] = useState(0);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionMsg, setActionMsg] = useState({ text: "", type: "" });

    const fetchMarketData = async () => {
        try {
            const balanceRes = await api.get('/accounts/balance');
            setBalance(balanceRes.data.balance_cents / 100);

            const invRes = await api.get('/inventory');
            setInventory(invRes.data);
        } catch (error) {
            console.error("Erro ao carregar mercado:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketData();
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const handleBuyItem = async (item) => {
        try {
            setActionMsg({ text: "Negociando...", type: "loading" });
            const response = await api.post('/market/buy', {
                itemName: item.name,
                itemDescription: item.desc,
                iconName: item.icon,
                priceCents: item.price * 100
            });

            setActionMsg({ text: response.data.message, type: "success" });
            fetchMarketData(); // Atualiza o saldo e o inventário

            setTimeout(() => setActionMsg({ text: "", type: "" }), 4000);
        } catch (error) {
            setActionMsg({
                text: error.response?.data?.error || "A barganha falhou.",
                type: "error"
            });
            setTimeout(() => setActionMsg({ text: "", type: "" }), 4000);
        }
    };

    const getIconComponent = (iconName, colorClass) => {
        const props = { size: 28, className: `${colorClass} drop-shadow-lg` };
        switch (iconName) {
            case 'FlaskConical': return <FlaskConical {...props} />;
            case 'Scroll': return <Scroll {...props} />;
            case 'Gem': return <Gem {...props} />;
            case 'BookOpen': return <BookOpen {...props} />;
            default: return <Sparkles {...props} />;
        }
    };

    return (
        <div className="relative w-full min-h-full flex flex-col gap-6 font-body selection:bg-purple-700/40 select-none pb-12 pt-4">

            {/* Fundo Atmosférico do Mercado (Tons de Roxo) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1] fixed">
                <div className="absolute bg-purple-900/10 w-[800px] h-[800px] -top-40 -left-40 blur-[150px]" />
                <div className="absolute bg-amber-900/10 w-[600px] h-[600px] bottom-[-100px] right-[-100px] blur-[120px]" />
            </div>

            {/* CABEÇALHO DO MERCADO */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#36291d]/50 pb-4 relative z-10">
                <div className="flex items-center gap-5">
                    <Link to="/dashboard" className="p-3 bg-[#100d0a] border border-[#36291d] rounded-md hover:border-purple-500/50 transition-colors group">
                        <ArrowLeft size={20} className="text-[#9c8466] group-hover:text-purple-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-brand font-black bg-gradient-to-r from-[#e6c1ff] via-[#a855f7] to-[#4c1d95] bg-clip-text text-transparent tracking-widest uppercase flex items-center gap-3">
                            <Store size={28} className="text-purple-500" /> Mercado Clandestino
                        </h1>
                        <p className="text-[#9c8466] font-heading tracking-[0.2em] text-[10px] uppercase mt-1">
                            Barganhe o seu ouro por relíquias
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-[#100d0a]/80 px-5 py-3 rounded-lg border border-[#36291d] shadow-inner backdrop-blur-sm">
                    <div className="text-right">
                        <span className="block text-[9px] font-heading text-[#786149] uppercase tracking-widest">Ouro Disponível</span>
                        <span className="font-brand font-bold text-amber-400 text-lg tracking-wider">
                            {loading ? '...' : formatCurrency(balance)}
                        </span>
                    </div>
                </div>
            </header>

            {/* MENSAGEM DE AÇÃO */}
            {actionMsg.text && (
                <div className={`p-4 border rounded-md font-heading uppercase tracking-widest text-[11px] text-center backdrop-blur-md animate-pulse ${actionMsg.type === 'error' ? 'bg-red-950/50 border-red-900 text-red-400' : actionMsg.type === 'success' ? 'bg-green-950/50 border-green-900 text-green-400' : 'bg-purple-950/50 border-purple-900 text-purple-400'}`}>
                    {actionMsg.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 mt-4">

                {/* PRATELEIRAS DO MERCADO (Loja) */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-[12px] font-heading font-bold text-[#a855f7] uppercase tracking-[0.3em] flex items-center gap-2 drop-shadow-md">
                        <Sparkles size={16} /> Relíquias à Venda
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {MARKET_ITEMS.map((item) => (
                            <div key={item.id} className="bg-[#0c0907]/90 border border-[#2a2016] hover:border-purple-500/50 rounded-lg p-5 flex flex-col items-center text-center gap-3 transition-all duration-300 group shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                                <div className="w-16 h-16 rounded-full bg-[#17120e] border border-[#36291d] group-hover:border-purple-500/50 flex items-center justify-center transition-colors shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]">
                                    {getIconComponent(item.icon, item.color)}
                                </div>
                                <div>
                                    <h3 className="font-heading font-bold text-[#d4af37] text-[12px] uppercase tracking-[0.1em]">{item.name}</h3>
                                    <p className="font-body text-[#786149] text-[10px] mt-1">{item.desc}</p>
                                </div>
                                <div className="w-full mt-2">
                                    <button
                                        onClick={() => handleBuyItem(item)}
                                        className="w-full py-2.5 bg-gradient-to-r from-purple-900/40 to-[#140e0a] border border-purple-900/50 hover:border-purple-400 text-purple-300 hover:text-white font-heading text-[10px] uppercase tracking-[0.2em] rounded-sm transition-all shadow-md group-hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                                    >
                                        Comprar por {formatCurrency(item.price)}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* INVENTÁRIO DO JOGADOR */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-[12px] font-heading font-bold text-[#8c7457] uppercase tracking-[0.3em] flex items-center gap-2 drop-shadow-md">
                        <PackageOpen size={16} className="text-amber-600" /> A sua Mochila
                    </h2>

                    <div className="bg-[#100d0a]/80 rounded-lg border border-[#36291d] p-6 backdrop-blur-sm min-h-[300px] shadow-xl">
                        {loading ? (
                            <p className="text-[#786149] text-xs font-heading uppercase text-center py-10">Vasculhando a mochila...</p>
                        ) : inventory.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto hide-scrollbar pr-2">
                                {inventory.map((invItem) => (
                                    <div key={invItem.id} className="flex items-center gap-4 p-3 rounded-md bg-[#17120e] border border-[#2a2016]">
                                        <div className="w-10 h-10 rounded-full bg-black/50 border border-[#36291d] flex items-center justify-center">
                                            {getIconComponent(invItem.icon_name, "text-amber-500")}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[#e1d2bc] font-heading text-[11px] uppercase tracking-wider">{invItem.item_name}</p>
                                            <p className="text-[#786149] font-body text-[10px]">{invItem.item_description}</p>
                                        </div>
                                        <div className="text-right">
                                            <Shield size={14} className="text-green-600/50 inline-block mb-1" />
                                            <p className="text-[9px] text-[#5e4b36] font-heading uppercase">Guardado</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50 py-10">
                                <PackageOpen size={48} className="text-[#36291d]" />
                                <p className="text-[#786149] text-[10px] font-heading uppercase tracking-widest text-center">
                                    A sua mochila está vazia.<br />Gaste o seu ouro para enchê-la.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};