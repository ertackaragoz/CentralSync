import { useState, useEffect } from 'react';
import api from './api';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [unauthorized, setUnauthorized] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                setUnauthorized(true);
            } else {
                setError('Error loading users. Please try again.');
            }
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) return;

        try {
            await api.patch(`/users/${userId}/toggle-status`);
            setUsers(users.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to toggle user status!');
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        if (!window.confirm('Are you sure you want to change this user\'s role?')) return;

        try {
            await api.patch(`/users/${userId}/role`, { Role: newRole });

            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to change user role!');
            fetchUsers();
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR');
    };

    if (loading) return <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>Loading user data...</div>;

    if (unauthorized) {
        return (
            <div style={{ padding: '50px', fontFamily: 'sans-serif', textAlign: 'center' }}>
                <h2 style={{ color: 'red' }}>403 - Access Denied</h2>
                <p>You do not have the required Administrator privileges to view this page.</p>
                <button
                    onClick={() => { window.location.href = '/projects'; }}
                    style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' }}
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>User Management (Admin Panel)</h2>
                <div>
                    <button
                        onClick={() => { window.location.href = '/projects'; }}
                        style={{ padding: '8px 15px', background: '#17a2b8', color: 'white', border: 'none', cursor: 'pointer', marginRight: '10px', borderRadius: '4px' }}
                    >
                        Go to Projects
                    </button>
                    <button
                        onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
                        style={{ padding: '8px 15px', background: 'red', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {error && <p style={{ color: 'red', background: '#ffe6e6', padding: '10px', borderRadius: '4px' }}>{error}</p>}

            <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <th style={{ padding: '15px' }}>Name</th>
                            <th style={{ padding: '15px' }}>Email</th>
                            <th style={{ padding: '15px' }}>Department</th>
                            <th style={{ padding: '15px' }}>Created Date</th>
                            <th style={{ padding: '15px' }}>Role</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>Status</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No users found.</td>
                            </tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #eee', background: user.isActive ? 'white' : '#fdfdfd', color: user.isActive ? '#333' : '#888' }}>
                                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{user.firstName} {user.lastName}</td>
                                    <td style={{ padding: '15px' }}>{user.email}</td>
                                    <td style={{ padding: '15px' }}>{user.department || '-'}</td>
                                    <td style={{ padding: '15px' }}>{formatDate(user.createdAt)}</td>

                                    <td style={{ padding: '15px' }}>
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                            disabled={!user.isActive}
                                            style={{
                                                padding: '6px',
                                                borderRadius: '4px',
                                                border: '1px solid #ccc',
                                                background: user.isActive ? 'white' : '#eee',
                                                cursor: user.isActive ? 'pointer' : 'not-allowed',
                                                color: '#000'
                                            }}
                                        >
                                            {/* String values based on JsonStringEnumConverter in backend */}
                                            <option value="Admin">Admin</option>
                                            <option value="ProjectManager">Project Manager</option>
                                            <option value="TeamMember">Team Member</option>
                                            <option value="Viewer">Viewer</option>
                                        </select>
                                    </td>

                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '5px 10px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            background: user.isActive ? '#d4edda' : '#f8d7da',
                                            color: user.isActive ? '#155724' : '#721c24'
                                        }}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>

                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleToggleStatus(user.id, user.isActive)}
                                            style={{
                                                padding: '6px 12px',
                                                background: user.isActive ? '#ffc107' : '#28a745',
                                                color: user.isActive ? '#000' : '#fff',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                fontSize: '12px'
                                            }}
                                        >
                                            {user.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}