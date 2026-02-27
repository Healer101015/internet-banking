import React from "react";
import { ArrowRightLeft, Settings, ScrollText, Flame } from "lucide-react";
import { Link } from "react-router-dom";

const SmallActionButton = ({ to, icon: Icon, title, color = "border-[#2a2016] hover:border-[#8f724e] text-[#8c7457]" }) => (
    <Link to={to} className={`btn-press bg-gradient-to-b from-[#14100c]/90 to-[#0a0806]/90 border rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center gap-3 transition-all duration-300 group hover:bg-[#17120e] backdrop-blur-md ${color}`}>
        <div className="p-2 rounded-full bg-[#100d0a] border border-[#36291d] group-hover:border-[#8f724e] transition-colors shadow-[inset_0_0_14px_rgba(0,0,0,0.8)]">
            <Icon size={18} className="sm:w-5 sm:h-5 group-hover:scale-110 group-hover:text-amber-500 transition-all drop-shadow-[0_0_6px_rgba(0,0,0,0.8)] flex-shrink-0" />
        </div>
        <h3 className="font-heading font-bold text-[10px] uppercase tracking-[0.2em] text-center w-full truncate group-hover:text-amber-400 transition-colors">
            {title}
        </h3>
    </Link>
);

export const ActionButtons = () => (
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
);