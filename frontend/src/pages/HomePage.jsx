import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import api from '../services/api';
import ChatComponent from '../components/ChatComponent';
import { useTheme } from '../context/ThemeContext';

const HomePage = () => {
    const { isDarkMode } = useTheme();
    const location = useLocation();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [chatId, setChatId] = useState(location.state?.openChatId || null);
    const [error, setError] = useState('');

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
        if (!file) return;

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('cv', file);

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
                    title: `Consulta: ${file.name}`,
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

    return (
        <div className="space-y-8 animate-in fade-in duration-700 relative z-10">
            <header className="space-y-4">
                <p className="text-orange-accent font-black tracking-[0.3em] text-[10px]">NO SIGAS RUTAS. TRAZA LA TUYA.</p>
                <h1 className={`font-['Bebas_Neue'] leading-[0.88] tracking-[-1px] mb-4 ${isDarkMode ? 'text-white' : 'text-light-text'}`} style={{ fontSize: 'clamp(72px, 9vw, 120px)' }}>
                    IMPULSA TU <span className="text-[#ff5c1a]" style={{ textShadow: '0 0 60px rgba(255,92,26,0.35)' }}>CARRERA</span> <br className="hidden md:block" /> PROFESIONAL.
                </h1>
                <p className="text-[#888] font-light text-sm max-w-2xl">
                    Analizamos tu potencial con inteligencia artificial para recomendarte el camino hacia la élite profesional.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Upload or Summary */}
                <div className="lg:col-span-1 space-y-6">
                    {!analysis ? (
                        <div className={`card-premium-left transition-all duration-500 flex flex-col items-center justify-center py-12 text-center group h-[600px] ${isDarkMode ? 'border-orange-accent/20 hover:border-orange-accent/50' : 'border-light-border hover:border-orange-accent/50 bg-white'}`}>
                            <div className={`p-6 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-500 ${isDarkMode ? 'bg-orange-accent/10' : 'bg-orange-accent/5'}`}>
                                <Upload className="text-orange-accent" size={48} />
                            </div>

                            <div className="space-y-6 px-8 relative z-10">
                                <div>
                                    <h3 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-light-text'}`}>ANÁLISIS DE ÉLITE</h3>
                                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-dark-muted' : 'text-light-muted'}`}>
                                        Sube tu Hoja de Vida en PDF para obtener una auditoría de perfil personalizada.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <label className="btn-primary w-full cursor-pointer">
                                        <FileText size={20} />
                                        <span>{file ? file.name : 'SELECCIONAR PDF'}</span>
                                        <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                                    </label>

                                    {file && (
                                        <button
                                            onClick={handleUpload}
                                            disabled={uploading}
                                            className="btn-secondary w-full group"
                                        >
                                            {uploading ? <Loader2 className="animate-spin" size={20} /> : (
                                                <>
                                                    <Sparkles size={20} className="text-orange-accent" />
                                                    <span className="font-bold">TRAZAR RUTA</span>
                                                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-left duration-500 space-y-6">
                            <div className={`card ${isDarkMode ? 'border-green-500/20 bg-green-500/5' : 'border-green-500/30 bg-green-50/50'}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <CheckCircle className="text-green-500" size={20} />
                                    <h3 className="font-bold text-green-500">Hoja de Vida Analizada</h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className={`text-xs uppercase font-bold mb-1 ${isDarkMode ? 'text-dark-muted' : 'text-light-muted'}`}>Rol Detectado</p>
                                        <p className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-light-text'}`}>{analysis.extractedProfile?.currentRole || 'Profesional'}</p>
                                    </div>
                                    <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-dark-bg border-dark-border' : 'bg-light-bg border-light-border'}`}>
                                        <p className="text-xs text-orange-accent font-bold mb-1">SPRINT RECOMENDADO:</p>
                                        <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-dark-text' : 'text-light-text'}`}>{analysis.recommendation?.primarySpecialization}</p>
                                    </div>
                                    {analysis.recommendation?.sprintUrl && (
                                        <a
                                            href={analysis.recommendation.sprintUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`btn-secondary w-full text-center text-xs py-2 block ${!isDarkMode ? 'bg-light-bg text-light-text border-light-border' : ''}`}
                                        >
                                            Ver detalles del Sprint
                                        </a>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => { setAnalysis(null); setFile(null); setChatId(null); }}
                                className={`w-full text-center text-sm transition-colors ${isDarkMode ? 'text-dark-muted hover:text-white' : 'text-light-muted hover:text-light-text'}`}
                            >
                                ← Analizar otra Hoja de Vida
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Chat Component (Always Present) */}
                <div className="lg:col-span-2">
                    <ChatComponent chatId={chatId} cvAnalysisId={analysis?.id} />
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 animate-in slide-in-from-bottom">
                    <AlertCircle size={20} />
                    <p className="text-sm">{error}</p>
                </div>
            )}
        </div>
    );
};

export default HomePage;
