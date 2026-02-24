import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ConstellationBackground from './ConstellationBackground';
import { Sun, Moon } from 'lucide-react';

const Layout = () => {
    const { user, loading } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();

    if (loading) {
        return (
            <div className={`flex items-center justify-center h-screen ${isDarkMode ? 'bg-black' : 'bg-light-bg'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-accent"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className={`flex min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-black text-white' : 'bg-light-bg text-light-text'}`}>
            <ConstellationBackground theme={isDarkMode ? 'dark' : 'light'} />
            <Sidebar />

            <main className="flex-1 ml-64 flex flex-col min-h-screen relative z-10">
                {/* Header with Theme Toggle */}
                <header className="px-8 py-4 flex justify-between items-center sticky top-0 z-20 bg-transparent">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black tracking-[0.3em] text-orange-accent/60 uppercase">Evolución Profesional</span>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="w-10 h-10 rounded-xl border border-orange-accent/30 bg-card/50 backdrop-blur-md flex items-center justify-center hover:scale-110 hover:border-orange-accent transition-all group overflow-hidden shadow-lg shadow-orange-accent/5"
                        title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                    >
                        <svg viewBox="0 0 24 24" className={`w-5 h-5 ${isDarkMode ? 'text-orange-accent' : 'text-orange-hover'}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m12.72-12.72l-1.41 1.41M12 7c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5z" />
                        </svg>
                    </button>
                </header>

                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </div>
                <footer className={`p-6 border-t ${isDarkMode ? 'border-dark-border bg-dark-card/30 text-dark-muted' : 'border-light-border bg-white/30 text-light-muted'} text-center text-sm backdrop-blur-sm`}>
                    <p>LÄR UNIVERSITY 2026</p>
                </footer>
            </main>
        </div>
    );
};

export default Layout;
