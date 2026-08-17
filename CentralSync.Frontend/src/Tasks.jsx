import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from './api';

export default function Tasks() {
    const location = useLocation();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [projectMembers, setProjectMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [currentUserRole, setCurrentUserRole] = useState('');
    const [currentUserId, setCurrentUserId] = useState('');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [projectId, setProjectId] = useState('');
    const [assignedToUserId, setAssignedToUserId] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [dueDate, setDueDate] = useState('');
    const [estimatedHours, setEstimatedHours] = useState('');

    const [draggedTaskId, setDraggedTaskId] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);

    const [selectedTask, setSelectedTask] = useState(null);
    const [isEditingTask, setIsEditingTask] = useState(false);

    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editAssignedToUserId, setEditAssignedToUserId] = useState('');
    const [editPriority, setEditPriority] = useState('');
    const [editDueDate, setEditDueDate] = useState('');
    const [editEstimatedHours, setEditEstimatedHours] = useState('');

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentContent, setEditCommentContent] = useState('');

    const [timeLogs, setTimeLogs] = useState([]);
    const [logHours, setLogHours] = useState('');
    const [logDescription, setLogDescription] = useState('');
    const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);

    const [histories, setHistories] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterProjectId, setFilterProjectId] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [filterDueBefore, setFilterDueBefore] = useState('');
    const [filterDueAfter, setFilterDueAfter] = useState('');

    const columns = ['Todo', 'InProgress', 'InReview', 'Done'];

    useEffect(() => {
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

    useEffect(() => {
        fetchInitialData();
    }, [currentPage, filterProjectId, filterPriority, filterDueBefore, filterDueAfter]);

    useEffect(() => {
        if (projectId) {
            fetchProjectMembers(projectId);
        } else {
            setProjectMembers([]);
            setAssignedToUserId('');
        }
    }, [projectId]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const taskId = params.get('taskId');
        const mode = params.get('mode');

        if (!taskId || !tasks.length) return;

        const task = tasks.find(item => String(item.id) === String(taskId));
        if (!task || selectedTask) return;

        openTaskModal(task).then(() => {
            if (mode === 'edit' && canManageTask(task)) {
                setEditTitle(task.title);
                setEditDescription(task.description || '');
                setEditAssignedToUserId(task.assignedToUserId || '');
                setEditPriority(task.priority || 'Medium');
                setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
                setEditEstimatedHours(task.estimatedHours || '');
                setIsEditingTask(true);
            }
        });
    }, [location.search, tasks, selectedTask]);

    const fetchInitialData = async () => {
        try {
            const params = {
                page: currentPage,
                pageSize: 20
            };
            if (filterProjectId) params.projectId = filterProjectId;
            if (filterPriority) params.priority = filterPriority;
            if (filterDueBefore) params.dueBefore = new Date(filterDueBefore).toISOString();
            if (filterDueAfter) params.dueAfter = new Date(filterDueAfter).toISOString();

            const [projectsRes, tasksRes] = await Promise.all([
                api.get('/projects', { params: { pageSize: 1000 } }),
                api.get('/tasks', { params })
            ]);

            setProjects(projectsRes.data.items || projectsRes.data);
            setTasks(tasksRes.data.items || tasksRes.data);
            setTotalPages(tasksRes.data.totalPages || 1);
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

    const canManageTask = (task) => {
        if (!task) return false;
        if (currentUserRole === 'Admin') return true;

        const project = projects.find(p => p.id === task.projectId);
        return project && project.ownerId === currentUserId;
    };

    const getProjectName = (id) => {
        const project = projects.find(p => p.id === id);
        return project ? project.name : 'Unknown Project';
    };

    const getSelectedProjectStartDate = (pId) => {
        const project = projects.find(p => p.id === pId);
        return project && project.startDate ? project.startDate.split('T')[0] : '';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR');
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
        const isConfirmed = window.confirm('Are you sure you want to delete this task?');
        window.focus();

        if (!isConfirmed) return;

        try {
            await api.delete(`/tasks/${taskId}`);
            fetchInitialData();
            setTimeout(() => window.focus(), 50);
        } catch (err) {
            alert(err.response?.data?.message || 'Task could not be deleted!');
            window.focus();
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await api.patch(`/tasks/${taskId}/status`, JSON.stringify(newStatus), {
                headers: { 'Content-Type': 'application/json' }
            });
            fetchInitialData();

            if (selectedTask && selectedTask.id === taskId) {
                setSelectedTask(prev => ({ ...prev, status: newStatus }));
                const historyRes = await api.get(`/tasks/${taskId}/histories`);
                setHistories(historyRes.data);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Task status could not be updated!');
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

    const openTaskModal = async (task) => {
        setSelectedTask(task);
        setIsEditingTask(false);
        fetchProjectMembers(task.projectId);

        try {
            const [commentsRes, logsRes, historiesRes] = await Promise.all([
                api.get(`/tasks/${task.id}/comments`),
                api.get(`/tasks/${task.id}/time-logs`),
                api.get(`/tasks/${task.id}/histories`)
            ]);
            setComments(commentsRes.data);
            setTimeLogs(logsRes.data);
            setHistories(historiesRes.data);
        } catch (err) {
            setComments([]);
            setTimeLogs([]);
            setHistories([]);
        }
    };

    const closeTaskModal = () => {
        setSelectedTask(null);
        setIsEditingTask(false);
        setComments([]);
        setTimeLogs([]);
        setHistories([]);
        setNewComment('');
        setEditingCommentId(null);
        setEditCommentContent('');
        if (location.search) {
            navigate('/tasks', { replace: true });
        }
    };

    const handleEditClick = () => {
        setEditTitle(selectedTask.title);
        setEditDescription(selectedTask.description || '');
        setEditAssignedToUserId(selectedTask.assignedToUserId || '');
        setEditPriority(selectedTask.priority);
        setEditDueDate(selectedTask.dueDate ? selectedTask.dueDate.split('T')[0] : '');
        setEditEstimatedHours(selectedTask.estimatedHours || '');
        setIsEditingTask(true);
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        try {
            const updatedData = {
                title: editTitle,
                description: editDescription,
                assignedToUserId: editAssignedToUserId || null,
                priority: editPriority,
                dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
                estimatedHours: editEstimatedHours ? parseFloat(editEstimatedHours) : null
            };

            await api.put(`/tasks/${selectedTask.id}`, updatedData);

            setIsEditingTask(false);
            fetchInitialData();

            setSelectedTask(prev => ({ ...prev, ...updatedData }));
            const historyRes = await api.get(`/tasks/${selectedTask.id}/histories`);
            setHistories(historyRes.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update task!');
        }
    };

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

    const handleUpdateComment = async (e, commentId) => {
        e.preventDefault();
        if (!editCommentContent.trim()) return;

        try {
            await api.put(`/comments/${commentId}`, { content: editCommentContent });

            setEditingCommentId(null);
            setEditCommentContent('');

            const res = await api.get(`/tasks/${selectedTask.id}/comments`);
            setComments(res.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update comment!');
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
            const res = await api.get(`/tasks/${selectedTask.id}/time-logs`);
            setTimeLogs(res.data);
            fetchInitialData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add time log!');
        }
    };

    const clearFilters = () => {
        setFilterProjectId('');
        setFilterPriority('');
        setFilterDueBefore('');
        setFilterDueAfter('');
        setCurrentPage(1);
    };

    if (loading) return <div style={{ padding: '50px' }}>Loading...</div>;

    return (
        <div className="page-theme" style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="page-title">
                <h2>Task Management</h2>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {(currentUserRole === 'Admin' || currentUserRole === 'ProjectManager') && (
                <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                    <h3>Create New Task</h3>
                    <form onSubmit={handleCreateTask} style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required style={{ padding: '10px', gridColumn: 'span 1', borderRadius: '4px' }}>
                            <option value="">-- Select Project --</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <input
                            type="text" placeholder="Task Title" value={title} onChange={(e) => setTitle(e.target.value)} required
                            style={{ padding: '10px', gridColumn: 'span 3', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                        <textarea
                            placeholder="Task Description" value={description} onChange={(e) => setDescription(e.target.value)}
                            style={{ padding: '10px', gridColumn: 'span 4', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                        <select value={assignedToUserId} onChange={(e) => setAssignedToUserId(e.target.value)} style={{ padding: '10px', gridColumn: 'span 1', borderRadius: '4px' }}>
                            <option value="">-- Unassigned --</option>
                            {projectMembers.map(m => (
                                <option key={m.id || m.userId} value={m.userId || m.id}>
                                    {m.firstName ? `${m.firstName} ${m.lastName}` : (m.userId || m.id)}
                                </option>
                            ))}
                        </select>
                        <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ padding: '10px', gridColumn: 'span 1', borderRadius: '4px' }}>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px' }}>Due Date (Optional)</label>
                            <input
                                type="date"
                                value={dueDate}
                                min={getSelectedProjectStartDate(projectId)}
                                onChange={(e) => setDueDate(e.target.value)}
                                style={{ padding: '10px', width: '100%', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px' }}>Estimated Hours (Optional)</label>
                            <input type="number" step="0.5" min="0" placeholder="e.g. 4.5" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} style={{ padding: '10px', width: '100%', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', gridColumn: 'span 4', borderRadius: '4px' }}>
                            Add Task
                        </button>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Project</label>
                    <select value={filterProjectId} onChange={(e) => { setFilterProjectId(e.target.value); setCurrentPage(1); }} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '150px' }}>
                        <option value="">All Projects</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Priority</label>
                    <select value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value); setCurrentPage(1); }} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '150px' }}>
                        <option value="">All Priorities</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Due After</label>
                    <input type="date" value={filterDueAfter} onChange={(e) => { setFilterDueAfter(e.target.value); setCurrentPage(1); }} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Due Before</label>
                    <input type="date" value={filterDueBefore} onChange={(e) => { setFilterDueBefore(e.target.value); setCurrentPage(1); }} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <button onClick={clearFilters} style={{ padding: '8px 15px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', height: '35px' }}>Clear</button>
            </div>

            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(4, 1fr)', alignItems: 'start' }}>
                {columns.map(column => (
                    <div
                        key={column}
                        onDragOver={(e) => onDragOver(e, column)}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => onDrop(e, column)}
                        style={{ background: dragOverColumn === column ? '#d3d5db' : '#ebecf0', padding: '15px', borderRadius: '8px', minHeight: '400px', transition: 'background 0.2s ease' }}
                    >
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#172b4d', textTransform: 'uppercase' }}>{column}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {tasks.filter(t => t.status === column).map(task => (
                                <div
                                    key={task.id}
                                    draggable={canManageTask(task)}
                                    onDragStart={(e) => onDragStart(e, task.id)}
                                    onDragEnd={onDragEnd}
                                    onClick={() => openTaskModal(task)}
                                    style={{
                                        background: 'white', padding: '15px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', cursor: 'pointer',
                                        opacity: draggedTaskId === task.id ? 0.4 : 1, transform: draggedTaskId === task.id ? 'scale(0.98)' : 'scale(1)', transition: 'all 0.15s ease'
                                    }}
                                >
                                    <div style={{ fontSize: '10px', color: '#888', marginBottom: '5px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                        {getProjectName(task.projectId)}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', wordBreak: 'break-word' }}>{task.title}</h4>
                                        {canManageTask(task) && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                                style={{ background: 'transparent', border: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '12px', color: '#555', margin: '0 0 10px 0' }}>
                                        {task.description ? (task.description.length > 50 ? task.description.substring(0, 50) + '...' : task.description) : 'No details.'}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: task.priority === 'Critical' ? 'red' : task.priority === 'High' ? 'orange' : 'gray' }}>{task.priority}</span>
                                            {task.estimatedHours && <span style={{ fontSize: '11px', color: '#666' }}>Est: {task.estimatedHours}h</span>}
                                        </div>
                                        <div style={{ fontSize: '10px', background: task.assignedToUserId ? '#e3fcef' : '#ffebe6', color: task.assignedToUserId ? '#006644' : '#bf2600', padding: '3px 6px', borderRadius: '12px', fontWeight: 'bold' }}>
                                            {task.assignedToUserId ? `👤 ${task.assignedToUserFirstName || ''} ${task.assignedToUserLastName || ''}`.trim() : 'Unassigned'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '30px' }}>
                <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '8px 15px', background: currentPage <= 1 ? '#e9ecef' : '#007bff', color: currentPage <= 1 ? '#6c757d' : 'white', border: 'none', borderRadius: '4px', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                    Previous
                </button>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Page {currentPage} of {totalPages || 1}</span>
                <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: '8px 15px', background: currentPage >= totalPages ? '#e9ecef' : '#007bff', color: currentPage >= totalPages ? '#6c757d' : 'white', border: 'none', borderRadius: '4px', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                    Next
                </button>
            </div>

            {selectedTask && (
                <div className="theme-task-modal-backdrop" onMouseDown={e => e.target === e.currentTarget && closeTaskModal()} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                    <div className="theme-task-modal" style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '95%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>

                        <div className="task-modal-toolbar" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '10px' }}>
                            {!isEditingTask && canManageTask(selectedTask) && (
                                <button className="edit-task-modal-button" onClick={handleEditClick} style={{ padding: '6px 12px', background: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Edit Task
                                </button>
                            )}
                            <button onClick={closeTaskModal} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>✖</button>
                        </div>

                        {isEditingTask ? (
                            <form onSubmit={handleUpdateTask} style={{ background: '#fffbcc', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                                <h3 style={{ margin: '0 0 15px 0' }}>Edit Task Details</h3>
                                <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: '1fr 1fr' }}>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Title</label>
                                        <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }} />
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Description</label>
                                        <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} style={{ padding: '10px', width: '100%', boxSizing: 'border-box', minHeight: '80px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Assign To</label>
                                        <select value={editAssignedToUserId} onChange={(e) => setEditAssignedToUserId(e.target.value)} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }}>
                                            <option value="">-- Unassigned --</option>
                                            {projectMembers.map(m => (
                                                <option key={m.id || m.userId} value={m.userId || m.id}>
                                                    {m.firstName ? `${m.firstName} ${m.lastName}` : (m.userId || m.id)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Priority</label>
                                        <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }}>
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                            <option value="Critical">Critical</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Due Date</label>
                                        <input
                                            type="date"
                                            value={editDueDate}
                                            min={getSelectedProjectStartDate(selectedTask.projectId)}
                                            onChange={(e) => setEditDueDate(e.target.value)}
                                            style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Estimated Hours</label>
                                        <input type="number" step="0.5" min="0" value={editEstimatedHours} onChange={(e) => setEditEstimatedHours(e.target.value)} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                    <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Changes</button>
                                    <button type="button" onClick={() => setIsEditingTask(false)} style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <h2 style={{ margin: '0 0 10px 0' }}>{selectedTask.title}</h2>
                                <p style={{ color: '#555', marginBottom: '20px' }}>{selectedTask.description || 'No description provided.'}</p>

                                <div className="task-detail-badges" style={{ display: 'flex', gap: '15px', marginBottom: '20px', fontSize: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span style={{ padding: '5px 10px', background: '#e3fcef', borderRadius: '4px', color: '#006644' }}>Status: <b>{selectedTask.status}</b></span>
                                    <span className="task-detail-badge priority-badge" style={{ padding: '5px 10px', background: '#ebecf0', borderRadius: '4px' }}>Priority: <b>{selectedTask.priority || 'Medium'}</b></span>
                                    {selectedTask.dueDate && <span style={{ padding: '5px 10px', background: '#fffbe6', borderRadius: '4px', color: '#d46b08' }}>Due: <b>{formatDate(selectedTask.dueDate)}</b></span>}
                                    {selectedTask.estimatedHours && <span style={{ padding: '5px 10px', background: '#e6f7ff', borderRadius: '4px', color: '#0050b3' }}>Estimated: <b>{selectedTask.estimatedHours}h</b></span>}
                                    <span style={{ padding: '5px 10px', background: '#f6ffed', borderRadius: '4px', color: '#389e0d', border: '1px solid #b7eb8f' }}>
                                        Total Logged: <b>{timeLogs.reduce((acc, log) => acc + log.hours, 0)}h</b>
                                    </span>
                                </div>
                            </>
                        )}

                        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                            <div>
                                <h3>Time Logs</h3>
                                <div className="task-interaction-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', maxHeight: '250px', overflowY: 'auto' }}>
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
                                                <span style={{ fontSize: '11px', color: '#888' }}>{formatDate(log.workDate)}</span>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {currentUserRole !== 'Viewer' && (
                                    <form className="add-time-log-form" onSubmit={handleAddTimeLog} style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f9f9f9', padding: '15px', borderRadius: '6px' }}>
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
                                )}
                            </div>

                            <div>
                                <h3>Comments</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px', maxHeight: '250px', overflowY: 'auto' }}>
                                    {comments.length === 0 ? (
                                        <p style={{ fontSize: '13px', color: '#888' }}>No comments yet.</p>
                                    ) : (
                                        comments.map(c => (
                                            <div key={c.id} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '6px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                    <strong style={{ fontSize: '13px' }}>{c.userName}</strong>
                                                    <span style={{ fontSize: '11px', color: '#888' }}>
                                                        {formatDate(c.createdAt)} {c.updatedAt && '(Edited)'}
                                                    </span>
                                                </div>

                                                {editingCommentId === c.id ? (
                                                    <form onSubmit={(e) => handleUpdateComment(e, c.id)} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                        <textarea
                                                            value={editCommentContent}
                                                            onChange={(e) => setEditCommentContent(e.target.value)}
                                                            required
                                                            style={{ padding: '8px', minHeight: '60px', borderRadius: '4px', border: '1px solid #ccc' }}
                                                        />
                                                        <div style={{ display: 'flex', gap: '10px' }}>
                                                            <button type="submit" style={{ padding: '6px 12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                                                                Save
                                                            </button>
                                                            <button type="button" onClick={() => setEditingCommentId(null)} style={{ padding: '6px 12px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <>
                                                        <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>{c.content}</p>

                                                        {(currentUserRole === 'Admin' || c.userId === currentUserId) && (
                                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                                <button
                                                                    onClick={() => { setEditingCommentId(c.id); setEditCommentContent(c.content); }}
                                                                    style={{ background: 'transparent', border: 'none', color: '#ffc107', fontSize: '12px', cursor: 'pointer', padding: 0, fontWeight: 'bold' }}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteComment(c.id)}
                                                                    style={{ background: 'transparent', border: 'none', color: '#dc3545', fontSize: '12px', cursor: 'pointer', padding: 0, fontWeight: 'bold' }}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {currentUserRole !== 'Viewer' && (
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
                                )}
                            </div>
                        </div>

                        <div className="activity-history" style={{ marginTop: '30px' }}>
                            <h3 style={{ margin: '0 0 15px 0' }}>Activity History</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '150px', overflowY: 'auto', background: '#fafafa', border: '1px solid #eee', padding: '15px', borderRadius: '6px' }}>
                                {histories.length === 0 ? (
                                    <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>No activity recorded yet.</p>
                                ) : (
                                    histories.map(h => (
                                        <div key={h.id} style={{ fontSize: '13px', display: 'flex', gap: '12px', alignItems: 'flex-start', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                                            <span style={{ color: '#888', minWidth: '130px', flexShrink: 0 }}>{formatDate(h.createdAt)}</span>
                                            <span style={{ color: '#007bff', flexShrink: 0 }}>•</span>
                                            <span style={{ color: '#333' }}>{h.description}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}