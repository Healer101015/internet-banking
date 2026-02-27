import React from "react";
import { Users } from "lucide-react";

export const GuildSection = ({ guild }) => (
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
                    <span className="text-[#5e4b36] group-hover:text-amber-500 text-2xl sm:text-3xl mb-1 transition-colors">+</span>
                </div>
                <span className="text-[10px] text-[#786149] font-heading uppercase tracking-wider group-hover:text-amber-400 transition-colors">
                    Novo Aliado
                </span>
            </button>

            {guild.length > 0 ? (
                guild.map((contact) => (
                    <div key={contact.id} className="min-w-[70px] flex flex-col items-center gap-3 group cursor-pointer flex-shrink-0">
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
);