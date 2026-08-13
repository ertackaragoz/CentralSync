import { useNavigate } from 'react-router-dom';

export default function Tasks() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div style={{ padding: '50px' }}>
            <h2>Tasks</h2>
            <p>Login successful! Token was received and you are in a protected page.</p>
            <button onClick={handleLogout} style={{ padding: '10px', background: 'red', color: 'white', cursor: 'pointer', border: 'none' }}>
                Log out
            </button>
        </div>
    );
}