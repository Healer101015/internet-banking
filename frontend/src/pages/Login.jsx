// FILE: frontend/src/pages/Login.jsx
import React, { useMemo, useState, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
    Shield,
    Mail,
    KeyRound,
    Castle,
    Flame,
    Sparkles,
    ScrollText,
    Eye,
    EyeOff,
} from "lucide-react";

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const successMessage = location.state?.message;

    // Referência para o efeito 3D (Parallax)
    const cardRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.error || "Os guardas não reconhecem seu selo.");
        } finally {
            setLoading(false);
        }
    };

    // --- EFEITO 3D NO MOUSE ---
    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -4; // Inclinação X (suave)
        const rotateY = ((x - centerX) / centerX) * 4;  // Inclinação Y (suave)

        cardRef.current.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const handleMouseLeave = () => {
        if (cardRef.current) {
            cardRef.current.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        }
    };

    // --- GERADORES DE AMBIENTE (Memoizados) ---
    const rpgWords = useMemo(() => [
        "OURO", "MANA", "FORJA", "DRAGÃO", "SANGUE", "PACTO", "RUNAS",
        "ELIXIR", "GLÓRIA", "FEITIÇO", "ESCUDO", "REINO", "TRONO", "RELÍQUIA", "GUILDA"
    ], []);

    const wordLayout = useMemo(() => {
        const rand = (min, max) => Math.random() * (max - min) + min;
        return rpgWords.map(() => ({
            left: `${rand(5, 92)}%`,
            top: `${rand(20, 92)}%`,
            fontSize: `${rand(0.95, 1.7)}rem`,
            delay: `${rand(0, 14)}s`,
            duration: `${rand(14, 26)}s`,
            blur: `${rand(0, 0.6)}px`,
            rotate: `${rand(-8, 8)}deg`,
            opacity: rand(0.05, 0.12),
        }));
    }, [rpgWords]);

    // Partículas de fogo (Brasas subindo)
    const embersLayout = useMemo(() => {
        const rand = (min, max) => Math.random() * (max - min) + min;
        return Array.from({ length: 25 }).map(() => ({
            left: `${rand(0, 100)}%`,
            size: `${rand(2, 6)}px`,
            delay: `${rand(0, 8)}s`,
            duration: `${rand(5, 10)}s`,
            blur: rand(0, 1) > 0.5 ? '1px' : '0px',
        }));
    }, []);

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center bg-[#050403] p-4 relative overflow-hidden font-body selection:bg-amber-700/40 select-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* --- CSS AAA (Animações + Detalhes Visuais) --- */}
            <style>{`
                /* Névoas */
                @keyframes float-slow {
                    0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 0.15; }
                    50% { transform: translate(80px, -60px) rotate(180deg) scale(1.2); opacity: 0.35; }
                    100% { transform: translate(-40px, 40px) rotate(360deg) scale(1); opacity: 0.15; }
                }
                @keyframes float-medium {
                    0% { transform: translate(0, 0) scale(1); opacity: 0.12; }
                    50% { transform: translate(-100px, 80px) scale(1.12); opacity: 0.36; }
                    100% { transform: translate(20px, -30px) scale(1); opacity: 0.12; }
                }

                /* Círculos Rúnicos (Geometria Arcana) */
                @keyframes spinSlow { 100% { transform: translate(-50%, -50%) rotate(360deg); } }
                @keyframes spinSlowReverse { 100% { transform: translate(-50%, -50%) rotate(-360deg); } }
                .rune-ring {
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 2;
                }

                /* Palavras Mágicas */
                @keyframes floatWords {
                    0% { transform: translateY(18px) translateX(0px); opacity: 0; }
                    15% { opacity: 1; }
                    85% { opacity: 1; }
                    100% { transform: translateY(-170px) translateX(28px); opacity: 0; }
                }

                /* Brasas (Embers) */
                @keyframes emberRise {
                    0% { transform: translateY(100vh) translateX(0) scale(1); opacity: 0; }
                    20% { opacity: 0.8; }
                    80% { opacity: 0.4; }
                    100% { transform: translateY(-10vh) translateX(40px) scale(0.3); opacity: 0; }
                }

                /* Flicker das Tochas */
                @keyframes torchFlicker {
                    0% { opacity: .55; transform: translateY(0px) scale(1); }
                    20% { opacity: .70; transform: translateY(-1px) scale(1.02); }
                    40% { opacity: .52; transform: translateY(1px) scale(.99); }
                    60% { opacity: .75; transform: translateY(-2px) scale(1.03); }
                    80% { opacity: .60; transform: translateY(1px) scale(1.01); }
                    100% { opacity: .55; transform: translateY(0px) scale(1); }
                }

                /* Metal Sheen */
                @keyframes metalSheen {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                /* Shimmer Glint no Título */
                @keyframes titleGlint {
                    0%, 100% { filter: brightness(1) drop-shadow(0 2px 6px rgba(0,0,0,1)); }
                    50% { filter: brightness(1.3) drop-shadow(0 0 15px rgba(212,175,55,0.6)); }
                }

                /* Grão Cinematográfico */
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

                .floating-word {
                    position: absolute;
                    font-family: 'MedievalSharp', cursive;
                    color: #d4af37;
                    pointer-events: none;
                    z-index: 3;
                    animation: floatWords 18s infinite linear;
                    letter-spacing: .22em;
                    text-transform: uppercase;
                }

                /* Inputs Reativos */
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

            {/* --- FUNDO MÁGICO (Camadas Z: 0 a 4) --- */}

            {/* 1. Névoas Básicas */}
            <div className="absolute magic-mist bg-amber-600/30 w-[620px] h-[620px] -top-40 -left-40 blur-[90px] z-0" style={{ animation: "float-slow 28s infinite linear" }} />
            <div className="absolute magic-mist bg-red-900/40 w-[520px] h-[520px] bottom-[-120px] right-[-120px] blur-[90px] z-0" style={{ animation: "float-medium 22s infinite linear" }} />

            {/* 2. Círculos Rúnicos (Geometria Arcana) */}
            <div className="rune-ring w-[650px] h-[650px] border border-amber-500/10 border-t-amber-500/30" style={{ animation: "spinSlow 45s linear infinite" }}></div>
            <div className="rune-ring w-[700px] h-[700px] border-2 border-dashed border-red-600/10" style={{ animation: "spinSlowReverse 60s linear infinite" }}></div>

            {/* 3. “Tochas” laterais */}
            <div className="absolute left-[-140px] top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-amber-500/15 blur-[80px] z-[1]" style={{ animation: "torchFlicker 2.8s infinite ease-in-out" }} />
            <div className="absolute right-[-140px] top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-red-600/10 blur-[85px] z-[1]" style={{ animation: "torchFlicker 3.2s infinite ease-in-out" }} />

            {/* 4. Palavras Flutuantes */}
            {rpgWords.map((word, index) => {
                const w = wordLayout[index];
                return (
                    <span key={word} className="floating-word drop-shadow-[0_6px_18px_rgba(0,0,0,0.8)]"
                        style={{
                            left: w.left, top: w.top, fontSize: w.fontSize,
                            animationDelay: w.delay, animationDuration: w.duration,
                            opacity: w.opacity, filter: `blur(${w.blur})`, transform: `rotate(${w.rotate})`,
                        }}>
                        {word}
                    </span>
                );
            })}

            {/* 5. Brasas Flamejantes (Embers) */}
            {embersLayout.map((e, i) => (
                <div key={i} className="absolute bottom-[-20px] bg-[#ff6600] rounded-full z-[4] shadow-[0_0_10px_#ff3300,0_0_20px_#ff9900]"
                    style={{
                        left: e.left, width: e.size, height: e.size, filter: `blur(${e.blur})`,
                        animation: `emberRise ${e.duration} linear ${e.delay} infinite`,
                    }}
                />
            ))}

            {/* Vinheta ultra escura para as bordas */}
            <div className="absolute inset-0 z-[6] shadow-[inset_0_0_250px_rgba(0,0,0,0.98)] pointer-events-none" />
            <div className="grain-overlay" />

            {/* --- CONTEÚDO PRINCIPAL (O Pergaminho Negro 3D) --- */}
            <div
                ref={cardRef}
                className="relative z-20 w-full max-w-md transition-transform duration-200 ease-out"
                style={{ transformStyle: 'preserve-3d' }}
            >

                {/* Título Flutuante (translateZ empurra ele "para fora" do card no 3D) */}
                <div className="flex flex-col items-center mb-8 drop-shadow-2xl" style={{ transform: 'translateZ(40px)' }}>
                    <div className="relative">
                        <div className="absolute -inset-4 rounded-full bg-amber-500/15 blur-xl animate-pulse" />
                        <Castle className="relative text-amber-500/90 mb-2 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" size={56} strokeWidth={1.2} />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-brand font-black bg-gradient-to-b from-[#fff2cc] via-[#d4af37] to-[#8a631c] bg-clip-text text-transparent tracking-[0.2em] text-center" style={{ animation: 'titleGlint 6s infinite ease-in-out' }}>
                        O Cofre Real
                    </h1>

                    <div className="flex items-center gap-4 mt-3 opacity-80">
                        <div className="h-px w-20 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
                        <Flame size={16} className="text-amber-500 drop-shadow-[0_0_5px_#f59e0b]" />
                        <div className="h-px w-20 bg-gradient-to-l from-transparent via-amber-600 to-transparent" />
                    </div>

                    <p className="mt-4 text-[10px] text-[#9c8466] font-heading uppercase tracking-[0.25em] text-center drop-shadow-md">
                        Insira seu selo para cruzar os portões
                    </p>
                </div>

                {/* Card de Vidro Negro e Metal */}
                <div className="bg-[#100d0a]/80 rounded-lg border border-[#36291d] shadow-[0_30px_80px_rgba(0,0,0,0.95),inset_0_2px_2px_rgba(255,255,255,0.02)] relative backdrop-blur-md overflow-hidden group/card" style={{ transform: 'translateZ(20px)' }}>

                    {/* “Metal” superior com brilho animado */}
                    <div
                        className="absolute top-0 left-0 w-full h-[3px]"
                        style={{
                            background: "linear-gradient(90deg, #1c1611, #8f724e, #1c1611, #8f724e, #1c1611)",
                            backgroundSize: "200% 100%",
                            animation: "metalSheen 6s infinite ease-in-out",
                            boxShadow: "0 0 10px rgba(212,175,55,0.4)"
                        }}
                    />

                    {/* Ornamento interno */}
                    <div className="engraved-border" />

                    {/* “Pregos” nos cantos */}
                    <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-[#1f1812] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,1)]" />
                    <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-[#1f1812] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,1)]" />
                    <div className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-[#1f1812] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,1)]" />
                    <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-[#1f1812] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,1)]" />

                    <div className="p-8 sm:p-10 relative z-10">
                        <div className="flex items-center justify-center gap-3 mb-8">
                            <ScrollText size={18} className="text-amber-500/60 drop-shadow-md" />
                            <h2 className="text-[12px] font-heading text-[#b3956b] text-center uppercase tracking-[0.3em] font-bold">
                                Apresente-se
                            </h2>
                            <ScrollText size={18} className="text-amber-500/60 drop-shadow-md scale-x-[-1]" />
                        </div>

                        {successMessage && (
                            <div className="bg-[#0b1f13]/80 border border-[#2b5938] text-[#86d9a1] p-3 mb-6 text-sm text-center font-heading tracking-widest shadow-inner rounded-sm backdrop-blur-sm">
                                {successMessage}
                            </div>
                        )}

                        {error && (
                            <div className="bg-[#240c0c]/80 border border-[#591e1e] text-[#e07b7b] p-3 mb-6 text-sm text-center font-heading tracking-widest shadow-inner border-l-4 border-l-[#a62121] rounded-sm backdrop-blur-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-7">
                            <div className="relative group/field">
                                <label className="block text-[10px] font-heading font-bold text-[#8c7457] mb-2 uppercase tracking-[0.25em] flex items-center gap-2 group-focus-within/field:text-[#d4af37] transition-colors drop-shadow-md">
                                    <Mail size={13} /> Missiva (E-mail)
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full input-rpg px-4 py-3.5 rounded-sm pr-10 text-lg"
                                        placeholder="aventureiro@reino.com"
                                        autoComplete="email"
                                    />
                                    <Sparkles size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500/30 group-focus-within/field:text-amber-400 transition-colors" />
                                </div>
                            </div>

                            <div className="relative group/field">
                                <label className="block text-[10px] font-heading font-bold text-[#8c7457] mb-2 uppercase tracking-[0.25em] flex items-center gap-2 group-focus-within/field:text-[#d4af37] transition-colors drop-shadow-md">
                                    <KeyRound size={13} /> Selo de Acesso (Senha)
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPass ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full input-rpg px-4 py-3.5 rounded-sm pr-12 text-lg tracking-widest font-mono"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass((s) => !s)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-sm hover:bg-amber-500/10 transition-colors text-amber-500/40 hover:text-amber-400"
                                        aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                                    >
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-8 relative group/btn">
                                {/* Brilho por trás do botão */}
                                <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-full transform scale-90 group-hover/btn:scale-110 transition-transform duration-500 opacity-0 group-hover/btn:opacity-100"></div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="relative w-full wax-seal text-[#ffeec2] font-heading font-bold py-4 px-6 transition-all duration-300 flex justify-center items-center gap-3 uppercase tracking-[0.25em] text-[13px] rounded-sm h-[52px]"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2 drop-shadow-lg">
                                            <Castle className="animate-pulse" size={18} /> Inspecionando...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2 drop-shadow-lg group-hover/btn:tracking-[0.3em] transition-all duration-300">
                                            Entrar no Cofre <Shield size={16} className="text-amber-400/80" />
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="text-center text-[10px] mt-10 pt-6 border-t border-[#36291d]/60 font-heading uppercase tracking-[0.2em] text-[#786149]">
                            Não possui um cofre?
                            <Link
                                to="/register"
                                className="text-[#d4af37] font-bold hover:text-[#ffeaab] hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.8)] transition-all ml-2"
                            >
                                Solicite Audiência
                            </Link>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-[9px] text-[#544330] font-heading uppercase tracking-[0.35em] drop-shadow-md" style={{ transform: 'translateZ(20px)' }}>
                    “A glória é paga em silêncio e selos.”
                </p>
            </div>
        </div>
    );
};