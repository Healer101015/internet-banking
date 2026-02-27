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
    Sparkles,
    Flame,
    ArrowUpRight,
    ArrowDownLeft,
    Target,
    TrendingUp,
    Users,
    Bird,
    Pickaxe,
    CheckCheck,
    Bell,
} from "lucide-react";

export const Dashboard = () => {
    const { user } = useAuth();
    const balanceCardRef = useRef(null);
    const notificationsRef = useRef(null);

    // Estados Reais
    const [balance, setBalance] = useState(0);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [lairBalance, setLairBalance] = useState(0);
    const [missions, setMissions] = useState([]);
    const [guild, setGuild] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados da Taverna
    const [tributeLoading, setTributeLoading] = useState(false);
    const [earnedAmount, setEarnedAmount] = useState(null);
    const [cooldownMessage, setCooldownMessage] = useState("");

    // Estados dos Corvos
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const unreadCount = notifications.filter((n) => !n.is_read).length;

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const balanceRes = await api.get("/accounts/balance");
                const myAccountId = balanceRes.data.id;
                setBalance(balanceRes.data.balance_cents / 100);

                const txRes = await api.get("/transactions?limit=3");
                const formattedTx = txRes.data.data.map((tx) => {
                    const isOut = tx.from_account_id === myAccountId;
                    const dateObj = new Date(tx.created_at);
                    return {
                        id: tx.id,
                        type: isOut ? "OUT" : "IN",
                        amount: tx.amount_cents / 100,
                        name:
                            tx.description || (isOut ? "Moedas Enviadas" : "Moedas Recebidas"),
                        date: dateObj
                            .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
                            .replace(".", ""),
                    };
                });
                setRecentTransactions(formattedTx);

                const rpgRes = await api.get("/dashboard/rpg-data");
                setLairBalance(rpgRes.data.lairBalance / 100);
                setMissions(rpgRes.data.missions);
                setGuild(rpgRes.data.guild);

                fetchNotifications();
            } catch (error) {
                console.error("Erro ao inspecionar os cofres:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();

        const handleClickOutside = (event) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const notifRes = await api.get("/notifications");
            setNotifications(notifRes.data);
        } catch (error) {
            console.error("Erro ao buscar notificações:", error);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const handleEarnMoney = async () => {
        setTributeLoading(true);
        setCooldownMessage("");
        try {
            const response = await api.post("/accounts/tribute");
            const ganhoReal = response.data.earned_cents / 100;

            setEarnedAmount(ganhoReal);
            setBalance(response.data.new_balance / 100);

            const dateObj = new Date();
            setRecentTransactions((prev) =>
                [
                    {
                        id: Date.now(),
                        type: "IN",
                        amount: ganhoReal,
                        name: "Tributos da Taverna",
                        date: dateObj
                            .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
                            .replace(".", ""),
                    },
                    ...prev,
                ].slice(0, 3)
            );

            setNotifications((prev) => [
                {
                    id: Date.now(),
                    title: "Trabalho Concluído",
                    message: `A taverna pagou-lhe ${formatCurrency(ganhoReal)}.`,
                    is_read: false,
                },
                ...prev,
            ]);

            setTimeout(() => setEarnedAmount(null), 3000);
        } catch (error) {
            if (error.response?.status === 429) {
                setCooldownMessage(error.response.data.error);
                setTimeout(() => setCooldownMessage(""), 5000);
            } else {
                setCooldownMessage("A taverna está fechada no momento.");
            }
        } finally {
            setTributeLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
        } catch (error) {
            console.error(error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put("/notifications/read-all");
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            setShowNotifications(false);
        } catch (error) {
            console.error(error);
        }
    };

    // Parallax MAIS SUAVE (sem tremedeira)
    const handleMouseMove = (e) => {
        if (!balanceCardRef.current || window.innerWidth < 1024) return;
        const rect = balanceCardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -2.5;
        const rotateY = ((x - centerX) / centerX) * 2.5;

        balanceCardRef.current.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
    };

    const handleMouseLeave = () => {
        if (balanceCardRef.current)
            balanceCardRef.current.style.transform =
                "perspective(1200px) rotateX(0deg) rotateY(0deg)";
    };

    // Brasas ao fundo
    const embersLayout = useMemo(
        () =>
            Array.from({ length: 22 }).map(() => ({
                left: `${Math.random() * 100}%`,
                size: `${Math.random() * 4 + 2}px`,
                delay: `${Math.random() * 5}s`,
                duration: `${Math.random() * 8 + 10}s`,
                blur: Math.random() > 0.55 ? "1px" : "0px",
            })),
        []
    );

    return (
        <div className="relative w-full min-h-screen bg-[#050403] flex flex-col font-body selection:bg-amber-700/40 select-none overflow-x-hidden">
            {/* DESIGN SYSTEM LOCAL (tokens + classes) */}
            <style>{`
        :root{
          --bg:#050403;

          --panel: rgba(12,9,7,.80);
          --panel2: rgba(16,13,10,.72);
          --panel3: rgba(23,18,14,.64);

          --stroke: rgba(54,41,29,.85);
          --stroke2: rgba(74,56,38,.65);
          --stroke3: rgba(143,114,78,.55);

          --gold:#d4af37;
          --gold2:#f7d683;
          --gold3:#8a631c;

          --muted: rgba(156,132,102,.95);
          --muted2: rgba(120,97,73,.95);

          --shadow: 0 30px 90px rgba(0,0,0,.92);
        }

        @keyframes float-slow {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: .12; }
          50% { transform: translate(40px, -40px) rotate(180deg) scale(1.08); opacity: .22; }
          100% { transform: translate(-20px, 20px) rotate(360deg) scale(1); opacity: .12; }
        }
        @keyframes metalSheen {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes emberRise {
          0% { transform: translateY(110vh) translateX(0) scale(1); opacity: 0; }
          15% { opacity: .85; }
          70% { opacity: .35; }
          100% { transform: translateY(-10vh) translateX(40px) scale(.35); opacity: 0; }
        }
        @keyframes spinSlow { 100% { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes spinSlowReverse { 100% { transform: translate(-50%, -50%) rotate(-360deg); } }
        @keyframes floatUpFade { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-42px) scale(1.1); opacity: 0; } }

        .grain-overlay {
          position: fixed; inset: 0; pointer-events: none; z-index: 1; opacity: 0.10;
          background-image: repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px);
          mix-blend-mode: overlay;
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .rune-ring {
          position: fixed; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }

        .card {
          background: var(--panel);
          border: 1px solid var(--stroke);
          border-radius: 16px;
          box-shadow: var(--shadow), inset 0 1px 0 rgba(255,255,255,.04);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .card-soft {
          background: var(--panel2);
          border: 1px solid var(--stroke);
          border-radius: 16px;
          box-shadow: 0 16px 40px rgba(0,0,0,.70), inset 0 1px 0 rgba(255,255,255,.03);
          backdrop-filter: blur(12px);
        }

        .metal-edge {
          position:absolute; top:0; left:0; width:100%; height:2px;
          background: linear-gradient(90deg, #1c1611, #8f724e, #1c1611);
          background-size: 200% 100%;
          animation: metalSheen 6s infinite ease-in-out;
          opacity: .9;
        }

        .engraved-border {
          position:absolute; inset: 10px;
          border: 1px solid rgba(197,152,62,0.14);
          pointer-events:none;
          mask-image: linear-gradient(to bottom, transparent, black 14%, black 86%, transparent);
        }

        .btn-press {
          transition: transform .15s ease, box-shadow .2s ease, border-color .2s ease, background .2s ease;
          box-shadow: 0 10px 25px rgba(0,0,0,.65), inset 0 1px 0 rgba(255,255,255,.04);
        }
        .btn-press:hover { transform: translateY(-1px); }
        .btn-press:active { transform: translateY(2px); box-shadow: 0 6px 14px rgba(0,0,0,.65), inset 0 1px 0 rgba(255,255,255,.04); }

        .pill {
          border: 1px solid rgba(143,114,78,.55);
          background: rgba(16,13,10,.70);
          border-radius: 999px;
        }

        .title-gold {
          background: linear-gradient(90deg, #fff2cc, var(--gold), var(--gold3));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
      `}</style>

            {/* FUNDO CINEMATOGRÁFICO */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div
                    className="rune-ring w-[760px] h-[760px] border border-amber-500/5 border-t-amber-500/25"
                    style={{ animation: "spinSlow 70s linear infinite" }}
                />
                <div
                    className="rune-ring w-[1120px] h-[1120px] border border-red-500/5 border-b-red-500/15"
                    style={{ animation: "spinSlowReverse 110s linear infinite" }}
                />

                <div
                    className="absolute bg-amber-600/10 w-[600px] h-[600px] -top-40 -right-40 blur-[130px]"
                    style={{ animation: "float-slow 35s infinite linear" }}
                />
                <div
                    className="absolute bg-red-900/10 w-[520px] h-[520px] bottom-[-120px] left-[-120px] blur-[130px]"
                    style={{ animation: "float-slow 32s infinite reverse linear" }}
                />

                {embersLayout.map((e, i) => (
                    <div
                        key={i}
                        className="absolute bottom-[-20px] bg-[#ff6600] rounded-full z-[0]"
                        style={{
                            left: e.left,
                            width: e.size,
                            height: e.size,
                            filter: `blur(${e.blur})`,
                            boxShadow: "0 0 10px rgba(255,51,0,.55), 0 0 18px rgba(255,153,0,.35)",
                            animation: `emberRise ${e.duration} linear ${e.delay} infinite`,
                        }}
                    />
                ))}
            </div>

            <div className="grain-overlay" />

            {/* CONTEÚDO */}
            <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-8 pb-12 pt-6 px-4 sm:px-6">
                {/* CABEÇALHO (mais limpo) */}
                <header className="relative pb-5 border-b border-[#36291d]/60">
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-amber-600/0 via-amber-600/40 to-amber-600/0" />

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#100d0a] border-2 border-[#8f724e] shadow-[0_0_22px_rgba(212,175,55,0.22)] flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-[spin_12s_linear_infinite]" />
                                <Crown
                                    size={26}
                                    className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.55)]"
                                />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-800 border-2 border-[#100d0a] rounded-full shadow-[0_0_8px_#22c55e]" />
                            </div>

                            <div className="min-w-0">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-brand font-black title-gold tracking-widest uppercase truncate drop-shadow-md">
                                    Cofre Pessoal
                                </h1>
                                <p className="text-[9px] sm:text-[10px] font-heading uppercase tracking-[0.22em] mt-1 truncate text-[#9c8466]">
                                    Saudações,{" "}
                                    <span className="text-[#d4af37] font-bold">
                                        {user?.name?.split(" ")[0] || "Aventureiro"}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Notificações */}
                        <div className="relative flex-shrink-0" ref={notificationsRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`relative p-3 rounded-full border transition-all duration-300 btn-press ${showNotifications
                                        ? "bg-amber-900/30 border-amber-600"
                                        : "bg-[#100d0a]/80 border-[#36291d] hover:border-amber-600/50 backdrop-blur-sm"
                                    }`}
                                aria-label="Notificações"
                            >
                                <Bird
                                    size={20}
                                    className={`transition-colors duration-300 ${unreadCount > 0
                                            ? "text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.75)]"
                                            : "text-[#8c7457]"
                                        }`}
                                />
                                {unreadCount > 0 && (
                                    <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-60" />
                                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 border border-[#100d0a] text-[8px] font-bold text-white items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    </div>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 max-h-96 card overflow-hidden z-50 origin-top-right">
                                    <div className="metal-edge" />
                                    <div className="engraved-border" />

                                    <div className="p-4 border-b border-[#36291d] flex justify-between items-center bg-[#17120e]/55">
                                        <h3 className="font-heading font-bold text-[#d4af37] text-[11px] uppercase tracking-widest flex items-center gap-2">
                                            <Bell size={14} /> Corvos Mensageiros
                                        </h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                className="text-[#786149] hover:text-amber-500 transition-colors"
                                                title="Dispensar todos"
                                            >
                                                <CheckCheck size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="overflow-y-auto flex-1 hide-scrollbar p-3 gap-2 flex flex-col">
                                        {notifications.length > 0 ? (
                                            notifications.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                                                    className={`p-3 rounded-lg border transition-all ${notif.is_read
                                                            ? "bg-[#14100c]/70 border-[#2a2016] opacity-70"
                                                            : "bg-gradient-to-r from-[#1c140d] to-[#0c0907] border-amber-900/45 hover:border-amber-600 cursor-pointer shadow-[inset_0_0_18px_rgba(212,175,55,0.05)]"
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4
                                                            className={`font-heading text-[10px] uppercase tracking-wider ${notif.is_read
                                                                    ? "text-[#a68a61]"
                                                                    : "text-amber-400 font-bold drop-shadow-md"
                                                                }`}
                                                        >
                                                            {notif.title}
                                                        </h4>
                                                        {!notif.is_read && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444] mt-1" />
                                                        )}
                                                    </div>
                                                    <p className="text-[#8c7457] font-body text-[11px] leading-relaxed">
                                                        {notif.message}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-10 opacity-55">
                                                <Bird size={32} className="mb-2 text-[#5e4b36]" />
                                                <p className="text-[#786149] font-heading text-[10px] uppercase tracking-widest">
                                                    Nenhuma mensagem.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ESQUERDA */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        {/* CARTÃO PRINCIPAL */}
                        <div
                            ref={balanceCardRef}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            className="relative group transition-transform duration-200 ease-out z-20"
                            style={{ transformStyle: "preserve-3d", willChange: "transform" }}
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#d4af37]/25 via-transparent to-red-600/18 rounded-[18px] blur-xl opacity-40 group-hover:opacity-65 transition duration-700" />
                            <div className="relative card p-8 md:p-12 overflow-hidden min-h-[230px] flex flex-col justify-between">
                                <div className="metal-edge" />
                                <div className="engraved-border" />

                                <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-[#1f1812] shadow-[inset_0_1px_1px_rgba(255,255,255,0.10),0_2px_6px_rgba(0,0,0,1)]" />
                                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#1f1812] shadow-[inset_0_1px_1px_rgba(255,255,255,0.10),0_2px_6px_rgba(0,0,0,1)]" />

                                <div className="relative z-10" style={{ transform: "translateZ(18px)" }}>
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                        <div className="flex items-center gap-3 text-[#a68a61] font-heading font-bold uppercase tracking-[0.28em] text-[10px] sm:text-[11px] drop-shadow-lg">
                                            <Coins size={18} className="text-amber-500 flex-shrink-0" />
                                            Reserva Real
                                            <span className="hidden sm:inline-block pill px-3 py-1 text-[9px] text-[#bda17a] ml-2">
                                                Ledger • BRL
                                            </span>
                                        </div>

                                        <div className="flex flex-col items-end w-full sm:w-auto">
                                            <button
                                                onClick={handleEarnMoney}
                                                disabled={tributeLoading}
                                                className="btn-press relative flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2 rounded-md border font-heading text-[10px] uppercase tracking-widest
                          bg-gradient-to-r from-amber-900/30 to-red-900/25 border-amber-600/45 text-amber-300
                          hover:border-amber-400 hover:shadow-[0_0_22px_rgba(212,175,55,0.35)] disabled:opacity-50"
                                            >
                                                <Pickaxe size={14} className="drop-shadow-md" />
                                                {tributeLoading ? "Garimpando..." : "Coletar Tributos"}
                                                {earnedAmount && (
                                                    <span
                                                        className="absolute -top-10 left-1/2 -translate-x-1/2 text-green-400 font-brand font-bold text-xl drop-shadow-[0_0_12px_rgba(34,197,94,0.85)] pointer-events-none"
                                                        style={{ animation: "floatUpFade 1.5s ease-out forwards" }}
                                                    >
                                                        +{formatCurrency(earnedAmount)}
                                                    </span>
                                                )}
                                            </button>

                                            {cooldownMessage && (
                                                <span className="text-red-300 text-[9px] font-heading tracking-widest mt-2 bg-red-950/45 px-3 py-2 rounded-md border border-red-900/40 text-center w-full sm:w-auto backdrop-blur-sm">
                                                    {cooldownMessage}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6 sm:mt-4">
                                        {loading ? (
                                            <Sparkles className="animate-spin text-amber-500/50" size={32} />
                                        ) : (
                                            <span
                                                className="text-5xl sm:text-6xl md:text-7xl font-brand font-black tracking-wider break-all drop-shadow-[0_6px_18px_rgba(0,0,0,0.85)]"
                                                style={{
                                                    background:
                                                        "linear-gradient(180deg, #ffffff 0%, #f7d683 55%, #b8860b 100%)",
                                                    WebkitBackgroundClip: "text",
                                                    backgroundClip: "text",
                                                    color: "transparent",
                                                    filter: "drop-shadow(0 0 16px rgba(212,175,55,0.18))",
                                                }}
                                            >
                                                {formatCurrency(balance)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* GUILDA */}
                        <div className="card-soft p-6 overflow-hidden">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[10px] font-heading font-bold text-[#8c7457] uppercase tracking-[0.3em] flex items-center gap-2 drop-shadow-md">
                                    <Users size={14} className="text-amber-600/70" /> A Guilda
                                </h3>
                                <span className="pill px-3 py-1 text-[9px] text-[#bda17a]">
                                    {guild.length} aliados
                                </span>
                            </div>

                            <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-2">
                                <button className="min-w-[70px] flex flex-col items-center gap-3 group flex-shrink-0">
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-dashed border-[#5e4b36] group-hover:border-amber-500 bg-[#17120e] flex items-center justify-center transition-all duration-300 shadow-[inset_0_0_16px_rgba(0,0,0,0.8)] group-hover:shadow-[0_0_18px_rgba(245,158,11,0.18)]">
                                        <span className="text-[#5e4b36] group-hover:text-amber-500 text-2xl sm:text-3xl mb-1 transition-colors">
                                            +
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-[#786149] font-heading uppercase tracking-wider group-hover:text-amber-400 transition-colors">
                                        Novo Aliado
                                    </span>
                                </button>

                                {guild.length > 0 ? (
                                    guild.map((contact) => (
                                        <div
                                            key={contact.id}
                                            className="min-w-[70px] flex flex-col items-center gap-3 group cursor-pointer flex-shrink-0"
                                        >
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-blue-700/45 bg-gradient-to-br from-blue-900/55 to-blue-950/85 text-blue-200 flex items-center justify-center font-brand font-bold text-xl shadow-[inset_0_0_16px_rgba(0,0,0,0.86)] transition-all duration-300 group-hover:scale-110 group-hover:border-blue-400 group-hover:shadow-[0_0_22px_rgba(96,165,250,0.22)]">
                                                {(contact.nickname || contact.name).charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-[10px] text-[#786149] font-heading uppercase tracking-wider group-hover:text-amber-400 truncate w-full text-center transition-colors">
                                                {contact.nickname || contact.name.split(" ")[0]}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center w-full px-4 border border-dashed border-[#2a2016] rounded-lg bg-[#14100c]/50">
                                        <p className="text-[10px] text-[#5e4b36] font-heading uppercase tracking-widest">
                                            Nenhum guerreiro recrutado. A sua guilda está vazia.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ÚLTIMOS FEITOS */}
                        <div className="card-soft p-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-600/55 via-amber-700/25 to-transparent" />

                            <div className="flex justify-between items-center mb-6 pl-2">
                                <h3 className="text-[10px] sm:text-[11px] font-heading font-bold text-[#8c7457] uppercase tracking-[0.3em] flex items-center gap-2 drop-shadow-md">
                                    <ScrollText size={14} className="text-amber-600/70" /> Últimos
                                    Feitos
                                </h3>
                                <Link
                                    to="/statement"
                                    className="text-[9px] text-amber-600 hover:text-amber-400 font-heading uppercase tracking-widest transition-colors"
                                >
                                    Ver Pergaminhos
                                </Link>
                            </div>

                            <div className="flex flex-col gap-3">
                                {recentTransactions.map((tx) => (
                                    <div
                                        key={tx.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-gradient-to-r from-[#17120e] to-[#120e0b] border border-[#2a2016] hover:border-[#4a3826] transition-colors gap-3 sm:gap-0 shadow-[inset_0_0_12px_rgba(0,0,0,0.55)]"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div
                                                className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center border shadow-[inset_0_0_12px_rgba(0,0,0,0.75)] ${tx.type === "IN"
                                                        ? "bg-green-900/18 text-green-400 border-green-900/35"
                                                        : "bg-red-900/18 text-red-400 border-red-900/35"
                                                    }`}
                                            >
                                                {tx.type === "IN" ? (
                                                    <ArrowDownLeft size={18} />
                                                ) : (
                                                    <ArrowUpRight size={18} />
                                                )}
                                            </div>

                                            <div className="truncate min-w-0">
                                                <p className="text-[#d4af37] font-heading font-bold text-[13px] tracking-wider truncate drop-shadow-sm">
                                                    {tx.name}
                                                </p>
                                                <p className="text-[#786149] font-body text-[11px] mt-0.5">
                                                    {tx.date}
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className={`font-brand font-bold tracking-widest text-lg sm:text-right drop-shadow-md ${tx.type === "IN" ? "text-green-400" : "text-red-400"
                                                }`}
                                        >
                                            {tx.type === "IN" ? "+" : "-"}
                                            {formatCurrency(tx.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* DIREITA */}
                    <div className="lg:col-span-1 flex flex-col gap-8">
                        {/* ORDENS DO REI */}
                        <div className="card-soft p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-[10px] sm:text-[11px] font-heading font-bold text-[#8c7457] uppercase tracking-[0.3em] flex items-center gap-2 drop-shadow-md">
                                    <Flame size={14} className="text-amber-600" /> Ordens do Rei
                                </h2>
                                <span className="pill px-3 py-1 text-[9px] text-[#bda17a]">
                                    atalhos
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <SmallActionButton to="/transfer" icon={ArrowRightLeft} title="Transferir" />
                                <SmallActionButton to="/settings" icon={Settings} title="Ajustes" />
                                <SmallActionButton to="/statement" icon={ScrollText} title="Extrato" />
                            </div>
                        </div>

                        {/* COVIL DO DRAGÃO */}
                        <div className="relative overflow-hidden rounded-xl border border-red-900/40 bg-gradient-to-br from-[#1c0d0d] via-[#120808] to-[#0a0806] p-6 shadow-[0_18px_50px_rgba(153,27,27,0.14),inset_0_1px_0_rgba(255,255,255,0.03)]">
                            <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-red-600/12 rounded-full blur-3xl" />
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500/35 to-transparent" />

                            <div className="flex justify-between items-start relative z-10 mb-4">
                                <div>
                                    <h3 className="text-[11px] font-heading font-bold text-red-400 uppercase tracking-[0.3em] mb-1 drop-shadow-[0_0_10px_rgba(239,68,68,0.35)]">
                                        Covil do Dragão
                                    </h3>
                                    <p className="text-[9px] text-[#8c7457] font-heading uppercase tracking-widest">
                                        Ouro em repouso
                                    </p>
                                </div>
                                <TrendingUp size={18} className="text-red-500/70" />
                            </div>

                            <span className="text-2xl sm:text-3xl font-brand font-bold text-red-300 tracking-widest block truncate drop-shadow-md relative z-10">
                                {formatCurrency(lairBalance)}
                            </span>
                        </div>

                        {/* MISSÕES REAIS */}
                        <div className="card-soft p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[10px] sm:text-[11px] font-heading font-bold text-[#8c7457] uppercase tracking-[0.3em] flex items-center gap-2 drop-shadow-md">
                                    <Target size={14} className="text-blue-500/70" /> Missões Reais
                                </h3>
                                <span className="pill px-3 py-1 text-[9px] text-[#bda17a]">
                                    metas
                                </span>
                            </div>

                            {missions.length > 0 ? (
                                missions.map((m) => {
                                    const percent = Math.min(100, (m.current_cents / m.target_cents) * 100);

                                    return (
                                        <div
                                            key={m.id}
                                            className="bg-gradient-to-b from-[#17120e] to-[#120e0b] border border-[#2a2016] rounded-lg p-4 mb-3 shadow-[inset_0_0_12px_rgba(0,0,0,0.62)]"
                                        >
                                            <div className="flex justify-between items-center mb-3 gap-3">
                                                <span className="text-[11px] text-[#d4af37] font-heading uppercase tracking-wider truncate drop-shadow-sm">
                                                    {m.title}
                                                </span>
                                                <span className="text-[11px] text-[#a68a61] font-bold font-brand tracking-widest">
                                                    {percent.toFixed(0)}%
                                                </span>
                                            </div>

                                            <div className="w-full h-2 bg-[#050403] rounded-full overflow-hidden border border-[#2a2016]">
                                                <div
                                                    className="h-full"
                                                    style={{
                                                        width: `${percent}%`,
                                                        background:
                                                            "linear-gradient(90deg, rgba(29,78,216,.85), rgba(59,130,246,.95))",
                                                        boxShadow: "0 0 12px rgba(59,130,246,.35)",
                                                    }}
                                                />
                                            </div>

                                            <div className="flex justify-between text-[9px] text-[#786149] font-heading uppercase tracking-widest mt-3">
                                                <span>{formatCurrency(m.current_cents / 100)}</span>
                                                <span>{formatCurrency(m.target_cents / 100)}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="border border-dashed border-[#2a2016] rounded-lg p-5 bg-[#14100c]/50">
                                    <p className="text-[#786149] text-[10px] font-heading uppercase text-center tracking-widest">
                                        Nenhuma missão forjada.
                                    </p>
                                </div>
                            )}

                            <button className="btn-press w-full mt-4 py-3 bg-[#100d0a] hover:bg-[#17120e] border border-dashed border-[#4a3826] hover:border-amber-600/50 text-[#8c7457] hover:text-amber-400 font-heading text-[10px] uppercase tracking-widest rounded-lg">
                                + Forjar Nova Missão
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SmallActionButton = ({
    to,
    icon: Icon,
    title,
    color = "border-[#2a2016] hover:border-[#8f724e] text-[#8c7457]",
}) => (
    <Link
        to={to}
        className={`btn-press bg-gradient-to-b from-[#14100c]/90 to-[#0a0806]/90 border rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center gap-3 transition-all duration-300 group hover:bg-[#17120e] backdrop-blur-md ${color}`}
    >
        <div className="p-2 rounded-full bg-[#100d0a] border border-[#36291d] group-hover:border-[#8f724e] transition-colors shadow-[inset_0_0_14px_rgba(0,0,0,0.8)]">
            <Icon
                size={18}
                className="sm:w-5 sm:h-5 group-hover:scale-110 group-hover:text-amber-500 transition-all drop-shadow-[0_0_6px_rgba(0,0,0,0.8)] flex-shrink-0"
            />
        </div>
        <h3 className="font-heading font-bold text-[10px] uppercase tracking-[0.2em] text-center w-full truncate group-hover:text-amber-400 transition-colors">
            {title}
        </h3>
    </Link>
);