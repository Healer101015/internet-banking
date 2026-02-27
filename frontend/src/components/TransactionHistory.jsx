import React from "react";
import { ScrollText, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export const TransactionHistory = ({ transactions, formatCurrency }) => (
    <div className="card-soft p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-600/55 via-amber-700/25 to-transparent" />
        <div className="flex justify-between items-center mb-6 pl-2">
            <h3 className="text-[10px] sm:text-[11px] font-heading font-bold text-[#8c7457] uppercase tracking-[0.3em] flex items-center gap-2">
                <ScrollText size={14} className="text-amber-600/70" /> Últimos Feitos
            </h3>
            <Link to="/statement" className="text-[9px] text-amber-600 hover:text-amber-400 font-heading uppercase tracking-widest transition-colors">
                Ver Pergaminhos
            </Link>
        </div>
        <div className="flex flex-col gap-3">
            {transactions.map((tx) => (
                <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-gradient-to-r from-[#17120e] to-[#120e0b] border border-[#2a2016] shadow-[inset_0_0_12px_rgba(0,0,0,0.55)]">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center border ${tx.type === "IN" ? "bg-green-900/18 text-green-400 border-green-900/35" : "bg-red-900/18 text-red-400 border-red-900/35"}`}>
                            {tx.type === "IN" ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                        </div>
                        <div className="truncate min-w-0">
                            <p className="text-[#d4af37] font-heading font-bold text-[13px] tracking-wider truncate">{tx.name}</p>
                            <p className="text-[#786149] font-body text-[11px] mt-0.5">{tx.date}</p>
                        </div>
                    </div>
                    <span className={`font-brand font-bold tracking-widest text-lg ${tx.type === "IN" ? "text-green-400" : "text-red-400"}`}>
                        {tx.type === "IN" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </span>
                </div>
            ))}
        </div>
    </div>
);