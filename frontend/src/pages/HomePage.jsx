import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Sparkles, ArrowRight, BookOpen, Layers, Terminal, TrendingUp, ShieldCheck, Award, MessageSquare, Clock, ChevronRight, Plus, Trash2 } from 'lucide-react';
import api from '../services/api';
import ChatComponent from '../components/ChatComponent';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const MASTERS = [
    { id: 'MINTEAR', name: 'MINTEAR', desc: 'Master in Intelligence', color: 'rgb(255, 107, 53)' },
    { id: 'MTECMBA', name: 'MTECMBA', desc: 'Tech Management MBA', color: 'rgb(132, 193, 193)' },
    { id: 'DATALAR-MBA', name: 'DATALAR-MBA', desc: 'Data Driven MBA', color: 'rgb(80, 165, 132)' }
];

const SPRINTS = [
    { title: 'Fundamentos y Estrategia', icon: <BookOpen className="w-4 h-4" /> },
    { title: 'Implementación Técnica', icon: <Terminal className="w-4 h-4" /> },
    { title: 'Optimización y Escala', icon: <Layers className="w-4 h-4" /> },
    { title: 'Liderazgo y Gestión', icon: <TrendingUp className="w-4 h-4" /> },
    { title: 'Innovación Disruptiva', icon: <ShieldCheck className="w-4 h-4" /> },
    { title: 'Proyecto de Élite', icon: <Award className="w-4 h-4" /> }
];

const MOTIVATIONAL_PHRASES = [
    { text: "TU VOLUNTAD ES EL ÚNICO LÍMITE", color: "#F05A28", bg: "#1A1A1A" },
    { text: "ESTRATEGIA, VISIÓN Y ACCIÓN", color: "#FFFFFF", bg: "#F05A28" },
    { text: "EL ÉXITO ES UN HÁBITO", color: "#F05A28", bg: "#000000" }
];

const HomePage = () => {
    const { isDarkMode } = useTheme();
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [chatId, setChatId] = useState(location.state?.openChatId || null);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState('');
    const [selectedMaster, setSelectedMaster] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentPhrase, setCurrentPhrase] = useState(0);

    // Rotate phrases randomly
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentPhrase((prev) => (prev + 1) % MOTIVATIONAL_PHRASES.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Force scroll to top on mount
    useEffect(() => {
        const forceScroll = () => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        };

        forceScroll();
        const timeout = setTimeout(forceScroll, 100);

        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (location.state?.openChatId) {
            setChatId(location.state.openChatId);
            setAnalysis({
                id: 'existing',
                extractedProfile: { currentRole: 'Historial' },
                recommendation: { primarySpecialization: 'Revisando historial...' }
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [location.state]);

    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [user, chatId]);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/chat');
            if (res.data.success) {
                setHistory(res.data.data.chats);
            }
        } catch (err) {
            console.error('Error fetching history:', err);
        }
    };

    const handleDeleteChat = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('¿Eliminar esta conversación?')) return;
        try {
            await api.delete(`/chat/${id}`);
            if (chatId === id) setChatId(null);
            fetchHistory();
        } catch (err) {
            console.error('Error deleting chat:', err);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const ext = selectedFile.name.split('.').pop().toLowerCase();
            if (['pdf'].includes(ext)) {
                setFile(selectedFile);
                setError('');
            } else {
                setError('Por favor sube un archivo PDF válido (Hoja de Vida)');
                setFile(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!file || !selectedMaster) return;

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('cv', file);
        formData.append('master', selectedMaster);

        try {
            const uploadRes = await api.post('/cv/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (uploadRes.data.success) {
                const { cvAnalysisId, profile, recommendation } = uploadRes.data.data;
                const analysisData = {
                    id: cvAnalysisId,
                    extractedProfile: profile,
                    recommendation: recommendation
                };
                setAnalysis(analysisData);

                const chatRes = await api.post('/chat', {
                    title: `Consulta ${selectedMaster}: ${file.name}`,
                    cvAnalysisId: cvAnalysisId
                });

                if (chatRes.data.success) {
                    setChatId(chatRes.data.data.chat.id);
                }
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al procesar el archivo';
            setError(msg);
        } finally {
            setUploading(false);
        }
    };

    const resetFlow = () => {
        setAnalysis(null);
        setFile(null);
        setChatId(null);
        setSelectedMaster(null);
        window.scrollTo({ top: 0, behavior: 'instant' });
    };

    const currentStep = analysis ? 3 : selectedMaster ? 2 : 1;

    return (
        <div className="flex w-full min-h-[calc(100vh-120px)] relative overflow-hidden bg-transparent">
            {/* 1. Solid Sidebar - Estilo Gemini/ChatGPT (Sin márgenes) */}
            <aside
                className={`sidebar-transition flex-shrink-0 bg-white dark:bg-[#0A0A0A] border-r border-stone-200 dark:border-white/5 relative z-[60] overflow-hidden ${isSidebarOpen ? 'w-72 opacity-100 p-6' : 'w-0 opacity-0 p-0'}`}
                style={{ marginLeft: 0 }}
            >
                <div className="h-full flex flex-col space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">HISTORIAL</h3>
                        <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-orange-accent/10 rounded-lg text-orange-accent transition-all">
                            <Plus className="rotate-45" size={18} />
                        </button>
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                        {history.length > 0 ? (
                            history.map((chat) => (
                                <div key={chat.id} className="group relative">
                                    <button
                                        onClick={() => {
                                            setChatId(chat.id);
                                            setAnalysis({
                                                id: 'existing',
                                                extractedProfile: { currentRole: 'Historial' },
                                                recommendation: { primarySpecialization: 'Revisando historial...' }
                                            });
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 border ${chatId === chat.id ? 'bg-orange-accent/10 border-orange-accent/20 text-orange-accent' : 'border-transparent hover:bg-stone-100 dark:hover:bg-white/5 opacity-60 hover:opacity-100'}`}
                                    >
                                        <MessageSquare size={14} className="flex-shrink-0" />
                                        <p className="font-bold text-[9px] truncate uppercase tracking-tighter">{chat.title}</p>
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteChat(e, chat.id)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 opacity-20"><Clock size={24} className="mx-auto mb-2" /><p className="text-[8px] font-bold uppercase">Sin actividad</p></div>
                        )}
                    </div>

                    <button onClick={resetFlow} className="w-full py-4 rounded-xl bg-orange-accent text-white font-bold text-[10px] tracking-[0.2em] shadow-xl shadow-orange-accent/20 hover:scale-[1.01] active:scale-[0.99] transition-all">
                        NUEVA CONSULTA
                    </button>
                </div>
            </aside>

            {/* 2. Main Workspace */}
            <div className="flex-1 flex flex-col min-w-0 transform-gpu overflow-y-auto overflow-x-hidden">
                {/* 2a. Floating Trigger - Totalmente esquinado a la izquierda */}
                {!isSidebarOpen && (
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="fixed top-0 left-0 z-[100] w-12 h-12 rounded-br-2xl bg-orange-accent text-white shadow-2xl shadow-orange-accent/40 flex items-center justify-center hover:w-14 hover:h-14 transition-all animate-in fade-in slide-in-from-left-0 border-none m-0 p-0"
                    >
                        <Clock size={22} />
                    </button>
                )}

                <div className="w-full space-y-8 py-6 px-4 sm:px-8 lg:px-12 animate-in fade-in duration-700">
                    {/* Stepper - 5% Larger + White High-Visibility Line */}
                    <header className="w-full max-w-xl mx-auto mb-6">
                        <div className="flex items-center justify-between relative px-2">
                            <div className="absolute top-1/2 left-0 w-full h-[4px] -translate-y-1/2 bg-white shadow-[0_0_15px_rgba(255,255,255,0.6)] z-0 rounded-full"></div>
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="relative z-10 flex flex-col items-center gap-2.5">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border-2 ${currentStep >= s ? 'bg-orange-accent text-white border-orange-accent shadow-[0_0_15px_rgba(240,90,40,0.5)] scale-110' : 'bg-stone-900 border-white/10 text-stone-500'}`}>
                                        {s === 1 ? <BookOpen size={14} /> : s === 2 ? <Upload size={14} /> : <Sparkles size={14} />}
                                    </div>
                                    <span className={`text-[7px] font-bold tracking-[0.25em] transition-opacity uppercase ${currentStep === s ? 'opacity-100 text-orange-accent' : 'opacity-40 text-stone-400'}`}>
                                        {s === 1 ? 'MÁSTER' : s === 2 ? 'CV' : 'RUTA'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </header>

                    <div className="flex flex-col xl:flex-row gap-10 items-start">
                        {/* Chat Section - Focused Dimensions (Shorter) */}
                        <div className="flex-[1] h-[45vh] flex flex-col min-h-[380px]">
                            {/* Mantra text above chat */}
                            <div className="mb-3 pl-1 flex items-center gap-3">
                                <span className="text-[10px] font-bold tracking-[0.45em] text-white uppercase">TRAZA TU</span>
                                <span className="text-[10px] font-bold tracking-[0.45em] text-[#F05A28] uppercase">FUTURO</span>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-orange-accent/30 to-transparent"></div>
                            </div>
                            <div className="flex-1 bg-stone-900 dark:bg-[#0D0D0D] p-1 rounded-[2rem] border border-white/5">
                                <ChatComponent
                                    chatId={chatId}
                                    cvAnalysisId={analysis?.id}
                                    userName={user?.name || user?.email?.split('@')[0]}
                                    selectedMaster={selectedMaster}
                                    sprints={SPRINTS.map(s => s.title)}
                                />
                            </div>
                        </div>

                        {/* Masters Section - Scaled Up +5% (wider than chat) */}
                        <div className="flex-[1.05] xl:max-w-2xl space-y-8">
                            {!analysis ? (
                                <div className="space-y-8 animate-in slide-in-from-right duration-700">
                                    {!selectedMaster ? (
                                        <div className="space-y-6">
                                            {/* Solid Brand Color Rotator */}
                                            <div className="flex justify-center h-10 transition-all duration-500">
                                                <div
                                                    className="px-8 py-2 rounded-xl transition-all duration-700 flex items-center gap-4 shadow-2xl"
                                                    style={{
                                                        backgroundColor: MOTIVATIONAL_PHRASES[currentPhrase].bg === 'transparent' ? '#1A1A1A' : MOTIVATIONAL_PHRASES[currentPhrase].bg,
                                                        border: `1px solid ${MOTIVATIONAL_PHRASES[currentPhrase].color === '#F05A28' ? 'rgba(240, 90, 40, 0.4)' : 'rgba(255,255,255,0.1)'}`
                                                    }}
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: MOTIVATIONAL_PHRASES[currentPhrase].color }}></div>
                                                    <p
                                                        className="text-[10px] font-bold tracking-[0.35em] uppercase transition-all duration-700"
                                                        style={{ color: MOTIVATIONAL_PHRASES[currentPhrase].color }}
                                                    >
                                                        {MOTIVATIONAL_PHRASES[currentPhrase].text}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-[2px] bg-orange-accent rounded-full shadow-[0_0_10px_rgba(240,90,40,0.3)]"></div>
                                                <h2 className="text-4xl font-bold tracking-tighter uppercase leading-tight text-white">
                                                    SELECCIONA TU <span className="text-orange-accent italic">MÁSTER</span>
                                                </h2>
                                            </div>

                                            <div className="grid grid-cols-1 gap-5">
                                                {MASTERS.map((m, idx) => (
                                                    <button
                                                        key={m.id}
                                                        onClick={() => setSelectedMaster(m.id)}
                                                        className={`p-8 rounded-[2.5rem] border text-left transition-all duration-300 group relative overflow-hidden transform hover:-translate-y-1.5 bg-stone-900 border-white/5 hover:border-orange-accent/40 shadow-2xl`}
                                                    >
                                                        <div className="absolute top-0 right-0 w-36 h-36 blur-[70px] opacity-10 group-hover:opacity-30 transition-all" style={{ backgroundColor: m.color }}></div>
                                                        <div className="relative z-10 flex items-center justify-between">
                                                            <div className="flex items-center gap-6">
                                                                <span className="text-5xl opacity-5 group-hover:opacity-40 transition-all font-bold italic" style={{ color: m.color }}>
                                                                    {String(idx + 1).padStart(2, '0')}
                                                                </span>
                                                                <div className="space-y-1.5">
                                                                    <h4 className="text-xl font-bold uppercase tracking-tight italic text-white">{m.name}</h4>
                                                                    <p className="text-[9px] font-medium uppercase tracking-[0.15em] opacity-40 group-hover:opacity-80 text-white">{m.desc}</p>
                                                                </div>
                                                            </div>
                                                            <div className="w-10 h-10 rounded-2xl bg-orange-accent text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                                                                <ArrowRight size={20} />
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={`p-10 rounded-[3rem] border transition-all duration-500 relative overflow-hidden bg-[#0D0D0D] border-white/10 shadow-3xl`}>
                                            <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
                                                <button onClick={() => setSelectedMaster(null)} className="text-[10px] font-bold hover:text-orange-accent tracking-widest uppercase transition-all flex items-center gap-2 text-white/50">
                                                    ← VOLVER
                                                </button>
                                                <span className="text-[11px] font-bold py-2 px-6 rounded-full text-white uppercase tracking-widest bg-orange-accent shadow-[0_0_15px_rgba(240,90,40,0.4)]">{selectedMaster}</span>
                                            </div>

                                            <div className="flex flex-col items-center text-center space-y-10">
                                                <div className="relative group cursor-pointer" onClick={() => document.getElementById('cv-input').click()}>
                                                    <div className="absolute -inset-8 rounded-full blur-[70px] opacity-20 bg-orange-accent animate-pulse"></div>
                                                    <div className="relative w-32 h-32 rounded-[3rem] flex items-center justify-center border-2 border-dashed border-orange-accent/40 bg-orange-accent/5 hover:border-orange-accent transition-all hover:scale-105">
                                                        <Upload className="text-orange-accent" size={40} />
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <h3 className="text-3xl font-bold tracking-tight uppercase italic text-white">VINCULAR POTENCIAL</h3>
                                                    <p className="text-[11px] font-medium opacity-40 uppercase tracking-[0.25em] leading-relaxed text-white">Analizaremos tu trayectoria técnica <br /> para el despliegue de tu carrera.</p>
                                                </div>

                                                <div className="w-full space-y-5">
                                                    <label className={`flex items-center justify-center gap-4 w-full h-18 rounded-2xl border-2 font-bold text-[11px] tracking-widest transition-all cursor-pointer ${file ? 'border-orange-accent text-orange-accent bg-orange-accent/10' : 'border-white/5 bg-white/5 opacity-50 hover:opacity-100 text-white'}`}>
                                                        <FileText size={24} />
                                                        <span className="truncate max-w-[250px]">{file ? file.name : 'SELECCIONAR PDF'}</span>
                                                        <input id="cv-input" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                                                    </label>

                                                    {file && (
                                                        <button onClick={handleUpload} disabled={uploading} className="w-full h-18 rounded-2xl bg-orange-accent text-white font-bold text-[11px] tracking-[0.4em] shadow-[0_15px_30px_rgba(240,90,40,0.3)] hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                                                            {uploading ? <Loader2 className="animate-spin" size={24} /> : 'INICIAR ANÁLISIS'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
                                    <div className={`p-5 rounded-[2rem] border bg-[#0D0D0D] border-white/10 shadow-xl`}>
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-orange-accent flex items-center justify-center text-white shadow-lg shadow-orange-accent/30">
                                                <CheckCircle size={28} />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h3 className="text-xl font-bold tracking-tight uppercase italic text-white">PERFIL <span className="text-orange-accent">VALIDADO</span></h3>
                                                <p className="text-[9px] font-bold tracking-[0.3em] opacity-40 uppercase text-white">{selectedMaster}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div className="flex items-center gap-4 pl-6">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-accent shadow-[0_0_8px_rgba(240,90,40,0.8)]"></div>
                                            <p className="text-[11px] font-bold uppercase tracking-[0.45em] opacity-40 text-white">Hoja de Ruta</p>
                                        </div>
                                        <div className="space-y-4">
                                            {SPRINTS.map((sprint, idx) => (
                                                <div key={idx} className={`p-6 rounded-3xl border transition-all hover:border-orange-accent/40 bg-stone-900 border-white/5`}>
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-10 h-10 rounded-2xl bg-orange-accent/10 border border-orange-accent/20 text-orange-accent flex items-center justify-center text-sm font-bold italic">{idx + 1}</div>
                                                        <span className="text-sm font-bold italic tracking-tight uppercase text-white">{sprint.title}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button onClick={resetFlow} className="w-full py-6 text-[10px] font-bold uppercase tracking-[0.55em] opacity-30 hover:opacity-100 hover:text-orange-accent transition-all flex items-center justify-center gap-5 text-white">
                                        ↺ REINICIAR SISTEMA
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="fixed bottom-10 right-10 flex items-center gap-6 p-10 bg-[#0D0D0D] border-l-[10px] border-orange-accent rounded-[3.5rem] text-white shadow-[0_50px_100px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-10 duration-500 z-[100] max-w-lg">
                    <div className="w-16 h-16 rounded-full bg-orange-accent/10 flex items-center justify-center flex-shrink-0 border border-orange-accent/20">
                        <AlertCircle size={32} className="text-orange-accent" />
                    </div>
                    <div>
                        <h4 className="font-bold text-[11px] tracking-widest uppercase mb-1.5 text-orange-accent">SISTEMA LÄR</h4>
                        <p className="text-[13px] font-medium uppercase tracking-wider leading-relaxed opacity-90">{error}</p>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(240, 90, 40, 0.3);
                    border-radius: 10px;
                }
            `}} />
        </div>
    );
};

export default HomePage;
