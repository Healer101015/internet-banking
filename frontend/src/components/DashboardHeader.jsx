import React from "react";
import { Crown } from "lucide-react";

export const DashboardHeader = ({ user, notificationComponent }) => {
    return (
        <header className="relative pb-5 border-b border-[#36291d]/60">
            {/* Linha de brilho inferior */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-amber-600/0 via-amber-600/40 to-amber-600/0" />

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                    {/* Avatar Real */}
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

                {/* Slot para o componente de Notificações (Corvos) */}
                {notificationComponent}
            </div>
        </header>
    );
};