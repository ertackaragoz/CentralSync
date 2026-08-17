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
            const response = await api.post('/auth/login', { email: email.trim().toLowerCase(), password });
            localStorage.setItem('token', response.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Giriş başarısız oldu!');
            setLoading(false);
        }
    };

    return (
        <div className="auth-page centered-layout">
            {/* Tam Ekran Arka Plan ve Grid */}
            <div className="brand-glow full-glow" aria-hidden="true"></div>
            <div className="auth-grid full-grid"></div>

            {/* Ortalanmış Form Kartı */}
            <main className="auth-card">
                <div className="brand centered-brand">
                    <div className="brand-bars"><span></span><span></span><span></span></div>
                    <div className="brand-word"><strong>CENTRAL</strong><span>Sync</span></div>
                </div>

                <div className="auth-heading">
                    <h2>Tekrar hoş geldiniz</h2>
                    <p>Çalışma alanınıza erişmek için giriş yapın.</p>
                </div>

                {error && <div className="error-box">{error}</div>}

                <form onSubmit={handleLogin} className="auth-form">
                    <label>E-posta Adresi</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="samet@gmail.com" required />

                    <label>Şifre</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />

                    <button type="submit" disabled={loading} className="primary-button">
                        {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>

                <div className="auth-switch">
                    Hesabınız yok mu? <button type="button" onClick={() => navigate('/register')}>Kayıt olun</button>
                </div>
            </main>

            <div className="auth-footer centered-footer">CENTRALSync v1.2 · © 2026 Heweso</div>
        </div>
    );
}