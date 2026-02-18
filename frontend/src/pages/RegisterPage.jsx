import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Las contraseñas no coinciden');
        }

        setLoading(true);

        try {
            const result = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            if (result.success) {
                navigate('/');
            } else {
                setError(result.message || 'Error al registrarse');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error de conexión');
        } finally {
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' })); // Security: clear sensitive data
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center bg-orange-accent/10 p-3 rounded-2xl mb-4">
                        <GraduationCap className="text-orange-accent" size={32} />
                    </div>
                    <h1 className="text-4xl font-bold mb-2">Crear Cuenta</h1>
                    <p className="text-dark-muted">Únete a EduAI y potencia tu perfil</p>
                </div>

                <div className="card shadow-2xl">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-dark-muted">Nombre completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="input-field pl-10"
                                    placeholder="Juan Pérez"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-dark-muted">Correo electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="input-field pl-10"
                                    placeholder="ejemplo@correo.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-dark-muted">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-dark-muted">Confirmar contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full h-12 flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Registrarse</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-dark-border pt-6">
                        <p className="text-dark-muted text-sm">
                            ¿Ya tienes cuenta?{' '}
                            <Link to="/login" className="text-orange-accent hover:underline font-medium">
                                Inicia sesión
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
