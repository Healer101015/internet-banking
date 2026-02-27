import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Wallet, Send, History, Settings, LogOut } from 'lucide-react';

export const Layout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Sidebar Navbar */}
            <nav className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col">
                <div className="text-2xl font-bold mb-8 text-brand flex items-center gap-2">
                    <Wallet /> DevBank
                </div>
                <div className="flex-1 space-y-2">
                    <Link to="/dashboard" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition-colors"><Wallet size={20} /> Início</Link>
                    <Link to="/transfer" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition-colors"><Send size={20} /> Transferir</Link>
                    <Link to="/statement" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition-colors"><History size={20} /> Extrato</Link>
                    <Link to="/settings" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition-colors"><Settings size={20} /> Configurações</Link>
                </div>
                <div className="mt-auto pt-6 border-t border-slate-700">
                    <p className="text-sm text-slate-400 mb-4 truncate">Olá, {user?.name}</p>
                    <button onClick={handleLogout} className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors w-full p-2">
                        <LogOut size={20} /> Sair
                    </button>
                </div>
            </nav>
            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};