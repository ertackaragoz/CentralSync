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
        <div className="auth-page">
            <div className="auth-hero">
                <div className="brand-glow" aria-hidden="true"></div>
                <div className="auth-grid"></div>

                <div className="brand">
                    <div className="brand-bars"><span></span><span></span><span></span></div>
                    <div className="brand-word"><strong>CENTRAL</strong><span>Sync</span></div>
                </div>

                <div className="auth-hero-content">
                    <div className="eyebrow green">Proje Yönetim Sistemi</div>
                    <h1>Tüm süreçleriniz<br /><span>tek bir ekranda.</span></h1>
                    <p>Görevlerinizi atayın, ekip içi iletişimi sağlayın ve projelerinizin zaman takibini uçtan uca yönetin.</p>
                    <div className="floating-card">
                        <div className="floating-row">
                            <div className="avatar">H</div>
                            <span className="status-pill green-pill">In Progress</span>
                        </div>
                        <div className="skeleton wide"></div>
                        <div className="skeleton half"></div>
                    </div>
                </div>

                <div className="auth-footer">CENTRALSync v1.2 · © 2026 Heweso</div>
            </div>

            <div className="auth-panel">
                <div className="mobile-brand brand">
                    <div className="brand-bars"><span></span><span></span><span></span></div>
                    <div className="brand-word"><strong>CENTRAL</strong><span>Sync</span></div>
                </div>

                <main className="auth-form-wrap">
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
            </div>
        </div>
    );
}
