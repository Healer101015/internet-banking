import React, { useRef } from "react";
import { Coins, Pickaxe, Sparkles } from "lucide-react";

export const BalanceCard = ({
    balance,
    onEarn,
    loading,
    tributeLoading,
    earnedAmount,
    cooldownMessage,
    formatCurrency
}) => {
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!cardRef.current || window.innerWidth < 1024) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -2.5;
        const rotateY = ((x - centerX) / centerX) * 2.5;

        cardRef.current.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
    };

    const handleMouseLeave = () => {
        if (cardRef.current) {
            cardRef.current.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
        }
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative group transition-transform duration-200 ease-out z-20"
            style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        >
            {/* Brilho de fundo (Hover) */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#d4af37]/25 via-transparent to-red-600/18 rounded-[18px] blur-xl opacity-40 group-hover:opacity-65 transition duration-700" />

            {/* Cartão Principal */}
            <div className="relative card p-8 md:p-12 overflow-hidden min-h-[230px] flex flex-col justify-between">
                <div className="metal-edge" />
                <div className="engraved-border" />

                {/* Detalhes dos parafusos/rebites nos cantos */}
                <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-[#1f1812] shadow-[inset_0_1px_1px_rgba(255,255,255,0.10),0_2px_6px_rgba(0,0,0,1)]" />
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#1f1812] shadow-[inset_0_1px_1px_rgba(255,255,255,0.10),0_2px_6px_rgba(0,0,0,1)]" />

                <div className="relative z-10" style={{ transform: "translateZ(18px)" }}>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">

                        {/* Título e Selo */}
                        <div className="flex items-center gap-3 text-[#a68a61] font-heading font-bold uppercase tracking-[0.28em] text-[10px] sm:text-[11px] drop-shadow-lg">
                            <Coins size={18} className="text-amber-500 flex-shrink-0" />
                            Reserva Real
                            <span className="hidden sm:inline-block pill px-3 py-1 text-[9px] text-[#bda17a] ml-2">
                                Ledger • BRL
                            </span>
                        </div>

                        {/* Botão de Coletar Tributos */}
                        <div className="flex flex-col items-end w-full sm:w-auto">
                            <button
                                onClick={onEarn}
                                disabled={tributeLoading}
                                className="btn-press relative flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2 rounded-md border font-heading text-[10px] uppercase tracking-widest bg-gradient-to-r from-amber-900/30 to-red-900/25 border-amber-600/45 text-amber-300 hover:border-amber-400 hover:shadow-[0_0_22px_rgba(212,175,55,0.35)] disabled:opacity-50"
                            >
                                <Pickaxe size={14} className="drop-shadow-md" />
                                {tributeLoading ? "Garimpando..." : "Coletar Tributos"}

                                {/* Animação do valor ganho (+R$ X,XX) */}
                                {earnedAmount && (
                                    <span
                                        className="absolute -top-10 left-1/2 -translate-x-1/2 text-green-400 font-brand font-bold text-xl drop-shadow-[0_0_12px_rgba(34,197,94,0.85)] pointer-events-none"
                                        style={{ animation: "floatUpFade 1.5s ease-out forwards" }}
                                    >
                                        +{formatCurrency(earnedAmount)}
                                    </span>
                                )}
                            </button>

                            {/* Mensagem de Cooldown (Tempo de Espera) */}
                            {cooldownMessage && (
                                <span className="text-red-300 text-[9px] font-heading tracking-widest mt-2 bg-red-950/45 px-3 py-2 rounded-md border border-red-900/40 text-center w-full sm:w-auto backdrop-blur-sm">
                                    {cooldownMessage}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Exibição do Saldo */}
                    <div className="mt-6 sm:mt-4">
                        {loading ? (
                            <Sparkles className="animate-spin text-amber-500/50" size={32} />
                        ) : (
                            <span
                                className="text-5xl sm:text-6xl md:text-7xl font-brand font-black tracking-wider break-all drop-shadow-[0_6px_18px_rgba(0,0,0,0.85)]"
                                style={{
                                    background: "linear-gradient(180deg, #ffffff 0%, #f7d683 55%, #b8860b 100%)",
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
    );
};