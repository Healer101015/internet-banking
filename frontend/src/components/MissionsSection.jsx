import React from "react";
import { Target } from "lucide-react";

export const MissionsSection = ({ missions, formatCurrency }) => (
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
                    <div key={m.id} className="bg-gradient-to-b from-[#17120e] to-[#120e0b] border border-[#2a2016] rounded-lg p-4 mb-3 shadow-[inset_0_0_12px_rgba(0,0,0,0.62)]">
                        <div className="flex justify-between items-center mb-3 gap-3">
                            <span className="text-[11px] text-[#d4af37] font-heading uppercase tracking-wider truncate drop-shadow-sm">{m.title}</span>
                            <span className="text-[11px] text-[#a68a61] font-bold font-brand tracking-widest">{percent.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#050403] rounded-full overflow-hidden border border-[#2a2016]">
                            <div className="h-full" style={{ width: `${percent}%`, background: "linear-gradient(90deg, rgba(29,78,216,.85), rgba(59,130,246,.95))", boxShadow: "0 0 12px rgba(59,130,246,.35)" }} />
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
                <p className="text-[#786149] text-[10px] font-heading uppercase text-center tracking-widest">Nenhuma missão forjada.</p>
            </div>
        )}
        <button className="btn-press w-full mt-4 py-3 bg-[#100d0a] hover:bg-[#17120e] border border-dashed border-[#4a3826] hover:border-amber-600/50 text-[#8c7457] hover:text-amber-400 font-heading text-[10px] uppercase tracking-widest rounded-lg">
            + Forjar Nova Missão
        </button>
    </div>
);