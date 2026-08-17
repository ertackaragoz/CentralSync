import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', {
                email: email.trim().toLowerCase(),
                password
            });

            localStorage.setItem('token', response.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Giriş başarısız oldu!');
            setLoading(false);
        }
    };

    return (
        <div className="bg-darkBase text-gray-200 font-sans antialiased min-h-[100dvh] w-screen overflow-hidden flex flex-col sm:flex-row">
            <div className="hidden sm:flex sm:w-1/2 h-full min-h-screen overflow-y-auto overflow-x-hidden relative bg-darkBase border-r border-gray-700/50 flex-col p-8 lg:p-12 isolate">
                <div className="brand-glow rounded-full" aria-hidden="true"></div>

                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-10 pointer-events-none"></div>

                <div className="flex items-center gap-2.5 z-10 shrink-0 mb-6 lg:mb-10">
                    <div className="flex items-end gap-1 h-6 shrink-0" aria-hidden="true">
                        <div className="w-1.5 h-4 bg-accentSoft rounded-sm opacity-60"></div>
                        <div className="w-1.5 h-6 bg-accentSoft rounded-sm"></div>
                        <div className="w-1.5 h-3 bg-accentSoft rounded-sm opacity-80"></div>
                    </div>

                    <div className="text-xl whitespace-nowrap leading-none">
                        <span className="font-extrabold tracking-widest text-gray-100">
                            HEWESO
                        </span>
                        <span className="font-light text-accentSoft tracking-wide">
                            Sync
                        </span>
                    </div>
                </div>

                <div className="relative z-10 w-full max-w-lg mx-auto flex-1 flex flex-col justify-center py-4 my-auto shrink-0">
                    <p className="text-accentGreen uppercase tracking-[0.18em] text-[13px] font-bold mb-4">
                        Proje Yönetim Sistemi
                    </p>

                    <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-[1.1] mb-5 tracking-tight">
                        Tüm süreçleriniz
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accentSoft to-accentGreen">
                            tek bir ekranda.
                        </span>
                    </h1>

                    <p className="text-mutedCopy text-[16px] lg:text-lg leading-relaxed mb-10 max-w-sm lg:max-w-md">
                        Görevlerinizi atayın, ekip içi iletişimi sağlayın ve projelerinizin zaman takibini uçtan uca yönetin.
                    </p>

                    <div className="floating-card bg-darkSurface/40 backdrop-blur-md p-5 lg:p-6 rounded-2xl border border-gray-500/30 shadow-2xl w-[280px] lg:w-80 relative ml-4 lg:ml-8">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-accentSoft/20 flex items-center justify-center text-accentSoft font-bold text-sm border border-accentSoft/30">
                                H
                            </div>

                            <span className="bg-accentGreen/20 text-accentGreen text-[11px] lg:text-xs font-bold px-2.5 py-1 rounded-full border border-accentGreen/20">
                                In Progress
                            </span>
                        </div>

                        <div className="h-3.5 lg:h-4 w-3/4 bg-gray-500/40 rounded mb-2.5"></div>
                        <div className="h-3.5 lg:h-4 w-1/2 bg-gray-500/20 rounded"></div>
                    </div>
                </div>

                <div className="z-10 text-[13px] text-gray-500 font-medium tracking-wide shrink-0 mt-6 lg:mt-10">
                    HEWESOSync v1.2 · © 2026 Heweso
                </div>
            </div>

            <div className="w-full sm:w-1/2 min-h-screen overflow-y-auto overflow-x-hidden relative bg-darkBase flex flex-col p-6 sm:p-12 isolate">
                <div className="absolute sm:hidden top-20 left-1/2 -translate-x-1/2 w-[120vw] h-[120vw] max-w-[600px] max-h-[600px] bg-accentSoft/5 blur-[80px] rounded-full -z-10 pointer-events-none"></div>

                <main className="w-full max-w-[400px] mx-auto my-auto shrink-0 py-6 sm:py-0">
                    <div className="flex sm:hidden items-center justify-center gap-3 mb-10">
                        <div className="flex items-end gap-1 h-7 shrink-0" aria-hidden="true">
                            <div className="w-2 h-4 bg-accentSoft rounded-sm opacity-60"></div>
                            <div className="w-2 h-7 bg-accentSoft rounded-sm"></div>
                            <div className="w-2 h-3.5 bg-accentSoft rounded-sm opacity-80"></div>
                        </div>

                        <div className="text-2xl whitespace-nowrap leading-none">
                            <span className="font-extrabold tracking-widest text-gray-100">
                                HEWESO
                            </span>
                            <span className="font-light text-accentSoft tracking-wide">
                                Sync
                            </span>
                        </div>
                    </div>

                    <div className="mb-8 md:mb-10 text-center sm:text-left">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-2.5 tracking-tight">
                            Tekrar hoş geldiniz
                        </h2>

                        <p className="text-mutedCopy text-[15px] sm:text-[16px]">
                            Çalışma alanınıza erişmek için giriş yapın.
                        </p>
                    </div>

                    {error && (
                        <div className="animate-shake mb-5 bg-red-400/10 border border-red-400/30 rounded-xl px-4 py-3 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="block text-[12px] sm:text-[13px] font-bold text-gray-300 uppercase tracking-wider"
                            >
                                E-posta Adresi
                            </label>

                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-darkSurface/50 border border-gray-600/60 rounded-xl px-4 py-3.5 sm:py-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-accentSoft focus:ring-1 focus:ring-accentSoft transition-all duration-300"
                                placeholder="samet@gmail.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <label
                                    htmlFor="password"
                                    className="block text-[12px] sm:text-[13px] font-bold text-gray-300 uppercase tracking-wider"
                                >
                                    Şifre
                                </label>

                                <span className="text-[12px] sm:text-[13px] font-semibold text-gray-600">
                                    Şifremi unuttum
                                </span>
                            </div>

                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-darkSurface/50 border border-gray-600/60 rounded-xl px-4 py-3.5 sm:py-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-accentSoft focus:ring-1 focus:ring-accentSoft transition-all duration-300"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="pt-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-accentSoft text-darkBase font-extrabold uppercase tracking-[0.15em] text-sm py-4 rounded-xl hover:bg-accentGreen hover:shadow-[0_0_20px_rgba(167,243,208,0.2)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentSoft focus-visible:ring-offset-2 focus-visible:ring-offset-darkBase disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        Hesabınız yok mu?{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className="text-accentSoft hover:text-accentGreen font-semibold transition-colors"
                        >
                            Kayıt olun
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}