import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, User, History, LogOut, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Inicio', path: '/', icon: <Home size={20} /> },
        { name: 'Perfil', path: '/perfil', icon: <User size={20} /> },
        { name: 'Historial', path: '/historial', icon: <History size={20} /> },
    ];

    return (
        <aside className="w-64 bg-dark-card border-r border-dark-border h-screen flex flex-col fixed left-0 top-0 z-10">
            <div className="p-6 flex items-center gap-3">
                <div className="bg-orange-accent p-2 rounded-lg">
                    <GraduationCap className="text-white" size={24} />
                </div>
                <h1 className="text-xl font-bold tracking-tight">
                    Edu<span className="text-orange-accent">AI</span>
                </h1>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                ? 'bg-orange-accent/10 text-orange-accent font-medium'
                                : 'text-dark-muted hover:bg-dark-border hover:text-white'
                            }`
                        }
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-dark-border">
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-orange-accent/20 flex items-center justify-center text-orange-accent font-bold">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 truncate">
                        <p className="text-sm font-medium truncate">{user?.name}</p>
                        <p className="text-xs text-dark-muted truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-dark-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                >
                    <LogOut size={18} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
