import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Wand2 } from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const SUGGESTED_QUESTIONS = [
    "¿De qué se trata el sprint?",
    "¿Cuál es el sprint 1?",
    "¿Por qué elegiste esta ruta?",
    "¿Qué habilidades desarrollaré?"
];

const ChatComponent = ({ chatId, cvAnalysisId, userName, selectedMaster, sprints }) => {
    const { isDarkMode } = useTheme();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const lastHandledAnalysisId = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (chatId) {
            fetchChatHistory();
        }
    }, [chatId]);

    // Handle automatic greeting when analysis is ready
    useEffect(() => {
        if (cvAnalysisId && cvAnalysisId !== lastHandledAnalysisId.current && chatId) {
            const welcomeText = `Hola ${userName || 'estudiante'}, es un gusto saludarte. Ya que perteneces al master ${selectedMaster}, tu ruta ideal para completar tu camino de excelencia es:\n\n${sprints.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n¿En qué sprint te gustaría profundizar hoy?`;

            // Artificial delay to feel natural after analysis
            setTimeout(() => {
                setMessages(prev => {
                    // Avoid duplicating if already present
                    if (prev.some(m => m.content.includes(welcomeText.substring(0, 20)))) return prev;
                    return [...prev, { role: 'assistant', content: welcomeText }];
                });
                lastHandledAnalysisId.current = cvAnalysisId;
            }, 1000);
        }
    }, [cvAnalysisId, chatId, userName, selectedMaster, sprints]);

    useEffect(scrollToBottom, [messages]);

    const fetchChatHistory = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/chat/${chatId}`);
            if (response.data.success) {
                const history = response.data.data.chat.messages || [];
                setMessages(history);
            }
        } catch (error) {
            console.error('Error fetching chat:', error);
        } finally {
            setLoading(false);
        }
    };

    const userMessagesCount = messages.filter(m => m.role === 'user').length;
    const isLimitReached = userMessagesCount >= 2;

    const handleSendMessage = async (e, textOverride = null) => {
        if (e) e.preventDefault();
        const content = textOverride || input;
        if (!content.trim() || sending || !chatId || isLimitReached) return;

        const userMsg = { role: 'user', content: content.trim() };
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

    const handleSuggestionClick = (question) => {
        handleSendMessage(null, question);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4 h-full bg-card/5 rounded-3xl animate-pulse">
                <Loader2 className="animate-spin text-orange-accent" size={32} />
                <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-dark-muted' : 'text-light-muted'}`}>Sincronizando con LÄR AI...</p>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-full min-h-[600px] border-l-4 border-orange-accent/60 transition-all duration-500 overflow-hidden relative rounded-3xl shadow-2xl ${isDarkMode ? 'bg-[#1C1917]/40 border-[#2E2925]' : 'bg-white border-light-border'}`}>
            {/* Header */}
            <div className={`p-5 border-b flex items-center justify-between ${isDarkMode ? 'border-dark-border bg-dark-card/30' : 'border-light-border bg-light-bg/30'} backdrop-blur-xl z-20`}>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-orange-accent/10 flex items-center justify-center border border-orange-accent/20">
                            <Bot className="text-orange-accent" size={28} />
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#1C1917] rounded-full animate-pulse"></span>
                    </div>
                    <div>
                        <h3 className={`font-black tracking-tight text-lg ${isDarkMode ? 'text-white' : 'text-light-text'}`}>LÄR <span className="text-orange-accent italic">AI</span></h3>
                        <p className={`text-[9px] uppercase font-bold tracking-[0.2em] ${isDarkMode ? 'text-dark-muted' : 'text-light-muted'}`}>Compañero de Élite</p>
                    </div>
                </div>
                {chatId && (
                    <div className={`text-[9px] uppercase tracking-widest font-black px-3 py-1.5 rounded-xl border ${isDarkMode ? 'bg-orange-accent/10 border-orange-accent/20 text-orange-accent' : 'bg-orange-accent/5 border-orange-accent/10 text-orange-accent'}`}>
                        Potencial Analizado: {userMessagesCount}/2
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-orange-accent blur-3xl opacity-10 animate-pulse"></div>
                            <div className="relative bg-orange-accent/10 p-8 rounded-[2rem] border border-orange-accent/20">
                                <Sparkles className="text-orange-accent" size={56} />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className={`text-3xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-light-text'}`}>COMIENZA EL VIAJE</p>
                            <p className={`text-xs max-w-xs mx-auto leading-relaxed font-medium uppercase tracking-widest opacity-60 ${isDarkMode ? 'text-dark-muted' : 'text-light-muted'}`}>
                                Tu futuro no es cuestión de suerte, es cuestión de estrategia.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}
                            >
                                <div className={`flex gap-4 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center mt-1 border ${msg.role === 'user'
                                        ? 'bg-orange-accent text-white border-orange-hover outline outline-4 outline-orange-accent/10'
                                        : isDarkMode ? 'bg-dark-card text-orange-accent border-dark-border shadow-md' : 'bg-light-bg text-orange-accent border-light-border'
                                        }`}>
                                        {msg.role === 'user' ? <User size={18} /> : <Wand2 size={18} />}
                                    </div>
                                    <div
                                        className={`p-5 rounded-[1.5rem] text-[13px] font-bold leading-[1.6] transition-all whitespace-pre-wrap ${msg.role === 'user'
                                            ? 'bg-orange-accent text-white rounded-tr-none shadow-xl shadow-orange-accent/10'
                                            : isDarkMode ? 'bg-dark-card border-l-4 border-l-orange-accent text-stone-200 rounded-tl-none border-y border-r border-[#2E2925] shadow-xl' : 'bg-stone-50 text-light-text rounded-tl-none border border-light-border'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}
                {sending && (
                    <div className="flex justify-start animate-pulse">
                        <div className="flex gap-4 max-w-[80%]">
                            <div className="w-9 h-9 rounded-xl bg-orange-accent/10 border border-orange-accent/20 flex items-center justify-center">
                                <Loader2 size={18} className="text-orange-accent animate-spin" />
                            </div>
                            <div className={`px-5 py-4 rounded-3xl rounded-tl-none border ${isDarkMode ? 'bg-dark-card border-dark-border' : 'bg-light-bg border-light-border'}`}>
                                <div className="flex gap-2">
                                    <span className="w-1.5 h-1.5 bg-orange-accent/40 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-orange-accent/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-1.5 h-1.5 bg-orange-accent/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Actions & Input */}
            <div className={`p-6 border-t ${isDarkMode ? 'border-dark-border bg-dark-card/20' : 'border-light-border bg-light-bg/20'} space-y-4`}>
                {/* Suggestions */}
                {chatId && !isLimitReached && !sending && messages.length > 0 && (
                    <div className="flex flex-wrap gap-2 animate-in fade-in duration-700">
                        {SUGGESTED_QUESTIONS.map((q, i) => (
                            <button
                                key={i}
                                onClick={() => handleSuggestionClick(q)}
                                className={`text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-full border transition-all hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-dark-card border-dark-border text-dark-muted hover:border-orange-accent hover:text-orange-accent'
                                        : 'bg-white border-light-border text-light-muted hover:border-orange-accent hover:text-orange-accent'
                                    }`}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="relative group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={!chatId ? "Analiza tu perfil para habilitar el chat..." : isLimitReached ? "HAS LLEGADO AL LÍMITE DE CONSULTAS" : "ESCRIBE TU DUDA AQUÍ..."}
                        className={`input-field pr-14 h-14 text-xs font-bold uppercase tracking-widest rounded-2xl border-2 transition-all shadow-lg ${!isDarkMode ? 'bg-white' : 'bg-[#12100E] border-stone-800 focus:border-orange-accent/50'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                        disabled={sending || !chatId || isLimitReached}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || sending || !chatId || isLimitReached}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-orange-accent text-white rounded-xl hover:bg-orange-hover hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:bg-stone-700"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatComponent;
