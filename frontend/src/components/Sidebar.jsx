import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, User, History, LogOut, GraduationCap, Triangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
    const { logout, user } = useAuth();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Panel de Control', path: '/', icon: <Home size={18} /> },
        { name: 'Mi Perfil', path: '/perfil', icon: <User size={18} /> },
        { name: 'Historial', path: '/historial', icon: <History size={18} /> },
    ];

    return (
        <aside className={`${isDarkMode ? 'bg-[#12100E] border-[#2E2925]' : 'bg-white border-light-border'} w-64 border-r h-screen flex flex-col fixed left-0 top-0 z-20 transition-all duration-500`}>
            <div className="p-8 flex items-center gap-3">
                <div className="relative group">
                    <div className="absolute inset-0 bg-orange-accent/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700"></div>
                    <svg viewBox="0 0 100 100" className="w-10 h-10 relative z-10">
                        <polygon points="50,20 15,80 85,80" fill="none" stroke="#FF6B35" strokeWidth="10" />
                        <rect x="42" y="4" width="7" height="7" fill="#FF6B35" />
                        <rect x="52" y="4" width="7" height="7" fill="#FF6B35" />
                    </svg>
                </div>
                <div className="space-y-0">
                    <h1 className={`text-2xl font-black tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-light-text'}`}>
                        LÄR
                    </h1>
                    <span className="text-orange-accent/80 font-black text-[9px] tracking-[0.2em] uppercase block">University</span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-8 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 ${isActive
                                ? 'bg-orange-accent text-white font-bold shadow-lg shadow-orange-accent/30'
                                : `${isDarkMode ? 'text-stone-400 hover:text-white hover:bg-stone-800/50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`
                            }`
                        }
                    >
                        {item.icon}
                        <span className="text-sm">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className={`p-6 border-t ${isDarkMode ? 'border-border/50 bg-[#12100E]/50' : 'border-light-border'}`}>
                <div className="flex items-center gap-3 px-2 py-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-accent to-orange-hover flex items-center justify-center text-white font-black shadow-lg">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 truncate">
                        <p className="text-sm font-black truncate">{user?.name?.toUpperCase()}</p>
                        <p className="text-[10px] text-orange-accent/60 font-medium truncate uppercase tracking-widest">{user?.role || 'ESTUDIANTE'}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full h-11 flex items-center gap-3 px-5 text-stone-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all font-bold text-sm"
                >
                    <LogOut size={16} />
                    <span>Salir</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
