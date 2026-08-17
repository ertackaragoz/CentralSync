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
        <div className="auth-page centered-layout">
            {/* Tam Ekran Arka Plan ve Grid */}
            <div className="brand-glow full-glow" aria-hidden="true"></div>
            <div className="auth-grid full-grid"></div>

            {/* Ortalanmış Form Kartı */}
            <main className="auth-card register-card">
                <div className="brand centered-brand">
                    <div className="brand-bars"><span></span><span></span><span></span></div>
                    <div className="brand-word"><strong>CENTRAL</strong><span>Sync</span></div>
                </div>

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

            <div className="auth-footer centered-footer">CENTRALSync v1.2 · © 2026 Heweso</div>
        </div>
    );
}