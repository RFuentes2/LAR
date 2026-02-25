import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Sparkles, ArrowRight, BookOpen, Layers, Terminal, TrendingUp, ShieldCheck, Award } from 'lucide-react';
import api from '../services/api';
import ChatComponent from '../components/ChatComponent';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const MASTERS = [
    { id: 'MINTEAR', name: 'MINTEAR', desc: 'Master in Intelligence' },
    { id: 'MTECMBA', name: 'MTECMBA', desc: 'Tech Management MBA' },
    { id: 'DATALAR-MBA', name: 'DATALAR-MBA', desc: 'Data Driven MBA' }
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
    { text: "TU VOLUNTAD ES EL ÚNICO LÍMITE.", color: "rgb(238, 85, 34)" }, // Naranja
    { text: "ESTRATEGIA, VISIÓN Y ACCIÓN.", color: "rgb(132, 193, 193)" }, // Verde azulado
    { text: "EL ÉXITO ES UN HÁBITO, NO UN ACTO.", color: "rgb(80, 165, 132)" } // Verde
];

const HomePage = () => {
    const { isDarkMode } = useTheme();
    const { user } = useAuth();
    const location = useLocation();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [chatId, setChatId] = useState(location.state?.openChatId || null);
    const [error, setError] = useState('');
    const [selectedMaster, setSelectedMaster] = useState(null);
    const [phraseIndex, setPhraseIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPhraseIndex((prev) => (prev + 1) % MOTIVATIONAL_PHRASES.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (location.state?.openChatId) {
            setChatId(location.state.openChatId);
            setAnalysis({
                id: 'existing',
                extractedProfile: { currentRole: 'Historial' },
                recommendation: { primarySpecialization: 'Revisando historial...' }
            });
        }
    }, [location.state]);

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
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 relative z-10">
            <header className="space-y-2 text-center md:text-left">
                <p className="font-black tracking-[0.4em] text-[11px] uppercase" style={{ color: 'rgb(132, 193, 193)' }}>Domina tu destino profesional</p>
                <h1 className={`font-['Bebas_Neue'] leading-[0.88] tracking-[-2px] ${isDarkMode ? 'text-white' : 'text-light-text'}`} style={{ fontSize: 'clamp(55px, 8vw, 90px)' }}>
                    TRAZA TU <span style={{ color: 'rgb(238, 85, 34)', textShadow: '0 0 30px rgba(238, 85, 34, 0.3)' }}>FUTURO</span>.
                </h1>

                {/* Animated Phrases with custom colors */}
                <div className="h-8 flex items-center justify-center md:justify-start overflow-hidden">
                    <p
                        key={phraseIndex}
                        className="text-[11px] font-black uppercase tracking-[0.25em] animate-in slide-in-from-bottom duration-700 fade-in"
                        style={{ color: MOTIVATIONAL_PHRASES[phraseIndex].color }}
                    >
                        {MOTIVATIONAL_PHRASES[phraseIndex].text}
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Chat Component (Larger) */}
                <div className="lg:col-span-8">
                    <ChatComponent
                        chatId={chatId}
                        cvAnalysisId={analysis?.id}
                        userName={user?.name || user?.email?.split('@')[0]}
                        selectedMaster={selectedMaster}
                        sprints={SPRINTS.map(s => s.title)}
                    />
                </div>

                {/* Right: Master Selector and CV Upload / Routes (Expanded prominence) */}
                <div className="lg:col-span-4 space-y-6">
                    {!analysis ? (
                        <div className={`card-premium transition-all duration-500 overflow-hidden ${isDarkMode ? 'border-none bg-[#282828]' : 'border-light-border bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)]'}`}>
                            {!selectedMaster ? (
                                <div className="p-8 space-y-6 animate-in fade-in slide-in-from-right duration-500">
                                    <div className="space-y-2">
                                        <h3 className={`text-xl font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-light-text'}`}>1. ELEGIR MASTER</h3>
                                        <div className="h-1 w-12" style={{ backgroundColor: 'rgb(238, 85, 34)' }}></div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {MASTERS.map((m) => (
                                            <button
                                                key={m.id}
                                                onClick={() => setSelectedMaster(m.id)}
                                                className={`p-5 rounded-2xl border-2 text-left transition-all group relative overflow-hidden ${isDarkMode
                                                    ? 'bg-[#292929] border-[#404040] hover:border-[rgb(238,85,34)] text-white'
                                                    : 'bg-stone-50 border-stone-200 hover:border-[rgb(238,85,34)] text-light-text'
                                                    }`}
                                            >
                                                <div className="relative z-10 flex items-center justify-between">
                                                    <div>
                                                        <span className="block font-black text-base tracking-tight">{m.name}</span>
                                                        <span className={`text-[9px] font-bold opacity-60 uppercase tracking-[0.15em]`}>{m.desc}</span>
                                                    </div>
                                                    <ArrowRight size={16} style={{ color: 'rgb(238, 85, 34)' }} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 space-y-8 animate-in zoom-in-95 duration-500">
                                    <div className="flex items-center justify-between border-b border-orange-accent/10 pb-6">
                                        <button
                                            onClick={() => setSelectedMaster(null)}
                                            className="text-[10px] font-black hover:opacity-70 tracking-widest uppercase transition-opacity"
                                            style={{ color: 'rgb(238, 85, 34)' }}
                                        >
                                            ← CAMBIAR MASTER
                                        </button>
                                        <span className="text-[10px] font-black py-1.5 px-4 rounded-full text-white uppercase tracking-widest" style={{ backgroundColor: 'rgb(238, 85, 34)' }}>{selectedMaster}</span>
                                    </div>

                                    <div className="flex flex-col items-center text-center space-y-6">
                                        <div className="relative group">
                                            <div className="absolute inset-0 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: 'rgb(238, 85, 34)' }}></div>
                                            <div className="relative w-24 h-24 rounded-full flex items-center justify-center border-2 border-dashed transition-all transform group-hover:rotate-12" style={{ borderColor: 'rgb(238, 85, 34)', backgroundColor: isDarkMode ? 'rgba(238, 85, 34, 0.05)' : 'white' }}>
                                                <Upload style={{ color: 'rgb(238, 85, 34)' }} size={36} />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-light-text'}`}>SUBIR HOJA DE VIDA</h3>
                                            <p className={`text-xs font-bold leading-relaxed px-4 opacity-60 uppercase tracking-widest`}>
                                                Analizaremos tu perfil para trazar el camino a la élite.
                                            </p>
                                        </div>

                                        <div className="w-full space-y-4">
                                            <label className="flex items-center justify-center gap-3 w-full cursor-pointer h-16 rounded-2xl border-2 font-black text-xs tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95"
                                                style={{
                                                    backgroundColor: isDarkMode ? '#292929' : 'white',
                                                    borderColor: file ? 'rgb(238, 85, 34)' : isDarkMode ? '#404040' : '#E4E5E2',
                                                    color: file ? 'rgb(238, 85, 34)' : isDarkMode ? 'white' : '#2D2926'
                                                }}>
                                                <FileText size={20} />
                                                <span className="truncate">{file ? file.name : 'SELECCIONAR PDF'}</span>
                                                <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                                            </label>

                                            {file && (
                                                <button
                                                    onClick={handleUpload}
                                                    disabled={uploading}
                                                    className="w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-black text-xs tracking-[0.3em] text-white transition-all hover:shadow-[0_10px_30px_rgba(238,85,34,0.4)] active:scale-95 disabled:grayscale"
                                                    style={{ backgroundColor: 'rgb(238, 85, 34)' }}
                                                >
                                                    {uploading ? <Loader2 className="animate-spin" size={20} /> : (
                                                        <>
                                                            <Sparkles size={20} />
                                                            <span>TRAZAR RUTA</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-500 space-y-6">
                            <div className={`p-6 rounded-[2rem] relative overflow-hidden ${isDarkMode ? 'bg-[#282828]' : 'bg-white shadow-xl'}`}>
                                <div className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: 'rgb(238, 85, 34)' }}></div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: 'rgb(238, 85, 34)' }}>
                                        <CheckCircle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg tracking-tighter italic uppercase">RUTA ACTIVADA</h3>
                                        <p className="text-[10px] font-black tracking-widest opacity-60" style={{ color: 'rgb(238, 85, 34)' }}>{selectedMaster}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Interconnected Path Visualization */}
                            <div className="relative pl-6 space-y-0">
                                {/* Connecting Line */}
                                <div className="absolute left-[34px] top-6 bottom-6 w-[3px] bg-gradient-to-b from-[rgb(238,85,34)] via-[rgb(132,193,193)] to-[rgb(80,165,132)] opacity-30"></div>

                                <h4 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-6 pl-4 ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>Sprints de Élite Interconectados</h4>

                                <div className="space-y-3">
                                    {SPRINTS.map((sprint, idx) => (
                                        <div
                                            key={idx}
                                            className="group flex items-center gap-5 relative animate-in slide-in-from-right duration-700"
                                            style={{ animationDelay: `${idx * 150}ms` }}
                                        >
                                            {/* Node */}
                                            <div className="relative z-10 flex-shrink-0">
                                                <div className="w-5 h-5 rounded-full border-4 transition-all duration-500 group-hover:scale-125 group-hover:shadow-[0_0_15px_rgba(238,85,34,0.5)]"
                                                    style={{
                                                        borderColor: 'rgb(238, 85, 34)',
                                                        backgroundColor: idx === 0 ? 'rgb(238, 85, 34)' : isDarkMode ? '#282828' : 'white'
                                                    }}>
                                                </div>
                                            </div>

                                            {/* Sprint Card */}
                                            <div className={`flex-1 p-4 rounded-2xl border-2 transition-all duration-500 group-hover:-translate-y-1 ${isDarkMode ? 'bg-[#292929] border-[#404040]' : 'bg-white border-stone-100 shadow-sm'
                                                } group-hover:border-[rgb(238,85,34)]/40 relative overflow-hidden`}>
                                                <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 rotate-12 group-hover:scale-175 transition-transform">
                                                    {sprint.icon}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[13px] font-black italic tracking-tighter uppercase" style={{ color: isDarkMode ? 'white' : '#2D2926' }}>
                                                        SPRINT {idx + 1}: <span className="group-hover:text-[rgb(238,85,34)] transition-colors">{sprint.title}</span>
                                                    </span>
                                                </div>
                                                <div className="h-[2px] w-0 group-hover:w-full transition-all duration-700 mt-2" style={{ backgroundColor: 'rgb(238, 85, 34)' }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={resetFlow}
                                className={`w-full text-center text-[10px] font-black uppercase tracking-[0.5em] opacity-40 hover:opacity-100 transition-opacity pt-4`}
                            >
                                ← NUEVA RUTA
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="fixed bottom-10 right-10 flex items-center gap-4 p-5 backdrop-blur-xl border-l-4 rounded-2xl text-white shadow-2xl animate-in fade-in zoom-in-95 z-50 max-w-sm"
                    style={{ backgroundColor: 'rgba(175, 39, 46, 0.9)', borderColor: 'rgb(238, 85, 34)' }}>
                    <AlertCircle size={24} />
                    <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes progress-fast {
                    from { width: 0; }
                    to { width: 100%; }
                }
                .animate-progress-fast {
                    animation: progress-fast 1s ease-out forwards;
                }
            `}} />
        </div>
    );
};

export default HomePage;
