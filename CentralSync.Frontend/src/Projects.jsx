import { useState, useEffect } from 'react';
import api from './api';

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('Planning');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(res.data.items || res.data);
            setLoading(false);
        } catch (err) {
            setError('Error loading projects.');
            setLoading(false);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await api.post('/projects', {
                name,
                description,
                startDate: startDate ? new Date(startDate).toISOString() : null,
                endDate: endDate ? new Date(endDate).toISOString() : null,
                status
            });

            setName('');
            setDescription('');
            setStartDate('');
            setEndDate('');
            setStatus('Planning');
            fetchProjects();
        } catch (err) {
            alert(err.response?.data?.message || 'Project could not be created!');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR');
    };

    if (loading) return <div style={{ padding: '50px' }}>Loading...</div>;

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Project Management</h2>
                <div>
                    <button
                        onClick={() => { window.location.href = '/users'; }}
                        style={{ padding: '8px 15px', background: '#6f42c1', color: 'white', border: 'none', cursor: 'pointer', marginRight: '10px', borderRadius: '4px' }}
                    >
                        Go to Users (Admin)
                    </button>
                    <button
                        onClick={() => { window.location.href = '/tasks'; }}
                        style={{ padding: '8px 15px', background: '#17a2b8', color: 'white', border: 'none', cursor: 'pointer', marginRight: '10px', borderRadius: '4px' }}
                    >
                        Go to Tasks
                    </button>
                    <button
                        onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
                        style={{ padding: '8px 15px', background: 'red', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* CREATE PROJECT FORM */}
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <h3>Create New Project</h3>
                <form onSubmit={handleCreateProject} style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                    <input
                        type="text" placeholder="Project Name" value={name} onChange={(e) => setName(e.target.value)} required
                        style={{ padding: '10px', gridColumn: 'span 2', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <textarea
                        placeholder="Project Description" value={description} onChange={(e) => setDescription(e.target.value)}
                        style={{ padding: '10px', gridColumn: 'span 2', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>Start Date</label>
                        <input
                            type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required
                            style={{ padding: '10px', width: '100%', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>End Date (Optional)</label>
                        <input
                            type="date"
                            value={endDate}
                            min={startDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{ padding: '10px', width: '100%', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '10px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <option value="Planning">Planning</option>
                            <option value="Active">Active</option>
                            <option value="OnHold">OnHold</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', gridColumn: 'span 2', borderRadius: '4px' }}>
                        Add Project
                    </button>
                </form>
            </div>

            {/* PROJECT LIST */}
            <h3>Project List</h3>
            <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {projects.map(p => (
                    <div key={p.id} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}>
                        <h4 style={{ margin: '0 0 10px 0' }}>{p.name}</h4>
                        <p style={{ color: '#555', fontSize: '13px', margin: '0 0 15px 0' }}>{p.description || 'No description'}</p>
                        <div style={{ fontSize: '12px', color: '#666', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <span>Status: <b>{p.status}</b></span>
                            <span>Start: <b>{formatDate(p.startDate)}</b></span>
                            <span>End: <b>{formatDate(p.endDate)}</b></span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}