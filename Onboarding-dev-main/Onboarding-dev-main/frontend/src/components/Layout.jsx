import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-accent"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex bg-black min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 flex flex-col min-h-screen">
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </div>
                <footer className="p-6 border-t border-dark-border text-center text-dark-muted text-sm bg-dark-card/30">
                    <p>LAR UNIVERSITY 2026</p>
                </footer>
            </main>
        </div>
    );
};

export default Layout;
