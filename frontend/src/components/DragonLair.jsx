import React from "react";
import { TrendingUp } from "lucide-react";

export const DragonLair = ({ balance, formatCurrency }) => (
    <div className="relative overflow-hidden rounded-xl border border-red-900/40 bg-gradient-to-br from-[#1c0d0d] via-[#120808] to-[#0a0806] p-6 shadow-lg">
        <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-red-600/12 rounded-full blur-3xl" />
        <div className="flex justify-between items-start relative z-10 mb-4">
            <div>
                <h3 className="text-[11px] font-heading font-bold text-red-400 uppercase tracking-[0.3em] mb-1">Covil do Dragão</h3>
                <p className="text-[9px] text-[#8c7457] font-heading uppercase tracking-widest">Ouro em repouso</p>
            </div>
            <TrendingUp size={18} className="text-red-500/70" />
        </div>
        <span className="text-2xl font-brand font-bold text-red-300 tracking-widest block drop-shadow-md">
            {formatCurrency(balance)}
        </span>
    </div>
);