import React, { useMemo, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { ShieldPlus, Mail, KeyRound, Sparkles, Eye, EyeOff, User } from "lucide-react";

export const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const cardRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await api.post('/auth/register', { name, email, password });
            navigate('/login', { state: { message: 'A aliança foi forjada! Apresente suas runas.' } });
        } catch (err) {
            setError(err.response?.data?.error?.[0]?.message || err.response?.data?.error || 'A Coroa rejeitou sua petição.');
        } finally {
            setLoading(false);
        }
    };

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -3;
        const rotateY = ((x - centerX) / centerX) * 3;
        cardRef.current.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
    };

    const handleMouseLeave = () => {
        if (cardRef.current) cardRef.current.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    };

    const rpgWords = useMemo(() => ["ALIANÇA", "GUILDA", "PACTO", "SANGUE", "OURO", "HONRA", "JURAMENTO", "COROA", "ESPADA"], []);
    const wordLayout = useMemo(() => rpgWords.map(() => ({
        left: `${Math.random() * 90}%`, top: `${Math.random() * 70 + 20}%`,
        fontSize: `${Math.random() * 0.8 + 1}rem`, delay: `${Math.random() * 10}s`,
        duration: `${Math.random() * 12 + 18}s`, blur: `${Math.random() * 0.5}px`,
        rotate: `${Math.random() * 10 - 5}deg`, opacity: Math.random() * 0.08 + 0.04,
    })), [rpgWords]);

    const embersLayout = useMemo(() => Array.from({ length: 20 }).map(() => ({
        left: `${Math.random() * 100}%`, size: `${Math.random() * 4 + 2}px`,
        delay: `${Math.random() * 5}s`, duration: `${Math.random() * 6 + 6}s`,
        blur: Math.random() > 0.5 ? '1px' : '0px',
    })), []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#050403] p-4 relative overflow-hidden font-body selection:bg-amber-700/40 select-none" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>

            {/* O bloco de estilos do AAA que faltava e causava o empurramento da tela */}
            <style>{`
                @keyframes float-slow {
                    0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 0.15; }
                    50% { transform: translate(80px, -60px) rotate(180deg) scale(1.2); opacity: 0.35; }
                    100% { transform: translate(-40px, 40px) rotate(360deg) scale(1); opacity: 0.15; }
                }
                @keyframes floatWords {
                    0% { transform: translateY(18px) translateX(0px); opacity: 0; }
                    15% { opacity: 1; }
                    85% { opacity: 1; }
                    100% { transform: translateY(-170px) translateX(28px); opacity: 0; }
                }
                @keyframes emberRise {
                    0% { transform: translateY(100vh) translateX(0) scale(1); opacity: 0; }
                    20% { opacity: 0.8; }
                    80% { opacity: 0.4; }
                    100% { transform: translateY(-10vh) translateX(40px) scale(0.3); opacity: 0; }
                }
                @keyframes spinSlow { 100% { transform: translate(-50%, -50%) rotate(360deg); } }
                @keyframes metalSheen {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes titleGlint {
                    0%, 100% { filter: brightness(1) drop-shadow(0 2px 6px rgba(0,0,0,1)); }
                    50% { filter: brightness(1.3) drop-shadow(0 0 15px rgba(212,175,55,0.6)); }
                }
                .rune-ring {
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 2;
                }
                .grain-overlay {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    z-index: 5;
                    opacity: 0.15;
                    background-image:
                        radial-gradient(circle at 10% 20%, rgba(255,255,255,0.08), transparent 40%),
                        radial-gradient(circle at 70% 80%, rgba(255,180,60,0.06), transparent 45%),
                        repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px);
                    mix-blend-mode: overlay;
                    filter: blur(0.2px);
                }
                .input-rpg {
                    background-color: rgba(15, 12, 9, 0.7);
                    border: 1px solid #2a2218;
                    color: #e1d2bc;
                    box-shadow: inset 0 3px 10px rgba(0,0,0,0.82);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .input-rpg::placeholder { color: rgba(225,210,188,0.25); }
                .input-rpg:focus {
                    border-color: #b58a2f;
                    box-shadow: inset 0 3px 10px rgba(0,0,0,0.82), 0 0 15px rgba(197,152,62,0.15);
                    background-color: rgba(25, 18, 12, 0.9);
                    outline: none;
                    transform: translateY(-1px);
                }
                .engraved-border {
                    position: absolute;
                    inset: 10px;
                    border: 1px solid rgba(197,152,62,0.18);
                    pointer-events: none;
                    mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
                }
                .wax-seal {
                    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent 40%),
                                radial-gradient(circle at 70% 70%, rgba(0,0,0,0.4), transparent 50%),
                                linear-gradient(145deg, #8f1919, #540e0e);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.7), inset 0 2px 0 rgba(255,255,255,0.1), inset 0 -6px 15px rgba(0,0,0,0.4);
                }
                .wax-seal:hover {
                    box-shadow: 0 15px 35px rgba(255,50,50,0.2), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -6px 15px rgba(0,0,0,0.4);
                    filter: brightness(1.1);
                }
            `}</style>

            <div className="absolute magic-mist bg-amber-600/20 w-[600px] h-[600px] -top-32 -right-32 blur-[100px] z-0" style={{ animation: "float-slow 35s infinite linear" }} />
            <div className="rune-ring w-[650px] h-[650px] border border-amber-500/10 border-t-amber-500/30" style={{ animation: "spinSlow 45s linear infinite" }}></div>

            {rpgWords.map((word, index) => {
                const w = wordLayout[index];
                return <span key={word} className="absolute font-heading pointer-events-none z-[3] tracking-[0.2em] uppercase text-[#d4af37]" style={{ left: w.left, top: w.top, fontSize: w.fontSize, animation: `floatWords ${w.duration} infinite linear ${w.delay}`, opacity: w.opacity, filter: `blur(${w.blur})`, transform: `rotate(${w.rotate})` }}>{word}</span>
            })}

            {embersLayout.map((e, i) => (
                <div key={i} className="absolute bottom-[-20px] bg-[#ff6600] rounded-full z-[4] shadow-[0_0_10px_#ff3300,0_0_20px_#ff9900]" style={{ left: e.left, width: e.size, height: e.size, filter: `blur(${e.blur})`, animation: `emberRise ${e.duration} linear ${e.delay} infinite` }} />
            ))}

            <div className="absolute inset-0 z-[6] shadow-[inset_0_0_250px_rgba(0,0,0,0.98)] pointer-events-none" />
            <div className="grain-overlay" />

            <div ref={cardRef} className="relative z-20 w-full max-w-md transition-transform duration-200 ease-out" style={{ transformStyle: 'preserve-3d' }}>
                <div className="flex flex-col items-center mb-8 drop-shadow-2xl" style={{ transform: 'translateZ(40px)' }}>
                    <ShieldPlus className="text-amber-500/90 mb-3 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" size={56} strokeWidth={1.2} />
                    <h1 className="text-3xl md:text-4xl font-brand font-black bg-gradient-to-b from-[#fff2cc] via-[#d4af37] to-[#8a631c] bg-clip-text text-transparent tracking-[0.2em] text-center uppercase" style={{ animation: 'titleGlint 6s infinite ease-in-out' }}>Pacto de Sangue</h1>
                </div>

                {/* Estrutura do card ajustada para usar as mesmas propriedades Tailwind e fundo de vidro negro do Login */}
                <div className="bg-[#100d0a]/80 rounded-lg border border-[#36291d] shadow-[0_30px_80px_rgba(0,0,0,0.95),inset_0_2px_2px_rgba(255,255,255,0.02)] relative backdrop-blur-md overflow-hidden group/card p-8 sm:p-10" style={{ transform: 'translateZ(20px)' }}>
                    <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: "linear-gradient(90deg, #1c1611, #8f724e, #1c1611, #8f724e, #1c1611)", backgroundSize: "200% 100%", animation: "metalSheen 6s infinite ease-in-out", boxShadow: "0 0 10px rgba(212,175,55,0.4)" }}></div>
                    <div className="engraved-border"></div>

                    {/* Pregos nos cantos adicionados para seguir o design original */}
                    <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-[#1f1812] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,1)]" />
                    <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-[#1f1812] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,1)]" />
                    <div className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-[#1f1812] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,1)]" />
                    <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-[#1f1812] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,1)]" />

                    <div className="relative z-10">
                        {error && <div className="bg-[#240c0c]/80 border border-[#591e1e] text-[#e07b7b] p-3 mb-6 text-sm text-center font-heading tracking-widest shadow-inner border-l-4 border-l-[#a62121] rounded-sm backdrop-blur-sm">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative group/field">
                                <label className="block text-[10px] font-heading font-bold text-[#8c7457] mb-2 uppercase tracking-[0.25em] flex items-center gap-2 group-focus-within/field:text-[#d4af37] transition-colors"><User size={13} /> Cavaleiro (Nome)</label>
                                {/* As classes dos inputs foram corrigidas para input-rpg */}
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full input-rpg px-4 py-3 rounded-sm text-lg" placeholder="Sir Lancelot" />
                            </div>

                            <div className="relative group/field">
                                <label className="block text-[10px] font-heading font-bold text-[#8c7457] mb-2 uppercase tracking-[0.25em] flex items-center gap-2 group-focus-within/field:text-[#d4af37] transition-colors"><Mail size={13} /> Missiva (E-mail)</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full input-rpg px-4 py-3 rounded-sm text-lg" placeholder="lancelot@reino.com" />
                            </div>

                            <div className="relative group/field">
                                <label className="block text-[10px] font-heading font-bold text-[#8c7457] mb-2 uppercase tracking-[0.25em] flex items-center gap-2 group-focus-within/field:text-[#d4af37] transition-colors"><KeyRound size={13} /> Runas Mágicas (Senha)</label>
                                <div className="relative">
                                    <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full input-rpg px-4 py-3 rounded-sm pr-12 text-lg font-mono tracking-widest" placeholder="••••••••" />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-sm text-amber-500/40 hover:text-amber-400"><Eye size={16} /></button>
                                </div>
                            </div>

                            <div className="pt-6 group/btn relative">
                                <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-full transform scale-90 group-hover/btn:scale-110 transition-transform duration-500 opacity-0 group-hover/btn:opacity-100"></div>
                                <button type="submit" disabled={loading} className="relative w-full wax-seal text-[#ffeec2] font-heading font-bold py-4 transition-all duration-300 flex justify-center items-center gap-3 uppercase tracking-[0.25em] text-[12px] rounded-sm">
                                    {loading ? <span className="flex items-center gap-2 drop-shadow-lg"><Sparkles className="animate-spin" size={18} /> Forjando...</span> : <span className="flex items-center gap-2 drop-shadow-lg group-hover/btn:tracking-[0.3em] transition-all duration-300">Assinar Pacto <ShieldPlus size={16} className="text-amber-400/80" /></span>}
                                </button>
                            </div>
                        </form>

                        <div className="text-center text-[10px] mt-8 pt-6 border-t border-[#36291d]/60 font-heading uppercase tracking-[0.2em] text-[#786149]">
                            Já prestou juramento?
                            <Link to="/login" className="text-[#d4af37] font-bold hover:text-[#ffeaab] hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.8)] transition-all ml-2">Apresente-se</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};