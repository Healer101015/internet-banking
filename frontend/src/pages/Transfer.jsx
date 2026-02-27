import React, { useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Coins, AlertTriangle, CheckCircle, Feather, Send } from 'lucide-react';

export const Transfer = () => {
    const [toEmail, setToEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState({ type: '', msg: '' });
    const navigate = useNavigate();

    const handleTransfer = async (e) => {
        e.preventDefault();
        setStatus({ type: '', msg: '' });
        const amountCents = Math.round(parseFloat(amount.replace(',', '.')) * 100);

        if (amountCents <= 0 || isNaN(amountCents)) return setStatus({ type: 'error', msg: 'A quantia de ouro é inválida.' });

        try {
            await api.post('/transfers', { toEmail, amountCents, description });
            setStatus({ type: 'success', msg: 'A caravana partiu com sucesso!' });
            setTimeout(() => navigate('/statement'), 2500);
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.error?.[0]?.message || err.response?.data?.error || 'Os guardas bloquearam a transferência.' });
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-10">
            <header className="text-center mb-10 drop-shadow-2xl">
                <Coins className="text-[#d4af37] mx-auto mb-6 drop-shadow-[0_0_10px_rgba(212,175,55,0.6)]" size={56} strokeWidth={1.2} />
                <h1 className="text-3xl md:text-4xl font-brand font-black text-gold-gradient tracking-widest uppercase">Autorizar Caravana</h1>
                <p className="text-[#8c7457] font-heading uppercase tracking-[0.2em] text-xs mt-4">Assine o pergaminho para transferir ouro.</p>
            </header>

            {status.msg && (
                <div className={`p-4 rounded-sm flex items-center gap-4 border text-sm font-heading font-bold tracking-widest uppercase shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] ${status.type === 'error' ? 'bg-[#240c0c]/90 border-[#591e1e] text-[#d95d5d]' : 'bg-[#0b1f13]/90 border-[#2b5938] text-[#6bba84]'}`}>
                    {status.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />} {status.msg}
                </div>
            )}

            <form onSubmit={handleTransfer} className="obsidian-card p-10 md:p-14 space-y-8">
                <div className="absolute top-0 left-0 w-full h-[2px] gold-sheen opacity-60"></div>
                <div className="engraved-border"></div>

                <div className="relative z-10 space-y-8">
                    <div className="relative group/field">
                        <label className="block text-[11px] font-heading font-bold text-[#8c7457] mb-3 uppercase tracking-[0.25em] group-focus-within/field:text-[#d4af37] transition-colors">Correio do Destinatário</label>
                        <input type="email" required value={toEmail} onChange={e => setToEmail(e.target.value)} className="input-field input-fantasy" placeholder="mensageiro@reino.com" />
                    </div>

                    <div className="relative group/field">
                        <label className="block text-[11px] font-heading font-bold text-[#8c7457] mb-3 uppercase tracking-[0.25em] group-focus-within/field:text-[#d4af37] transition-colors">Quantia de Ouro (BRL)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5c4a35] font-brand font-bold text-lg">R$</span>
                            <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} className="input-field input-fantasy pl-12" placeholder="0,00" />
                        </div>
                    </div>

                    <div className="relative group/field">
                        <label className="block text-[11px] font-heading font-bold text-[#8c7457] mb-3 uppercase tracking-[0.25em] group-focus-within/field:text-[#d4af37] transition-colors">Mensagem no Pergaminho (Opcional)</label>
                        <div className="relative">
                            <input type="text" maxLength="255" value={description} onChange={e => setDescription(e.target.value)} className="input-field input-fantasy pr-12" placeholder="Ex: Tributo pela espada..." />
                            <Feather className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5c4a35] group-focus-within/field:text-[#d4af37] transition-colors" size={20} />
                        </div>
                    </div>

                    <div className="pt-8 mt-4 border-t border-[#3d2c1d]/60">
                        <button type="submit" className="wax-seal w-full font-heading font-bold py-5 text-[#ffeec2] tracking-[0.25em] uppercase text-sm rounded-sm flex justify-center items-center gap-3">
                            Lacre Real (Enviar) <Send size={18} className="text-[#d4af37]" />
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};