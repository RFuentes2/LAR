import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ConstellationBackground from './ConstellationBackground';

const Layout = () => {
    const { user, loading } = useAuth();
    const { isDarkMode } = useTheme();

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
        <div className={`flex flex-col min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-black text-white' : 'bg-light-bg text-light-text'}`}>
            <ConstellationBackground theme={isDarkMode ? 'dark' : 'light'} />

            <Navbar />

            <main className="flex-1 flex flex-col min-h-screen relative z-10 w-full overflow-x-hidden">
                <div className="flex-1 px-4 sm:px-10 py-8 overflow-y-auto overflow-x-hidden">
                    <div className="w-full">
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
