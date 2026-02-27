import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Castle, Coins, ScrollText, Shield, LogOut, UserCircle } from 'lucide-react';

export const Layout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', label: 'Salão Principal', icon: Castle },
        { path: '/transfer', label: 'Caravana de Ouro', icon: Coins },
        { path: '/statement', label: 'Tomo de Registros', icon: ScrollText },
        { path: '/settings', label: 'Selos de Proteção', icon: Shield },
    ];

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-[#030201] text-[#e1d2bc] selection:bg-amber-600/40 relative">
            {/* Efeitos Globais AAA */}
            <div className="grain-overlay mix-blend-overlay opacity-20 fixed"></div>
            <div className="bg-forge-glow fixed"></div>

            {/* Muralha Lateral (Sidebar Obsidiana) */}
            <nav className="w-full md:w-64 bg-[#0a0705]/95 border-r border-[#3d2c1d] p-6 flex flex-col relative z-20 shadow-[10px_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl">

                <div className="relative z-10 text-2xl font-brand font-black mb-12 flex flex-col items-center gap-2 text-center drop-shadow-2xl mt-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full"></div>
                        <Castle size={42} className="text-amber-500/90 relative z-10 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                    </div>
                    <span className="text-gold-gradient tracking-widest uppercase">O Cofre Real</span>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-[#b8860b] to-transparent mt-2"></div>
                </div>

                <div className="relative z-10 flex-1 space-y-2">
                    {navItems.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3.5 p-4 rounded-sm transition-all duration-300 font-heading tracking-[0.15em] uppercase text-xs font-bold border-l-2
                                    ${isActive
                                        ? 'bg-[#1a120b] border-[#d4af37] text-[#d4af37] shadow-[inset_0_0_20px_rgba(212,175,55,0.05)]'
                                        : 'border-transparent text-[#8c7457] hover:bg-[#120d09] hover:text-[#e1d2bc] hover:border-[#8c7457]'}`}
                            >
                                <item.icon size={18} className={`${isActive ? 'text-[#d4af37] drop-shadow-[0_0_5px_rgba(212,175,55,0.8)]' : 'text-[#5c4a35]'}`} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                <div className="relative z-10 mt-auto pt-6 border-t border-[#3d2c1d]/50 space-y-4">
                    <div className="flex items-center gap-3 bg-[#0f0a07] p-3 rounded-sm border border-[#2a1e14] shadow-inner">
                        <UserCircle className="text-[#8c7457]" size={32} />
                        <div className="overflow-hidden">
                            <p className="font-heading font-bold truncate text-[#d4af37] tracking-widest text-xs uppercase">{user?.name}</p>
                            <p className="text-[10px] font-body text-[#7c6a54] truncate mt-1">{user?.email}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-3 text-[#d95d5d] hover:text-[#ff8080] transition-all w-full p-3 justify-center font-heading uppercase tracking-widest text-xs font-bold bg-[#1f0a0a]/50 hover:bg-[#2b0d0d] rounded-sm border border-[#3b1212] hover:shadow-[0_0_15px_rgba(220,38,38,0.2)] group">
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Abandonar
                    </button>
                </div>
            </nav>

            {/* Pátio Principal (Main Content) */}
            <main className="flex-1 p-6 md:p-10 lg:p-14 relative z-10 overflow-y-auto">
                <div className="max-w-5xl mx-auto relative">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};