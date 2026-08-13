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
            const response = await api.get('/projects');
            setProjects(response.data.items || response.data);
            setLoading(false);
        } catch (err) {
            setError('An error occured while loading projects.');
            setLoading(false);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            const newProject = {
                name,
                description,
                startDate: new Date(startDate).toISOString(),
                endDate: endDate ? new Date(endDate).toISOString() : null,
                status
            };

            await api.post('/projects', newProject);

            setName('');
            setDescription('');
            setStartDate('');
            setEndDate('');
            setStatus('Planning');
            fetchProjects();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create project!');
        }
    };

    if (loading) return <div style={{ padding: '50px' }}>Loading...</div>;

    return (
        <div style={{ padding: '50px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Projects</h2>
                <button
                    onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
                    style={{ padding: '8px 15px', background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    Log out
                </button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Creating new project form */}
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <h3>Create new project</h3>
                <form onSubmit={handleCreateProject} style={{ display: 'grid', gap: '15px', gridTemplateColumns: '1fr 1fr' }}>
                    <input
                        type="text" placeholder="Project Name" value={name} onChange={(e) => setName(e.target.value)} required
                        style={{ padding: '10px', gridColumn: 'span 2' }}
                    />
                    <textarea
                        placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)}
                        style={{ padding: '10px', gridColumn: 'span 2' }}
                    />
                    <div>
                        <label style={{ display: 'block', fontSize: '12px' }}>Start Date</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required style={{ padding: '10px', width: '100%' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px' }}>End Date (optional)</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '10px', width: '100%' }} />
                    </div>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '10px', gridColumn: 'span 2' }}>
                        <option value="Planning">Planning</option>
                        <option value="Active">Active</option>
                        <option value="OnHold">OnHold</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                    <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', gridColumn: 'span 2' }}>
                        Save Project
                    </button>
                </form>
            </div>

            {/* Projects List */}
            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {projects.length === 0 ? <p>No projects yet.</p> : null}
                {projects.map(project => (
                    <div key={project.id} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 10px 0' }}>{project.name}</h4>
                        <p style={{ fontSize: '14px', color: '#666', minHeight: '40px' }}>{project.description || 'No description.'}</p>
                        <div style={{ fontSize: '12px', marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ background: '#007bff', color: 'white', padding: '3px 8px', borderRadius: '4px' }}>{project.status}</span>
                            <span>{new Date(project.startDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}