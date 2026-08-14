import { useState, useEffect } from 'react';
import api from './api';

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [projectMembers, setProjectMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // New Task States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [projectId, setProjectId] = useState('');
    const [assignedToUserId, setAssignedToUserId] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [dueDate, setDueDate] = useState('');
    const [estimatedHours, setEstimatedHours] = useState('');

    // Drag & Drop States
    const [draggedTaskId, setDraggedTaskId] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);

    // Modal States
    const [selectedTask, setSelectedTask] = useState(null);

    // Comments States
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    // Time Logs States
    const [timeLogs, setTimeLogs] = useState([]);
    const [logHours, setLogHours] = useState('');
    const [logDescription, setLogDescription] = useState('');
    const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);

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

    // Drag & Drop Handlers
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

    // Modal Handlers
    const openTaskModal = async (task) => {
        setSelectedTask(task);
        try {
            const [commentsRes, logsRes] = await Promise.all([
                api.get(`/tasks/${task.id}/comments`),
                api.get(`/tasks/${task.id}/time-logs`)
            ]);
            setComments(commentsRes.data);
            setTimeLogs(logsRes.data);
        } catch (err) {
            setComments([]);
            setTimeLogs([]);
        }
    };

    const closeTaskModal = () => {
        setSelectedTask(null);
        setComments([]);
        setTimeLogs([]);
        setNewComment('');
        setLogHours('');
        setLogDescription('');
        setLogDate(new Date().toISOString().split('T')[0]);
    };

    // Comment Handlers
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await api.post(`/tasks/${selectedTask.id}/comments`, { content: newComment });
            setNewComment('');
            const res = await api.get(`/tasks/${selectedTask.id}/comments`);
            setComments(res.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add comment!');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await api.delete(`/comments/${commentId}`);
            const res = await api.get(`/tasks/${selectedTask.id}/comments`);
            setComments(res.data);
        } catch (err) {
            alert(err.response?.data?.message || 'You can only delete your own comments!');
        }
    };

    // Time Log Handlers
    const handleAddTimeLog = async (e) => {
        e.preventDefault();
        if (!logHours || parseFloat(logHours) <= 0) {
            alert('Hours must be greater than 0');
            return;
        }

        try {
            await api.post(`/tasks/${selectedTask.id}/time-logs`, {
                hours: parseFloat(logHours),
                description: logDescription,
                workDate: logDate
            });
            setLogHours('');
            setLogDescription('');

            // Refresh Data
            const res = await api.get(`/tasks/${selectedTask.id}/time-logs`);
            setTimeLogs(res.data);
            fetchInitialData(); // Board'daki task verisini (ActualHours için) güncelle
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add time log!');
        }
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
                                    onClick={() => openTaskModal(task)}
                                    style={{
                                        background: 'white',
                                        padding: '15px',
                                        borderRadius: '6px',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                                        cursor: 'pointer',
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
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                            style={{ background: 'transparent', border: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <p style={{ fontSize: '12px', color: '#555', margin: '0 0 10px 0' }}>
                                        {task.description ? (task.description.length > 50 ? task.description.substring(0, 50) + '...' : task.description) : 'No details.'}
                                    </p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: task.priority === 'Critical' ? 'red' : task.priority === 'High' ? 'orange' : 'gray' }}>
                                                {task.priority}
                                            </span>
                                            {task.estimatedHours && <span style={{ fontSize: '11px', color: '#666' }}>Est: {task.estimatedHours}h</span>}
                                        </div>

                                        <div style={{
                                            fontSize: '10px',
                                            background: task.assignedToUserId ? '#e3fcef' : '#ffebe6',
                                            color: task.assignedToUserId ? '#006644' : '#bf2600',
                                            padding: '3px 6px',
                                            borderRadius: '12px',
                                            fontWeight: 'bold'
                                        }}>
                                            {task.assignedToUserId
                                                ? `👤 ${task.assignedToUserFirstName || ''} ${task.assignedToUserLastName || ''}`.trim()
                                                : 'Unassigned'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {selectedTask && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{
                        background: 'white', padding: '30px', borderRadius: '8px', width: '95%', maxWidth: '900px',
                        maxHeight: '90vh', overflowY: 'auto', position: 'relative'
                    }}>
                        <button
                            onClick={closeTaskModal}
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}
                        >
                            ✖
                        </button>
                        <h2 style={{ margin: '0 0 10px 0' }}>{selectedTask.title}</h2>
                        <p style={{ color: '#555', marginBottom: '20px' }}>{selectedTask.description || 'No description provided.'}</p>

                        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', fontSize: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ padding: '5px 10px', background: '#e3fcef', borderRadius: '4px', color: '#006644' }}>Status: <b>{selectedTask.status}</b></span>
                            <span style={{ padding: '5px 10px', background: '#ebecf0', borderRadius: '4px' }}>Priority: <b>{selectedTask.priority}</b></span>
                            {selectedTask.estimatedHours && <span style={{ padding: '5px 10px', background: '#e6f7ff', borderRadius: '4px', color: '#0050b3' }}>Estimated: <b>{selectedTask.estimatedHours}h</b></span>}
                            <span style={{ padding: '5px 10px', background: '#f6ffed', borderRadius: '4px', color: '#389e0d', border: '1px solid #b7eb8f' }}>
                                Total Logged: <b>{timeLogs.reduce((acc, log) => acc + log.hours, 0)}h</b>
                            </span>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                            {/* Sol Taraf: Zaman Kayıtları (Time Logs) */}
                            <div>
                                <h3>Time Logs</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
                                    {timeLogs.length === 0 ? (
                                        <p style={{ fontSize: '13px', color: '#888' }}>No time logged yet.</p>
                                    ) : (
                                        timeLogs.map(log => (
                                            <div key={log.id} style={{ background: '#f0f7ff', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #007bff' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                    <strong style={{ fontSize: '13px' }}>{log.userFullName}</strong>
                                                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#0056b3' }}>{log.hours}h</span>
                                                </div>
                                                <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#333' }}>{log.description || 'No description'}</p>
                                                <span style={{ fontSize: '11px', color: '#888' }}>{new Date(log.workDate).toLocaleDateString()}</span>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <form onSubmit={handleAddTimeLog} style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f9f9f9', padding: '15px', borderRadius: '6px' }}>
                                    <h4 style={{ margin: 0, fontSize: '14px' }}>Add Time Log</h4>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="number" step="0.5" min="0.5" placeholder="Hours (e.g. 2.5)"
                                            value={logHours} onChange={(e) => setLogHours(e.target.value)} required
                                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
                                        />
                                        <input
                                            type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} required
                                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
                                        />
                                    </div>
                                    <input
                                        type="text" placeholder="What did you work on? (optional)"
                                        value={logDescription} onChange={(e) => setLogDescription(e.target.value)}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    />
                                    <button type="submit" style={{ padding: '8px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                        Log Time
                                    </button>
                                </form>
                            </div>

                            {/* Sağ Taraf: Yorumlar (Comments) */}
                            <div>
                                <h3>Comments</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
                                    {comments.length === 0 ? (
                                        <p style={{ fontSize: '13px', color: '#888' }}>No comments yet.</p>
                                    ) : (
                                        comments.map(c => (
                                            <div key={c.id} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '6px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                    <strong style={{ fontSize: '13px' }}>{c.userName}</strong>
                                                    <span style={{ fontSize: '11px', color: '#888' }}>{new Date(c.createdAt).toLocaleString()}</span>
                                                </div>
                                                <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>{c.content}</p>
                                                <button
                                                    onClick={() => handleDeleteComment(c.id)}
                                                    style={{ background: 'transparent', border: 'none', color: '#bf2600', fontSize: '12px', cursor: 'pointer', padding: 0 }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <textarea
                                        placeholder="Write a comment..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        required
                                        style={{ padding: '10px', minHeight: '80px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    />
                                    <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                        Post Comment
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}