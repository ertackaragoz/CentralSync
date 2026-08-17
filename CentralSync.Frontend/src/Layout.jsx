import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Layout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [role, setRole] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentRole =
                payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                payload.role ||
                '';
            setRole(currentRole);
        } catch {
            setRole('');
        }
    }, [location.pathname]);

    const logout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const isActive = path => {
        if (path === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    return (
        <div className="app-shell">
            <div className="brand-glow" aria-hidden="true"></div>

            <nav className="dashboard-nav">
                <button className="brand brand-button" onClick={() => navigate('/dashboard')} aria-label="Panel">
                    <div className="brand-bars"><span></span><span></span><span></span></div>
                    <div className="brand-word"><strong>CENTRAL</strong><span>Sync</span></div>
                </button>

                <div className="dashboard-links">
                    <button className={isActive('/dashboard') ? 'active' : ''} onClick={() => navigate('/dashboard')}>Panel</button>
                    <button className={isActive('/tasks') ? 'active' : ''} onClick={() => navigate('/tasks')}>Görevler</button>
                    <button className={isActive('/projects') ? 'active' : ''} onClick={() => navigate('/projects')}>Projeler</button>
                    <button className={isActive('/users') ? 'active' : ''} onClick={() => navigate('/users')}>Ekip</button>
                </div>

                <button className="outline-button" onClick={logout}>Çıkış Yap</button>
            </nav>

            <main className="app-content">
                {children}
            </main>
        </div>
    );
}
