import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import api from '../services/api';

const ChatComponent = ({ chatId, cvAnalysisId }) => {
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
                <p className="text-dark-muted">Cargando conversación...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[600px] bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-dark-border bg-dark-card/50 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-accent/20 flex items-center justify-center">
                        <Bot className="text-orange-accent" size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold">Asesor EduAI</h3>
                        <p className="text-xs text-green-500 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> En línea
                        </p>
                    </div>
                </div>
                {chatId && (
                    <div className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-dark-border rounded-md text-dark-muted">
                        Consultas: {userMessagesCount}/2
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                        <div className="bg-orange-accent/10 p-5 rounded-full mb-2">
                            <Sparkles className="text-orange-accent" size={42} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white mb-2">Asistente EduAI</p>
                            <p className="text-sm text-dark-muted max-w-xs leading-relaxed">
                                Sube tu **Hoja de Vida (CV)** en el panel de la izquierda para que pueda analizar tu perfil y recomendarte el mejor **Sprint** para tu carrera.
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
                                    className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 outline outline-1 outline-dark-border ${msg.role === 'user' ? 'bg-orange-accent text-white' : 'bg-dark-card text-orange-accent'
                                        }`}>
                                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                    </div>
                                    <div
                                        className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-orange-accent text-white rounded-tr-none'
                                            : 'bg-dark-border/40 text-dark-text rounded-tl-none border border-dark-border/50'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLimitReached && (
                            <div className="p-3 bg-orange-accent/10 border border-orange-accent/20 rounded-xl text-center text-xs text-orange-accent font-medium">
                                Has alcanzado el límite de 2 consultas adicionales. ¡Damos el siguiente paso en tu carrera!
                            </div>
                        )}
                    </>
                )}
                {sending && (
                    <div className="flex justify-start">
                        <div className="flex gap-3 max-w-[80%]">
                            <div className="w-8 h-8 rounded-full bg-dark-card flex items-center justify-center mt-1 border border-dark-border">
                                <Bot size={16} className="text-orange-accent" />
                            </div>
                            <div className="p-3 rounded-2xl text-sm bg-dark-border/40 text-dark-text rounded-tl-none border border-dark-border/50 flex items-center gap-2">
                                <div className="flex gap-1">
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
            <form onSubmit={handleSendMessage} className="p-4 border-t border-dark-border bg-dark-card/30">
                <div className="relative flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={!chatId ? "Analiza un archivo para chatear..." : isLimitReached ? "Límite de consultas alcanzado" : "Escribe tu duda aquí..."}
                        className="input-field pr-12 h-12 disabled:opacity-50 disabled:cursor-not-allowed"
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
