import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import api from '../services/api';
import ChatComponent from '../components/ChatComponent';

const HomePage = () => {
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
        <div className="space-y-8 animate-in fade-in duration-700">
            <header>
                <h1 className="text-3xl font-bold mb-2">Hola, 👋</h1>
                <p className="text-dark-muted">Sube tu Hoja de Vida (CV) para que nuestra IA la analice y te recomiende tu próximo Sprint profesional.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Upload or Summary */}
                <div className="lg:col-span-1 space-y-6">
                    {!analysis ? (
                        <div className="card border-dashed border-2 border-dark-border hover:border-orange-accent/50 transition-colors flex flex-col items-center justify-center py-12 text-center group h-[600px]">
                            <div className="bg-dark-border p-5 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Upload className="text-dark-muted group-hover:text-orange-accent" size={40} />
                            </div>
                            <div className="space-y-4 px-6">
                                <h3 className="text-xl font-semibold">Análisis Profesional</h3>
                                <p className="text-dark-muted text-sm italic">Sube tu Hoja de Vida en PDF para comenzar la asesoría personalizada.</p>

                                <div className="flex flex-col items-center gap-4">
                                    <label className="btn-secondary flex items-center gap-2 cursor-pointer w-full justify-center truncate">
                                        <FileText size={18} />
                                        <span className="truncate max-w-[120px]">{file ? file.name : 'Seleccionar PDF'}</span>
                                        <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                                    </label>

                                    {file && (
                                        <button
                                            onClick={handleUpload}
                                            disabled={uploading}
                                            className="btn-primary w-full flex items-center justify-center gap-2"
                                        >
                                            {uploading ? <Loader2 className="animate-spin" size={20} /> : <><Sparkles size={18} /><span>Analizar CV</span></>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-left duration-500 space-y-6">
                            <div className="card border-green-500/20 bg-green-500/5">
                                <div className="flex items-center gap-3 mb-4">
                                    <CheckCircle className="text-green-500" size={20} />
                                    <h3 className="font-bold text-green-500">Hoja de Vida Analizada</h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-dark-muted uppercase font-bold mb-1">Rol Detectado</p>
                                        <p className="font-semibold text-lg">{analysis.extractedProfile?.currentRole || 'Profesional'}</p>
                                    </div>
                                    <div className="p-4 bg-dark-bg rounded-xl border border-dark-border">
                                        <p className="text-xs text-orange-accent font-bold mb-1">SPRINT RECOMENDADO:</p>
                                        <p className="text-sm font-medium leading-relaxed">{analysis.recommendation?.primarySpecialization}</p>
                                    </div>
                                    {analysis.recommendation?.sprintUrl && (
                                        <a
                                            href={analysis.recommendation.sprintUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-secondary w-full text-center text-xs py-2 block"
                                        >
                                            Ver detalles del Sprint
                                        </a>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => { setAnalysis(null); setFile(null); setChatId(null); }}
                                className="w-full text-center text-sm text-dark-muted hover:text-white transition-colors"
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
