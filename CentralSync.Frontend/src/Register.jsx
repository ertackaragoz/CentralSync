import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

export default function Register() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await api.post('/auth/register', {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim().toLowerCase(),
                password
            });

            setSuccess('Kayıt başarılı. Giriş ekranına yönlendiriliyorsunuz...');
            setTimeout(() => navigate('/login'), 1200);
        } catch (err) {
            setError(err.response?.data?.message || 'Kayıt başarısız oldu. Lütfen tekrar deneyin.');
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
                    <h1>Ekibinize<br /><span>katılın.</span></h1>
                    <p>Projelerinizi takip edin, görevlerinizi yönetin ve ekibinizle aynı çalışma alanında buluşun.</p>
                    <div className="floating-card">
                        <div className="floating-row">
                            <div className="avatar">HS</div>
                            <span className="status-pill green-pill">Workspace Ready</span>
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

                <main className="auth-form-wrap register-form-wrap">
                    <div className="auth-heading">
                        <h2>Hesabınızı oluşturun</h2>
                        <p>Çalışma alanınıza katılmak için bilgilerinizi girin.</p>
                    </div>

                    {error && <div className="error-box">{error}</div>}
                    {success && <div className="success-box">{success}</div>}

                    <form onSubmit={handleRegister} className="auth-form">
                        <div className="form-grid-two">
                            <div>
                                <label>Ad</label>
                                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Adınız" required />
                            </div>
                            <div>
                                <label>Soyad</label>
                                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Soyadınız" required />
                            </div>
                        </div>

                        <label>E-posta Adresi</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="samet@gmail.com" required />

                        <label>Şifre</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="En az 6 karakter" minLength="6" required />

                        <button type="submit" disabled={loading} className="primary-button">
                            {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
                        </button>
                    </form>

                    <div className="auth-switch">
                        Zaten hesabınız var mı? <button type="button" onClick={() => navigate('/login')}>Giriş yapın</button>
                    </div>
                </main>
            </div>
        </div>
    );
}
