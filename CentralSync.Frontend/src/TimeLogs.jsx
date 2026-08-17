import { useState, useEffect } from 'react';
import api from './api';

export default function TimeLogs() {
    const [timeLogs, setTimeLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [currentUserRole, setCurrentUserRole] = useState('');

    const [filterUserId, setFilterUserId] = useState('');
    const [filterTaskId, setFilterTaskId] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role;
                setCurrentUserRole(role);
            } catch (e) {
                console.error("Token could not be parsed.");
            }
        }
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchTimeLogs();
    }, [filterUserId, filterTaskId, filterStartDate, filterEndDate]);

    const fetchInitialData = async () => {
        try {
            const [usersRes, tasksRes] = await Promise.all([
                api.get('/users'),
                api.get('/tasks', { params: { pageSize: 1000 } })
            ]);
            setUsers(usersRes.data.items || usersRes.data);
            setTasks(tasksRes.data.items || tasksRes.data);
            await fetchTimeLogs();
        } catch (err) {
            setError('Error loading initial filter data.');
            setLoading(false);
        }
    };

    const fetchTimeLogs = async () => {
        try {
            const params = {};
            if (filterUserId) params.userId = filterUserId;
            if (filterTaskId) params.taskId = filterTaskId;
            if (filterStartDate) params.startDate = new Date(filterStartDate).toISOString();
            if (filterEndDate) params.endDate = new Date(filterEndDate).toISOString();

            const res = await api.get('/time-logs', { params });
            setTimeLogs(res.data);
            setLoading(false);
        } catch (err) {
            setError('Error loading time logs.');
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('tr-TR');
    };

    const clearFilters = () => {
        setFilterUserId('');
        setFilterTaskId('');
        setFilterStartDate('');
        setFilterEndDate('');
    };

    if (loading) return <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>Loading time logs...</div>;

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Time Logs & Reports</h2>
                <div>
                    <button
                        onClick={() => { window.location.href = '/projects'; }}
                        style={{ padding: '8px 15px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer', marginRight: '10px', borderRadius: '4px' }}
                    >
                        Go to Projects
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

            {error && <p style={{ color: 'red', background: '#ffe6e6', padding: '10px', borderRadius: '4px' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                {currentUserRole !== 'TeamMember' && (
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>User</label>
                        <select value={filterUserId} onChange={(e) => setFilterUserId(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '180px' }}>
                            <option value="">All Users</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                        </select>
                    </div>
                )}
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Task</label>
                    <select value={filterTaskId} onChange={(e) => setFilterTaskId(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '200px' }}>
                        <option value="">All Tasks</option>
                        {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Start Date</label>
                    <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>End Date</label>
                    <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <button onClick={clearFilters} style={{ padding: '8px 15px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', height: '35px', fontWeight: 'bold' }}>Clear</button>
            </div>

            <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', overflow: 'hidden', marginBottom: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <th style={{ padding: '15px' }}>User</th>
                            <th style={{ padding: '15px' }}>Task ID</th>
                            <th style={{ padding: '15px' }}>Description</th>
                            <th style={{ padding: '15px' }}>Work Date</th>
                            <th style={{ padding: '15px', textAlign: 'right' }}>Hours</th>
                        </tr>
                    </thead>
                    <tbody>
                        {timeLogs.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '25px', textAlign: 'center', color: '#888' }}>No time logs found matching the criteria.</td>
                            </tr>
                        ) : (
                            timeLogs.map(log => (
                                <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{log.userFullName}</td>
                                    <td style={{ padding: '15px', color: '#666', fontSize: '12px' }}>{log.taskId}</td>
                                    <td style={{ padding: '15px' }}>{log.description || '-'}</td>
                                    <td style={{ padding: '15px' }}>{formatDate(log.workDate)}</td>
                                    <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#0056b3' }}>{log.hours}h</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ background: '#e6f7ff', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #91d5ff' }}>
                <span style={{ fontWeight: 'bold', color: '#0050b3' }}>Total Logged Hours for Filtered Results:</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#0050b3' }}>
                    {timeLogs.reduce((acc, log) => acc + log.hours, 0)}h
                </span>
            </div>
        </div>
    );
}