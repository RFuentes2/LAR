import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Calendar, ChevronRight, Loader2, Search, Trash2, GraduationCap, Plus } from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const HistorialPage = () => {
    const { isDarkMode } = useTheme();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await api.get('/chat');
                if (response.data.success) {
                    setChats(response.data.data.chats);
                }
            } catch (err) {
                console.error('Error fetching chats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, []);

    const handleDeleteChat = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('¿Estás seguro de que deseas eliminar este chat?')) {
            try {
                await api.delete(`/chat/${id}`);
                setChats(chats.filter(chat => chat.id !== id));
            } catch (err) {
                console.error('Error deleting chat:', err);
            }
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredChats = chats.filter(chat =>
        chat.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="animate-spin text-orange-accent" size={40} />
                <p className="text-dark-muted">Cargando tus conversaciones...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Historial de Consultas</h1>
                    <p className="text-muted text-sm">Todas tus conversaciones guardadas con el Asistente Lär University</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por título..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10 md:w-64"
                    />
                </div>
            </header>

            {filteredChats.length === 0 ? (
                <div className="card-premium text-center py-20 flex flex-col items-center justify-center">
                    <div className="relative mb-8">
                        {/* Floating Dots */}
                        <div className="absolute -top-4 -right-4 w-3 h-3 bg-orange-accent rounded-full animate-float-1 opacity-60"></div>
                        <div className="absolute -bottom-2 -left-6 w-2 h-2 bg-orange-accent rounded-full animate-float-2 opacity-40"></div>

                        {/* Squircle Chat Icon */}
                        <div className="w-24 h-24 bg-[#121212] rounded-[2rem] border border-orange-accent/20 flex items-center justify-center text-orange-accent shadow-2xl relative z-10">
                            <MessageSquare size={44} strokeWidth={1.5} />
                        </div>
                    </div>

                    <div className="space-y-2 mb-8">
                        <h2 className="text-2xl font-black text-white">No se encontraron conversaciones</h2>
                        <div className="space-y-1">
                            <p className="text-stone-400 max-w-sm mx-auto">
                                Parece que aún no has iniciado ninguna charla o no coincide con tu búsqueda.
                            </p>
                            <p className="text-orange-accent/80 font-bold text-sm italic">
                                ¡Empieza a trazar tu ruta profesional hoy!
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/')}
                        className="btn-primary"
                    >
                        <span className="text-xl mr-2 leading-none">⊕</span>
                        <span>Comenzar nueva asesoría</span>
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredChats.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => navigate('/', { state: { openChatId: chat.id } })}
                            className="group card hover:border-orange-accent/30 transition-all cursor-pointer flex items-center gap-4 p-4"
                        >
                            <div className="w-12 h-12 bg-dark-border rounded-xl flex items-center justify-center text-orange-accent group-hover:bg-orange-accent group-hover:text-white transition-colors">
                                <MessageSquare size={24} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg truncate group-hover:text-orange-accent transition-colors">
                                    {chat.title}
                                </h3>
                                <div className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    <span>{formatDate(chat.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <GraduationCap size={14} />
                                    <span>{chat.messages?.length || 0} mensajes</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={(e) => handleDeleteChat(e, chat.id)}
                                    className="p-2 text-dark-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                    title="Eliminar conversación"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <ChevronRight className="text-dark-muted group-hover:text-orange-accent transition-transform group-hover:translate-x-1" size={20} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistorialPage;
