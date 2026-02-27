import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Hammer } from 'lucide-react';

export const Settings = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [status, setStatus] = useState({ type: '', msg: '' });
    const { logout } = useAuth();

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/me/change-password', { oldPassword, newPassword });
            setStatus({ type: 'success', msg: "Runas forjadas com sucesso! Proteção renovada." });
            setTimeout(() => logout(), 3500);
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.error || 'A forja falhou. Verifique as runas antigas.' });
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-10 space-y-10">
            <header className="text-center mb-10 drop-shadow-2xl">
                <Hammer className="text-[#8f1919] mx-auto mb-6 drop-shadow-[0_0_15px_rgba(143,25,25,0.8)]" size={56} strokeWidth={1.2} />
                <h2 className="text-3xl md:text-4xl font-brand font-black text-gold-gradient tracking-widest uppercase">Forja de Proteção</h2>
                <p className="text-[#8c7457] font-heading uppercase tracking-[0.2em] text-xs mt-4">Altere as runas que guardam seu cofre.</p>
            </header>

            <div className="obsidian-card p-10 md:p-14">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#8f1919] to-transparent opacity-80 shadow-[0_0_20px_rgba(143,25,25,0.9)]"></div>
                <div className="engraved-border"></div>

                <div className="relative z-10">
                    {status.msg && <div className={`p-4 rounded-sm mb-8 text-sm font-heading font-bold uppercase tracking-widest text-center shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] border ${status.type === 'error' ? 'bg-[#240c0c]/90 border-[#591e1e] text-[#d95d5d]' : 'bg-[#0b1f13]/90 border-[#2b5938] text-[#6bba84]'}`}>{status.msg}</div>}

                    <form onSubmit={handleChangePassword} className="space-y-8">
                        <div className="relative group/field">
                            <label className="block text-[11px] font-heading font-bold text-[#8c7457] mb-3 uppercase tracking-[0.25em] group-focus-within/field:text-[#d4af37] transition-colors">Runas Atuais (Senha Antiga)</label>
                            <input type="password" required value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="input-fantasy font-mono tracking-widest" placeholder="••••••••" />
                        </div>
                        <div className="relative group/field">
                            <label className="block text-[11px] font-heading font-bold text-[#8c7457] mb-3 uppercase tracking-[0.25em] group-focus-within/field:text-[#d4af37] transition-colors">Novas Runas (Nova Senha)</label>
                            <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-fantasy font-mono tracking-widest" minLength={8} placeholder="••••••••" />
                            <p className="text-[10px] text-[#5c4a35] mt-3 font-heading uppercase tracking-[0.1em] italic">Misture símbolos, números e letras sagradas.</p>
                        </div>
                        <div className="pt-8 border-t border-[#3d2c1d]/60">
                            <button type="submit" className="wax-seal w-full font-heading font-bold py-5 text-[#ffeec2] tracking-[0.25em] uppercase text-sm rounded-sm">
                                Golpear a Bigorna
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};