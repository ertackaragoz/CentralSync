import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { loadProjectRoles } from './projectAccess';

export default function Dashboard() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [timeLogs, setTimeLogs] = useState([]);
    const [projects, setProjects] = useState([]);
    const [projectRoles, setProjectRoles] = useState({});
    const [projectRolesLoading, setProjectRolesLoading] = useState(true);
    const [selectedDashboardTask, setSelectedDashboardTask] = useState(null);
    const [currentUserId, setCurrentUserId] = useState('');
    const [currentUserRole, setCurrentUserRole] = useState('');
    const [currentUserName, setCurrentUserName] = useState('Kullanıcı');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTasksModal, setShowTasksModal] = useState(false);
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [showTimeLogFilters, setShowTimeLogFilters] = useState(false);
    const [filterUserId, setFilterUserId] = useState('');
    const [filterTaskId, setFilterTaskId] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [draftFilterUserId, setDraftFilterUserId] = useState('');
    const [draftFilterTaskId, setDraftFilterTaskId] = useState('');
    const [draftFilterStartDate, setDraftFilterStartDate] = useState('');
    const [draftFilterEndDate, setDraftFilterEndDate] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const id = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.nameid || payload.sub || payload.id || '';
            const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role || '';
            const first = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] || payload.given_name || payload.firstName || payload.firstname || '';
            const last = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] || payload.family_name || payload.lastName || payload.lastname || '';
            const fullName = payload.name || payload.FullName || payload.fullName || payload.displayName || '';
            const email = payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '';
            setCurrentUserId(String(id));
            setCurrentUserRole(role);
            if (first || last) {
                setCurrentUserName(`${first} ${last}`.trim());
            } else if (fullName) {
                setCurrentUserName(fullName);
            } else if (email) {
                const localPart = String(email).split('@')[0].split(/[._-]/)[0];
                if (localPart) setCurrentUserName(localPart.charAt(0).toUpperCase() + localPart.slice(1));
            }
        } catch {
            localStorage.removeItem('token');
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        const load = async () => {
            try {
                const results = await Promise.allSettled([
                    api.get('/tasks', { params: { pageSize: 1000 } }),
                    api.get('/projects', { params: { pageSize: 1000 } })
                ]);

                const tasksResponse = results[0];
                const projectsResponse = results[1];

                if (tasksResponse.status === 'fulfilled') {
                    setTasks(tasksResponse.value.data.items || tasksResponse.value.data || []);
                }

                if (projectsResponse.status === 'fulfilled') {
                    setProjects(projectsResponse.value.data.items || projectsResponse.value.data || []);
                }
            } catch (err) {
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [navigate]);

    useEffect(() => {
        if (currentUserRole !== 'Admin') {
            setUsers([]);
            return;
        }

        const loadUsers = async () => {
            try {
                const response = await api.get('/users');
                setUsers(response.data.items || response.data || []);
            } catch {
                setUsers([]);
            }
        };

        loadUsers();
    }, [currentUserRole]);

    useEffect(() => {
        const loadTimeLogs = async () => {
            try {
                const params = {};
                if (filterUserId) params.userId = filterUserId;
                if (filterTaskId) params.taskId = filterTaskId;
                if (filterStartDate) params.startDate = new Date(filterStartDate).toISOString();
                if (filterEndDate) params.endDate = new Date(filterEndDate).toISOString();

                const response = await api.get('/time-logs', { params });
                setTimeLogs(response.data || []);
            } catch (err) {
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        };

        loadTimeLogs();
    }, [filterUserId, filterTaskId, filterStartDate, filterEndDate, navigate]);

    useEffect(() => {
        if (!currentUserId || !users.length) return;
        const me = users.find(user => String(user.id) === String(currentUserId));
        if (me) {
            const fullName = `${me.firstName || ''} ${me.lastName || ''}`.trim();
            if (fullName) setCurrentUserName(fullName);
            if (me.role) setCurrentUserRole(me.role);
        }
    }, [currentUserId, users]);

    useEffect(() => {
        if (!currentUserId || !projects.length) {
            setProjectRolesLoading(false);
            return;
        }

        setProjectRolesLoading(true);
        loadProjectRoles(api, projects, currentUserId)
            .then(setProjectRoles)
            .finally(() => setProjectRolesLoading(false));
    }, [currentUserId, projects]);

    useEffect(() => {
        if (!currentUserId || currentUserName !== 'Kullanıcı' || !timeLogs.length) return;

        const ownLog = timeLogs.find(log => String(log.userId) === String(currentUserId) && log.userFullName);
        if (ownLog?.userFullName) {
            setCurrentUserName(ownLog.userFullName);
        }
    }, [currentUserId, currentUserName, timeLogs]);

    useEffect(() => {
        if (!currentUserId || currentUserName !== 'Kullanıcı') return;

        const assignedTask = tasks.find(task => String(task.assignedToUserId) === String(currentUserId));
        const candidate =
            assignedTask?.assignedToUser ||
            assignedTask?.assignedUser ||
            assignedTask?.assignedUserDto ||
            assignedTask?.user;

        if (candidate?.firstName) {
            const fullName = `${candidate.firstName} ${candidate.lastName || ''}`.trim();
            if (fullName) setCurrentUserName(fullName);
        }
    }, [currentUserId, currentUserName, tasks]);

    const myTasks = useMemo(() => {
        if (!currentUserId) return [];
        return tasks.filter(task => String(task.assignedToUserId) === String(currentUserId));
    }, [tasks, currentUserId]);

    const activeTasks = useMemo(() => myTasks.filter(task => task.status !== 'Done'), [myTasks]);
    const completedTasks = useMemo(() => myTasks.filter(task => task.status === 'Done'), [myTasks]);

    const recentTimeLogs = useMemo(() => {
        return [...timeLogs].sort((a, b) => new Date(b.workDate || 0) - new Date(a.workDate || 0)).slice(0, 8);
    }, [timeLogs]);

    const totalHours = useMemo(() => timeLogs.reduce((sum, log) => sum + (Number(log.hours) || 0), 0), [timeLogs]);

    const formatDate = date => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('tr-TR');
    };

    const statusClass = status => {
        if (status === 'InProgress') return 'green';
        if (status === 'InReview') return 'orange';
        if (status === 'Done') return 'muted';
        return 'red';
    };

    const statusLabel = status => ({
        Todo: 'To Do',
        InProgress: 'In Progress',
        InReview: 'In Review',
        Done: 'Done'
    }[status] || status);

    const openTask = task => setSelectedDashboardTask(task);

    const getDashboardProjectRole = task => task ? projectRoles[task.projectId] || null : null;

    const canManageDashboardTask = task => {
        if (!task || projectRolesLoading) return false;

        const projectRole = getDashboardProjectRole(task);
        if (projectRole === 'Viewer') return false;

        if (currentUserRole === 'Admin') return true;

        const project = projects.find(p => String(p.id) === String(task.projectId));
        return Boolean(project && String(project.ownerId) === String(currentUserId));
    };

    const canInteractWithDashboardTask = task => {
        if (!task || projectRolesLoading) return false;
        return getDashboardProjectRole(task) !== 'Viewer';
    };

    const interactWithDashboardTask = task => {
        setSelectedDashboardTask(null);
        navigate(`/tasks?taskId=${task.id}&mode=interact`);
    };

    const editDashboardTask = task => {
        setSelectedDashboardTask(null);
        navigate(`/tasks?taskId=${task.id}&mode=edit`);
    };

    const priorityClass = priority => {
        if (priority === 'Critical') return 'critical';
        if (priority === 'High') return 'high';
        if (priority === 'Medium') return 'medium';
        return 'low';
    };

    const loadReviews = async () => {
        setReviewsLoading(true);
        try {
            const results = await Promise.all(activeTasks.concat(completedTasks).slice(0, 10).map(async task => {
                try {
                    const response = await api.get(`/tasks/${task.id}/comments`);
                    return (response.data || []).map(comment => ({ ...comment, taskId: task.id, taskTitle: task.title }));
                } catch {
                    return [];
                }
            }));
            setReviews(results.flat().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 10));
        } finally {
            setReviewsLoading(false);
        }
    };

    const openReviews = async () => {
        setShowReviewsModal(true);
        await loadReviews();
    };

    const openTimeLogFilters = () => {
        setDraftFilterUserId(filterUserId);
        setDraftFilterTaskId(filterTaskId);
        setDraftFilterStartDate(filterStartDate);
        setDraftFilterEndDate(filterEndDate);
        setShowTimeLogFilters(true);
    };

    const applyTimeLogFilters = () => {
        setFilterUserId(draftFilterUserId);
        setFilterTaskId(draftFilterTaskId);
        setFilterStartDate(draftFilterStartDate);
        setFilterEndDate(draftFilterEndDate);
        setShowTimeLogFilters(false);
    };

    const clearTimeLogFilters = () => {
        setDraftFilterUserId('');
        setDraftFilterTaskId('');
        setDraftFilterStartDate('');
        setDraftFilterEndDate('');
        setFilterUserId('');
        setFilterTaskId('');
        setFilterStartDate('');
        setFilterEndDate('');
    };

    if (loading) {
        return <div className="dashboard-loading">Yükleniyor...</div>;
    }

    return (
        <div className="dashboard-page">
            <main className="dashboard-main">
                <section className="dashboard-hero">
                    <div className="eyebrow green">{currentUserRole || 'TEAM MEMBER'} <span>/ CENTRALSYNC</span></div>
                    <h1>
                        <span>Hoş geldin,</span><br />
                        <strong>{currentUserName || 'Kullanıcı'}</strong>
                    </h1>
                    <p>Projelerini takip et, sana atanan görevleri yönet, ekibinle yorumlaş ve çalışma sürelerini tek bir ekrandan kaydet.</p>

                    <div className="stats-row">
                        <div className="stat-card"><span>Aktif Görev</span><strong>{activeTasks.length}</strong></div>
                        <div className="stat-card"><span>Tamamlanan</span><strong className="green-text">{completedTasks.length}</strong></div>
                        <div className="stat-card"><span>Kayıtlı Saat</span><strong>{totalHours}h</strong></div>
                    </div>
                </section>

                <section className="dashboard-side">
                    <article className="dashboard-card">
                        <div className="card-heading">
                            <h2>Bana Atanan Görevler</h2>
                            <span>{activeTasks.length} AKTİF</span>
                        </div>

                        <div className="card-scroll task-preview-scroll">
                            {activeTasks.length === 0 ? (
                                <div className="empty-state">Aktif görevin bulunmuyor.</div>
                            ) : activeTasks.slice(0, 8).map(task => (
                                <button key={task.id} className="task-preview-row" onClick={() => openTask(task)}>
                                    <div><i className={`task-dot ${statusClass(task.status)}`}></i><span>{task.title}</span></div>
                                    <div className="task-preview-meta">
                                        <em className={priorityClass(task.priority)}>{task.priority || 'Medium'}</em>
                                        <em className={statusClass(task.status)}>{statusLabel(task.status)}</em>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </article>

                    <article className="dashboard-card offset-card">
                        <div className="card-heading activity-heading">
                            <h2>Son Aktiviteler <span>/ ZAMAN KAYITLARI</span></h2>
                            <button className="filter-button" onClick={openTimeLogFilters}>Filtrele</button>
                        </div>

                        <div className="card-scroll activity-scroll">
                            {recentTimeLogs.length === 0 ? (
                                <div className="empty-state">Henüz zaman kaydı bulunmuyor.</div>
                            ) : recentTimeLogs.map(log => (
                                <div key={log.id} className="activity-row">
                                    <i></i>
                                    <div>
                                        <p><b>{log.userFullName || 'System Admin'}</b> çalışma süresi ekledi. <span>({log.hours} saat)</span></p>
                                        <small>{formatDate(log.workDate)}{log.description ? ` · ${log.description}` : ''}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </article>
                </section>
            </main>

            <footer className="dashboard-footer">
                <span>CENTRALSync <small>· Dahili çalışma alanı</small></span>
                <span>Projeler, görevler, zaman kayıtları ve ekip yönetimi tek bir yerde.</span>
            </footer>

            {showTasksModal && (
                <div className="theme-modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setShowTasksModal(false)}>
                    <div className="theme-modal">
                        <div className="modal-heading"><h3>Tüm Görevlerim</h3><button onClick={() => setShowTasksModal(false)}>×</button></div>
                        <div className="modal-scroll">
                            {[...activeTasks, ...completedTasks].map(task => (
                                <button key={task.id} className="modal-task" onClick={() => openTask(task)}>
                                    <div><i className={`task-dot ${statusClass(task.status)}`}></i><span>{task.title}</span></div>
                                    <div className="task-preview-meta">
                                        <em className={priorityClass(task.priority)}>{task.priority || 'Medium'}</em>
                                        <em className={statusClass(task.status)}>{statusLabel(task.status)}</em>
                                    </div>
                                </button>
                            ))}
                            {myTasks.length === 0 && <div className="empty-state">Sana atanmış görev bulunmuyor.</div>}
                        </div>
                    </div>
                </div>
            )}

            {showReviewsModal && (
                <div className="theme-modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setShowReviewsModal(false)}>
                    <div className="theme-modal">
                        <div className="modal-heading">
                            <h3>İncelemeler</h3>
                            <button onClick={() => setShowReviewsModal(false)}>×</button>
                        </div>
                        <div className="modal-scroll">
                            {reviewsLoading ? (
                                <div className="empty-state">İncelemeler yükleniyor...</div>
                            ) : reviews.length === 0 ? (
                                <div className="empty-state">Henüz inceleme bulunmuyor.</div>
                            ) : reviews.map(review => (
                                <div key={review.id} className="review-card">
                                    <div className="review-title">{review.taskTitle}</div>
                                    <div className="review-meta">
                                        <span>{review.userFullName || 'Kullanıcı'}</span>
                                        <small>{formatDate(review.createdAt)}</small>
                                    </div>
                                    <p>{review.content}</p>
                                    <button onClick={() => {
                                        setShowReviewsModal(false);
                                        navigate(`/tasks?taskId=${review.taskId}`);
                                    }}>
                                        Görevi Aç
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {selectedDashboardTask && (
                <div className="theme-modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setSelectedDashboardTask(null)}>
                    <div className="theme-modal dashboard-task-modal">
                        <div className="modal-heading">
                            <h3>{selectedDashboardTask.title}</h3>
                            <button onClick={() => setSelectedDashboardTask(null)}>×</button>
                        </div>

                        <div className="dashboard-task-summary">
                            <p>{selectedDashboardTask.description || 'Açıklama bulunmuyor.'}</p>

                            <div className="dashboard-task-badges">
                                <span className={`task-detail-badge status-badge ${statusClass(selectedDashboardTask.status)}`}>
                                    Status: {statusLabel(selectedDashboardTask.status)}
                                </span>
                                <span className={`task-detail-badge priority-badge ${priorityClass(selectedDashboardTask.priority)}`}>
                                    Priority: {selectedDashboardTask.priority || 'Medium'}
                                </span>
                            </div>
                        </div>

                        <div className="dashboard-task-actions">
                            {canInteractWithDashboardTask(selectedDashboardTask) && (
                                <button className="primary-button" onClick={() => interactWithDashboardTask(selectedDashboardTask)}>Interact</button>
                            )}
                            {canManageDashboardTask(selectedDashboardTask) && (
                                <button className="secondary-button" onClick={() => editDashboardTask(selectedDashboardTask)}>Edit Task</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showTimeLogFilters && (
                <div className="theme-modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setShowTimeLogFilters(false)}>
                    <div className="theme-modal filter-modal">
                        <div className="modal-heading">
                            <h3>Zaman Kayıtlarını Filtrele</h3>
                            <button onClick={() => setShowTimeLogFilters(false)}>×</button>
                        </div>

                        <div className="filter-grid">
                            <label>
                                Kullanıcı
                                <select value={draftFilterUserId} onChange={e => setDraftFilterUserId(e.target.value)}>
                                    <option value="">Tüm kullanıcılar</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.firstName} {user.lastName}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Görev
                                <select value={draftFilterTaskId} onChange={e => setDraftFilterTaskId(e.target.value)}>
                                    <option value="">Tüm görevler</option>
                                    {tasks.map(task => (
                                        <option key={task.id} value={task.id}>
                                            {task.title}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Başlangıç tarihi
                                <input type="date" value={draftFilterStartDate} onChange={e => setDraftFilterStartDate(e.target.value)} />
                            </label>

                            <label>
                                Bitiş tarihi
                                <input type="date" value={draftFilterEndDate} onChange={e => setDraftFilterEndDate(e.target.value)} />
                            </label>
                        </div>

                        <div className="filter-actions">
                            <button className="filter-clear-button" onClick={clearTimeLogFilters}>
                                Temizle
                            </button>
                            <button className="primary-button" onClick={applyTimeLogFilters}>
                                Uygula
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
