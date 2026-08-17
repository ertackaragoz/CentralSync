import { useState, useEffect } from 'react';
import api from './api';

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [currentUserRole, setCurrentUserRole] = useState('');
    const [currentUserId, setCurrentUserId] = useState('');

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('Planning');

    const [teamModalProject, setTeamModalProject] = useState(null);
    const [projectMembers, setProjectMembers] = useState([]);
    const [newMemberUserId, setNewMemberUserId] = useState('');
    const [newMemberRole, setNewMemberRole] = useState('Member');

    useEffect(() => {
        fetchProjects();

        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role;
                setCurrentUserRole(role);

                const userId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.nameid || payload.sub || payload.id;
                setCurrentUserId(userId);
            } catch (e) {
                console.error("Token could not be parsed.");
            }
        }
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

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data.items || res.data);
        } catch (err) {
            console.error("Failed to load users for team assignment.");
        }
    };

    const fetchProjectMembers = async (projectId) => {
        try {
            const res = await api.get(`/projects/${projectId}/members`);
            setProjectMembers(res.data.items || res.data);
        } catch (err) {
            setProjectMembers([]);
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

    const openTeamModal = async (project) => {
        setTeamModalProject(project);
        setNewMemberUserId('');
        setNewMemberRole('Member');
        await fetchUsers();
        await fetchProjectMembers(project.id);
    };

    const closeTeamModal = () => {
        setTeamModalProject(null);
        setProjectMembers([]);
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newMemberUserId) {
            alert('Please select a user.');
            return;
        }

        try {
            await api.post(`/projects/${teamModalProject.id}/members`, {
                userId: newMemberUserId,
                role: newMemberRole
            });

            setNewMemberUserId('');
            setNewMemberRole('Member');
            fetchProjectMembers(teamModalProject.id);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add member to the project.');
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return;
        try {
            await api.delete(`/projects/${teamModalProject.id}/members/${memberId}`);
            fetchProjectMembers(teamModalProject.id);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to remove member.');
        }
    };

    const canManageProject = (project) => {
        if (!project) return false;
        return currentUserRole === 'Admin' || project.ownerId === currentUserId;
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
                    {currentUserRole === 'Admin' && (
                        <button
                            onClick={() => { window.location.href = '/users'; }}
                            style={{ padding: '8px 15px', background: '#6f42c1', color: 'white', border: 'none', cursor: 'pointer', marginRight: '10px', borderRadius: '4px' }}
                        >
                            Go to Users (Admin)
                        </button>
                    )}
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

            {(currentUserRole === 'Admin' || currentUserRole === 'ProjectManager') && (
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
            )}

            <h3>Project List</h3>
            <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {projects.map(p => (
                    <div key={p.id} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <h4 style={{ margin: '0 0 10px 0' }}>{p.name}</h4>
                            <p style={{ color: '#555', fontSize: '13px', margin: '0 0 15px 0' }}>{p.description || 'No description'}</p>
                            <div style={{ fontSize: '12px', color: '#666', display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '20px' }}>
                                <span>Status: <b>{p.status}</b></span>
                                <span>Start: <b>{formatDate(p.startDate)}</b></span>
                                <span>End: <b>{formatDate(p.endDate)}</b></span>
                            </div>
                        </div>

                        {canManageProject(p) && (
                            <button
                                onClick={() => openTeamModal(p)}
                                style={{ padding: '8px', background: '#e3fcef', color: '#006644', border: '1px solid #006644', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Manage Team
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {teamModalProject && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '95%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>Manage Team: {teamModalProject.name}</h3>
                            <button onClick={closeTeamModal} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>✖</button>
                        </div>

                        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '6px', marginBottom: '20px' }}>
                            <h4 style={{ margin: '0 0 15px 0' }}>Add New Member</h4>
                            <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <select
                                    value={newMemberUserId}
                                    onChange={(e) => setNewMemberUserId(e.target.value)}
                                    required
                                    style={{ flex: 2, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="">-- Select User --</option>
                                    {users.filter(u => u.isActive && !projectMembers.some(pm => pm.userId === u.id)).map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.firstName} {user.lastName} ({user.email})
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={newMemberRole}
                                    onChange={(e) => setNewMemberRole(e.target.value)}
                                    style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="Member">Member</option>
                                    <option value="Contributor">Contributor</option>
                                    <option value="Viewer">Viewer</option>
                                </select>

                                <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                    Add
                                </button>
                            </form>
                        </div>

                        <h4>Current Team Members</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {projectMembers.length === 0 ? (
                                <p style={{ fontSize: '13px', color: '#888' }}>No members assigned to this project yet.</p>
                            ) : (
                                projectMembers.map(member => (
                                    <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '15px', border: '1px solid #eee', borderRadius: '6px' }}>
                                        <div>
                                            <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
                                                {member.firstName} {member.lastName}
                                            </strong>
                                            <span style={{
                                                fontSize: '11px',
                                                padding: '3px 8px',
                                                borderRadius: '12px',
                                                fontWeight: 'bold',
                                                background: member.role === 'Viewer' ? '#fffbe6' : member.role === 'Contributor' ? '#e6f7ff' : '#f6ffed',
                                                color: member.role === 'Viewer' ? '#d46b08' : member.role === 'Contributor' ? '#0050b3' : '#389e0d',
                                                border: '1px solid #eee'
                                            }}>
                                                {member.role}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveMember(member.id)}
                                            style={{ background: 'transparent', border: 'none', color: '#dc3545', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}