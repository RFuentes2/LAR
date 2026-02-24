import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Wand2 } from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const ChatComponent = ({ chatId, cvAnalysisId }) => {
    const { isDarkMode } = useTheme();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (chatId) {
            fetchChatHistory();
        }
    }, [chatId]);

    useEffect(scrollToBottom, [messages]);

    const fetchChatHistory = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/chat/${chatId}`);
            if (response.data.success) {
                setMessages(response.data.data.chat.messages || []);
            }
        } catch (error) {
            console.error('Error fetching chat:', error);
        } finally {
            setLoading(false);
        }
    };

    const userMessagesCount = messages.filter(m => m.role === 'user').length;
    const isLimitReached = userMessagesCount >= 2;

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || sending || !chatId || isLimitReached) return;

        const userMsg = { role: 'user', content: input.trim() };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setSending(true);

        try {
            const response = await api.post(`/chat/${chatId}/message`, {
                content: userMsg.content,
                cvAnalysisId: cvAnalysisId
            });

            if (response.data.success) {
                const { assistantMessage } = response.data.data;
                setMessages((prev) => [...prev, assistantMessage]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages((prev) => [...prev, {
                role: 'assistant',
                content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.'
            }]);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="animate-spin text-orange-accent" size={32} />
                <p className={isDarkMode ? 'text-dark-muted' : 'text-light-muted'}>Cargando conversación...</p>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-[600px] card-premium border-l-2 border-orange-accent/60 transition-all duration-300 ${isDarkMode ? '' : 'bg-white border-light-border shadow-gray-200'}`}>
            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'border-dark-border bg-dark-card/50' : 'border-light-border bg-light-bg/50'} backdrop-blur-md`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-accent/20 flex items-center justify-center">
                        <Wand2 className="text-orange-accent" size={24} />
                    </div>
                    <div>
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-light-text'}`}>Asistente Lär University</h3>
                        <p className="text-xs text-green-500 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> En línea
                        </p>
                    </div>
                </div>
                {chatId && (
                    <div className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${isDarkMode ? 'bg-dark-border text-dark-muted' : 'bg-light-border text-light-muted'}`}>
                        Consultas: {userMessagesCount}/2
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-gradient-to-b from-transparent to-orange-accent/[0.02]">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                        <div className="bg-orange-accent/10 p-6 rounded-3xl mb-2 border border-orange-accent/20">
                            <Sparkles className="text-orange-accent" size={48} />
                        </div>
                        <div>
                            <p className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-light-text'}`}>ASISTENTE LÄR</p>
                            <p className={`text-sm max-w-xs leading-relaxed ${isDarkMode ? 'text-dark-muted' : 'text-light-muted'}`}>
                                Comencemos a trazar tu ruta. Analiza tu CV para recibir asesoría personalizada sobre tu futuro profesional.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                            >
                                <div
                                    className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-1 border ${msg.role === 'user' ? 'bg-orange-accent text-white border-orange-hover outline outline-2 outline-orange-accent/20' : isDarkMode ? 'bg-dark-card text-orange-accent border-dark-border shadow-md' : 'bg-light-bg text-orange-accent border-light-border'
                                        }`}>
                                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                    </div>
                                    <div
                                        className={`p-4 rounded-2xl text-[13px] font-medium leading-[1.6] transition-all ${msg.role === 'user'
                                            ? 'bg-orange-accent text-white rounded-tr-none shadow-xl shadow-orange-accent/20'
                                            : isDarkMode ? 'bg-dark-card/60 text-stone-200 rounded-tl-none border border-border/80 shadow-lg' : 'bg-light-bg text-light-text rounded-tl-none border border-light-border'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLimitReached && (
                            <div className="p-4 bg-orange-accent/5 border border-orange-accent/20 rounded-2xl text-center text-xs text-orange-accent font-black tracking-wide">
                                HAS ALCANZADO EL LÍMITE DE CONSULTAS. ¡ES HORA DE ACTUAR!
                            </div>
                        )}
                    </>
                )}
                {sending && (
                    <div className="flex justify-start">
                        <div className="flex gap-3 max-w-[80%]">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mt-1 border ${isDarkMode ? 'bg-dark-card border-dark-border' : 'bg-light-bg border-light-border'}`}>
                                <Bot size={16} className="text-orange-accent" />
                            </div>
                            <div className={`px-4 py-3 rounded-2xl text-sm rounded-tl-none border flex items-center gap-2 ${isDarkMode ? 'bg-dark-card/60 text-dark-text border-dark-border' : 'bg-light-bg text-light-text border-light-border'}`}>
                                <div className="flex gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-orange-accent/60 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-orange-accent/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-1.5 h-1.5 bg-orange-accent/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className={`p-4 border-t transition-colors duration-300 ${isDarkMode ? 'border-dark-border bg-dark-card/30' : 'border-light-border bg-light-bg/30'}`}>
                <div className="relative flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={!chatId ? "Analiza un archivo para chatear..." : isLimitReached ? "Límite de consultas alcanzado" : "Escribe tu duda aquí..."}
                        className={`input-field pr-12 h-12 disabled:opacity-50 disabled:cursor-not-allowed ${!isDarkMode ? 'bg-white text-light-text border-light-border' : ''}`}
                        disabled={sending || !chatId || isLimitReached}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || sending || !chatId || isLimitReached}
                        className="absolute right-2 p-2 text-orange-accent hover:bg-orange-accent/10 rounded-lg transition-all disabled:opacity-50 disabled:scale-90"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatComponent;
