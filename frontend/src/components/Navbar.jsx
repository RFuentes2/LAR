import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Home, User, History, LogOut, Sun, Moon, GraduationCap } from 'lucide-react';

const Navbar = () => {
    const { logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', icon: <Home className="w-5 h-5" />, label: 'Inicio' },
        { path: '/perfil', icon: <User className="w-5 h-5" />, label: 'Perfil' },
        { path: '/historial', icon: <History className="w-5 h-5" />, label: 'Historial' },
    ];

    return (
        <nav className={`sticky top-0 z-50 w-full backdrop-blur-md border-b transition-all duration-300 ${isDarkMode
            ? 'bg-black/60 border-orange-accent/10'
            : 'bg-white/60 border-orange-accent/10'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 rounded-xl bg-orange-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg viewBox="0 0 100 100" className="w-7 h-7">
                                <polygon points="50,20 15,80 85,80" fill="none" stroke="#FF6B35" strokeWidth="10" />
                                <rect x="42" y="4" width="7" height="7" fill="#FF6B35" />
                                <rect x="52" y="4" width="7" height="7" fill="#FF6B35" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-lg font-black tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>
                                LÄR <span className="text-orange-accent">UNIVERSITY</span>
                            </span>
                            <span className="text-[8px] uppercase tracking-widest text-orange-accent/70 font-black">
                                Evolución Profesional
                            </span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-4">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `
                                    flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                                    ${isActive
                                        ? 'bg-orange-accent text-white shadow-lg shadow-orange-accent/20'
                                        : isDarkMode
                                            ? 'text-dark-muted hover:bg-white/5 hover:text-white'
                                            : 'text-light-muted hover:bg-black/5 hover:text-black'
                                    }
                                `}
                            >
                                {item.icon}
                                {item.label}
                            </NavLink>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className={`w-10 h-10 rounded-xl border border-orange-accent/30 flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-orange-accent/5 ${isDarkMode ? 'bg-card/50 text-orange-accent' : 'bg-white/50 text-orange-hover'
                                }`}
                            title={isDarkMode ? 'Mocho claro' : 'Modo oscuro'}
                        >
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <button
                            onClick={handleLogout}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-95 ${isDarkMode
                                ? 'bg-white/5 text-dark-muted hover:bg-red-500/10 hover:text-red-500'
                                : 'bg-black/5 text-light-muted hover:bg-red-500/10 hover:text-red-500'
                                }`}
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
