import { useState, useEffect } from 'react';
import api from './api';

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [projectMembers, setProjectMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [projectId, setProjectId] = useState('');
    const [assignedToUserId, setAssignedToUserId] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [dueDate, setDueDate] = useState('');
    const [estimatedHours, setEstimatedHours] = useState('');

    const [draggedTaskId, setDraggedTaskId] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);

    const columns = ['Todo', 'InProgress', 'InReview', 'Done'];

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (projectId) {
            fetchProjectMembers(projectId);
        } else {
            setProjectMembers([]);
            setAssignedToUserId('');
        }
    }, [projectId]);

    const fetchInitialData = async () => {
        try {
            const [projectsRes, tasksRes] = await Promise.all([
                api.get('/projects'),
                api.get('/tasks')
            ]);

            setProjects(projectsRes.data.items || projectsRes.data);
            setTasks(tasksRes.data.items || tasksRes.data);
            setLoading(false);
        } catch (err) {
            setError('Error loading data.');
            setLoading(false);
        }
    };

    const fetchProjectMembers = async (id) => {
        try {
            const res = await api.get(`/projects/${id}/members`);
            setProjectMembers(res.data.items || res.data);
        } catch (err) {
            setProjectMembers([]);
        }
    };

    const getProjectName = (id) => {
        const project = projects.find(p => p.id === id);
        return project ? project.name : 'Unknown Project';
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!projectId) {
            alert('Please select a project!');
            return;
        }

        try {
            const newTask = {
                title,
                description,
                projectId,
                assignedToUserId: assignedToUserId || null,
                priority,
                dueDate: dueDate ? new Date(dueDate).toISOString() : null,
                estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null
            };

            await api.post('/tasks', newTask);

            setTitle('');
            setDescription('');
            setProjectId('');
            setAssignedToUserId('');
            setPriority('Medium');
            setDueDate('');
            setEstimatedHours('');
            fetchInitialData();
        } catch (err) {
            alert(err.response?.data?.message || 'Task could not be created!');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;

        try {
            await api.delete(`/tasks/${taskId}`);
            fetchInitialData();
        } catch (err) {
            alert('Task could not be deleted!');
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await api.patch(`/tasks/${taskId}/status`, JSON.stringify(newStatus), {
                headers: { 'Content-Type': 'application/json' }
            });
            fetchInitialData();
        } catch (err) {
            alert('Task status could not be updated!');
        }
    };

    const onDragStart = (e, taskId) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = (e, column) => {
        e.preventDefault();
        setDragOverColumn(column);
    };

    const onDragLeave = () => {
        setDragOverColumn(null);
    };

    const onDrop = (e, column) => {
        e.preventDefault();
        setDragOverColumn(null);
        const currentTaskId = draggedTaskId;
        setDraggedTaskId(null);

        if (currentTaskId) {
            const task = tasks.find(t => t.id === currentTaskId);
            if (task && task.status !== column) {
                setTimeout(() => {
                    handleStatusChange(currentTaskId, column);
                }, 0);
            }
        }
    };

    const onDragEnd = () => {
        setDraggedTaskId(null);
        setDragOverColumn(null);
    };

    if (loading) return <div style={{ padding: '50px' }}>Loading...</div>;

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Task Management</h2>
                <div>
                    <button
                        onClick={() => { window.location.href = '/projects'; }}
                        style={{ padding: '8px 15px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer', marginRight: '10px' }}
                    >
                        Back to Projects
                    </button>
                    <button
                        onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
                        style={{ padding: '8px 15px', background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <h3>Create New Task</h3>
                <form onSubmit={handleCreateTask} style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required style={{ padding: '10px', gridColumn: 'span 1' }}>
                        <option value="">-- Select Project --</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <input
                        type="text" placeholder="Task Title" value={title} onChange={(e) => setTitle(e.target.value)} required
                        style={{ padding: '10px', gridColumn: 'span 3' }}
                    />
                    <textarea
                        placeholder="Task Description" value={description} onChange={(e) => setDescription(e.target.value)}
                        style={{ padding: '10px', gridColumn: 'span 4' }}
                    />
                    <select value={assignedToUserId} onChange={(e) => setAssignedToUserId(e.target.value)} style={{ padding: '10px', gridColumn: 'span 1' }}>
                        <option value="">-- Unassigned --</option>
                        {projectMembers.map(m => (
                            <option key={m.id || m.userId} value={m.userId || m.id}>
                                {m.firstName ? `${m.firstName} ${m.lastName}` : (m.userId || m.id)}
                            </option>
                        ))}
                    </select>
                    <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ padding: '10px', gridColumn: 'span 1' }}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </select>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px' }}>Due Date (Optional)</label>
                        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px' }}>Estimated Hours (Optional)</label>
                        <input type="number" step="0.5" min="0" placeholder="e.g. 4.5" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }} />
                    </div>
                    <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', gridColumn: 'span 4' }}>
                        Add Task
                    </button>
                </form>
            </div>

            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(4, 1fr)', alignItems: 'start' }}>
                {columns.map(column => (
                    <div
                        key={column}
                        onDragOver={(e) => onDragOver(e, column)}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => onDrop(e, column)}
                        style={{
                            background: dragOverColumn === column ? '#d3d5db' : '#ebecf0',
                            padding: '15px',
                            borderRadius: '8px',
                            minHeight: '400px',
                            transition: 'background 0.2s ease'
                        }}
                    >
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#172b4d', textTransform: 'uppercase' }}>{column}</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {tasks.filter(t => t.status === column).map(task => (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, task.id)}
                                    onDragEnd={onDragEnd}
                                    style={{
                                        background: 'white',
                                        padding: '15px',
                                        borderRadius: '6px',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                                        cursor: 'grab',
                                        opacity: draggedTaskId === task.id ? 0.4 : 1,
                                        transform: draggedTaskId === task.id ? 'scale(0.98)' : 'scale(1)',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    <div style={{ fontSize: '10px', color: '#888', marginBottom: '5px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                        {getProjectName(task.projectId)}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', wordBreak: 'break-word' }}>{task.title}</h4>
                                        <button onClick={() => handleDeleteTask(task.id)} style={{ background: 'transparent', border: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>×</button>
                                    </div>

                                    <p style={{ fontSize: '12px', color: '#555', margin: '0 0 10px 0' }}>{task.description || 'No details.'}</p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: task.priority === 'Critical' ? 'red' : task.priority === 'High' ? 'orange' : 'gray' }}>
                                                {task.priority}
                                            </span>
                                            {task.estimatedHours && <span style={{ fontSize: '11px', color: '#666' }}>⏱ {task.estimatedHours}h</span>}
                                        </div>

                                        <div style={{
                                            fontSize: '10px',
                                            background: task.assignedToUserId ? '#e3fcef' : '#ffebe6',
                                            color: task.assignedToUserId ? '#006644' : '#bf2600',
                                            padding: '3px 6px',
                                            borderRadius: '12px',
                                            fontWeight: 'bold'
                                        }}>
                                            {task.assignedToUserId ? '👤 Assigned' : 'Unassigned'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}