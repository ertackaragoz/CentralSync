import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

export default function Dashboard() {
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [timeLogs, setTimeLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showTasksModal, setShowTasksModal] = useState(false);
    const [showReviewsModal, setShowReviewsModal] = useState(false);

    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    const [currentUserId, setCurrentUserId] = useState('');
    const [currentUserRole, setCurrentUserRole] = useState('');
    const [currentUserName, setCurrentUserName] = useState('Kullanıcı');

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));

            const userId =
                payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
                payload.nameid ||
                payload.sub ||
                payload.id ||
                '';

            const role =
                payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                payload.role ||
                '';

            const firstName =
                payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] ||
                payload.given_name ||
                payload.firstName ||
                '';

            const lastName =
                payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] ||
                payload.family_name ||
                payload.lastName ||
                '';

            setCurrentUserId(userId);
            setCurrentUserRole(role);
            setCurrentUserName(
                `${firstName || ''} ${lastName || ''}`.trim() || 'Kullanıcı'
            );
        } catch {
            localStorage.removeItem('token');
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);

        try {
            const [tasksRes, timeLogsRes] = await Promise.all([
                api.get('/tasks', {
                    params: {
                        pageSize: 1000
                    }
                }),
                api.get('/time-logs')
            ]);

            setTasks(tasksRes.data.items || tasksRes.data || []);
            setTimeLogs(timeLogsRes.data || []);
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const myTasks = useMemo(() => {
        if (!currentUserId) {
            return tasks;
        }

        return tasks.filter(
            task => String(task.assignedToUserId) === String(currentUserId)
        );
    }, [tasks, currentUserId]);

    const activeTasks = useMemo(() => {
        return myTasks.filter(
            task => task.status !== 'Done'
        );
    }, [myTasks]);

    const completedTasks = useMemo(() => {
        return myTasks.filter(task => task.status === 'Done');
    }, [myTasks]);

    const recentTimeLogs = useMemo(() => {
        return [...timeLogs]
            .sort((a, b) => {
                const dateA = new Date(a.workDate || 0).getTime();
                const dateB = new Date(b.workDate || 0).getTime();
                return dateB - dateA;
            })
            .slice(0, 8);
    }, [timeLogs]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';

        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const statusClass = (status) => {
        switch (status) {
            case 'InProgress':
                return 'text-accentGreen border-accentGreen/30';
            case 'InReview':
                return 'text-accentSoft border-accentSoft/30';
            case 'Done':
                return 'text-gray-400 border-gray-600/50';
            case 'Todo':
            default:
                return 'text-red-400 border-red-400/30';
        }
    };

    const statusDotClass = (status) => {
        switch (status) {
            case 'InProgress':
                return 'bg-accentGreen shadow-[0_0_8px_rgba(167,243,208,0.5)]';
            case 'InReview':
                return 'bg-accentSoft shadow-[0_0_8px_rgba(253,186,116,0.6)]';
            case 'Done':
                return 'bg-gray-500';
            case 'Todo':
            default:
                return 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]';
        }
    };

    const displayStatus = (status) => {
        switch (status) {
            case 'InProgress':
                return 'In Progress';
            case 'InReview':
                return 'In Review';
            case 'Todo':
                return 'To Do';
            case 'Done':
                return 'Done';
            default:
                return status;
        }
    };

    const openTask = (task) => {
        navigate(`/tasks?taskId=${task.id}`);
    };

    const loadReviews = async () => {
        if (!myTasks.length) {
            setReviews([]);
            return;
        }

        setReviewsLoading(true);

        try {
            const taskSubset = myTasks.slice(0, 8);

            const commentResults = await Promise.all(
                taskSubset.map(async task => {
                    try {
                        const response = await api.get(`/tasks/${task.id}/comments`);

                        return (response.data || []).map(comment => ({
                            ...comment,
                            taskTitle: task.title
                        }));
                    } catch {
                        return [];
                    }
                })
            );

            const flattened = commentResults
                .flat()
                .sort((a, b) => {
                    const dateA = new Date(
                        a.createdAt || a.updatedAt || 0
                    ).getTime();

                    const dateB = new Date(
                        b.createdAt || b.updatedAt || 0
                    ).getTime();

                    return dateB - dateA;
                });

            setReviews(flattened.slice(0, 10));
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleOpenReviews = async () => {
        setShowReviewsModal(true);
        await loadReviews();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-darkBase text-gray-200 flex items-center justify-center font-sans">
                <div className="text-accentSoft uppercase tracking-[0.2em] text-sm font-bold">
                    Yükleniyor...
                </div>
            </div>
        );
    }

    return (
        <div className="bg-darkBase text-gray-200 font-sans antialiased min-h-screen flex flex-col relative z-0 overflow-hidden w-full isolate">
            <div className="brand-glow rounded-full" aria-hidden="true"></div>

            <nav className="flex items-center justify-between gap-4 px-4 sm:px-10 py-5 border-b border-gray-700/50 relative z-10 bg-darkBase/55 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 shrink-0">
                    <div className="flex items-end gap-1 h-5 sm:h-6 shrink-0" aria-hidden="true">
                        <div className="w-1.5 sm:w-2 h-3.5 sm:h-4 bg-accentSoft rounded-sm opacity-60"></div>
                        <div className="w-1.5 sm:w-2 h-5 sm:h-6 bg-accentSoft rounded-sm"></div>
                        <div className="w-1.5 sm:w-2 h-3 sm:h-3 bg-accentSoft rounded-sm opacity-80"></div>
                    </div>

                    <div className="text-[17px] sm:text-xl whitespace-nowrap leading-none">
                        <span className="font-extrabold tracking-[0.12em] sm:tracking-widest text-gray-100">
                            HEWESO
                        </span>
                        <span className="font-light text-accentSoft tracking-normal sm:tracking-wide">
                            Sync
                        </span>
                    </div>
                </div>

                <ul className="hidden lg:flex gap-8 xl:gap-10 text-sm uppercase tracking-[0.14em] text-gray-400">
                    <li
                        onClick={() => navigate('/dashboard')}
                        className="cursor-pointer font-bold text-gray-100"
                    >
                        Panel
                    </li>

                    <li
                        onClick={() => navigate('/tasks')}
                        className="hover:text-accentSoft cursor-pointer transition-colors"
                    >
                        Görevler
                    </li>

                    <li
                        onClick={() => navigate('/projects')}
                        className="hover:text-accentSoft cursor-pointer transition-colors"
                    >
                        Projeler
                    </li>

                    {currentUserRole === 'Admin' && (
                        <li
                            onClick={() => navigate('/users')}
                            className="hover:text-accentSoft cursor-pointer transition-colors"
                        >
                            Ekip
                        </li>
                    )}
                </ul>

                <button
                    onClick={handleLogout}
                    className="border border-accentSoft text-accentSoft px-4 sm:px-6 py-2.5 uppercase text-xs sm:text-sm tracking-[0.12em] sm:tracking-wider font-semibold hover:bg-accentSoft hover:text-darkBase transition-colors duration-300 rounded-sm whitespace-nowrap shrink-0"
                >
                    Çıkış Yap
                </button>
            </nav>

            <main className="flex-1 px-6 sm:px-10 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 items-center relative z-10 overflow-y-auto py-8 lg:py-0">
                <section className="lg:col-span-7 space-y-6 lg:pr-4">
                    <p className="text-sm sm:text-[15px] font-bold tracking-[0.18em] text-accentGreen/90 uppercase">
                        {currentUserRole || 'TEAM MEMBER'}
                        <span className="text-gray-500/40 font-medium ml-1">
                            / HEWESOSYNC
                        </span>
                    </p>

                    <h1 className="text-[3.25rem] sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.02]">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-accentGreen to-accentSoft">
                            Hoş geldin,
                        </span>
                        <br />
                        <span className="text-gray-100">
                            {currentUserName}
                        </span>
                    </h1>

                    <p className="text-mutedCopy max-w-xl text-[17px] md:text-lg leading-7">
                        Projelerini takip et, sana atanan görevleri yönet, ekibinle yorumlaş ve çalışma sürelerini tek bir ekrandan kaydet.
                    </p>

                    <div className="pt-2 flex flex-wrap gap-5">
                        <button
                            onClick={() => setShowTasksModal(true)}
                            className="bg-accentSoft text-darkBase border border-accentSoft px-7 sm:px-8 py-3.5 text-sm uppercase tracking-wider font-bold hover:bg-transparent hover:text-accentSoft transition-all duration-300 shadow-lg shadow-accentSoft/20 rounded-sm whitespace-nowrap"
                        >
                            Tüm Görevlerim
                        </button>

                        <div className="relative inline-block">
                            <button
                                onClick={handleOpenReviews}
                                className="text-gray-200 border border-gray-500/70 px-7 sm:px-8 py-3.5 text-sm uppercase tracking-wider font-semibold hover:border-gray-300 hover:text-white transition-colors duration-300 rounded-sm whitespace-nowrap"
                            >
                                İncelemeler
                            </button>

                            {reviews.length > 0 && (
                                <span className="absolute -top-2.5 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-accentSoft text-darkBase text-[12px] font-extrabold shadow-[0_0_10px_rgba(253,186,116,0.5)] border-2 border-darkBase">
                                    {reviews.length > 9 ? '9+' : reviews.length}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 max-w-2xl">
                        <div className="bg-darkSurface/60 border border-gray-500/20 rounded-xl p-4">
                            <div className="text-gray-500 uppercase tracking-widest text-[10px] font-bold">
                                Aktif Görev
                            </div>
                            <div className="text-2xl font-extrabold text-accentSoft mt-1">
                                {activeTasks.length}
                            </div>
                        </div>

                        <div className="bg-darkSurface/60 border border-gray-500/20 rounded-xl p-4">
                            <div className="text-gray-500 uppercase tracking-widest text-[10px] font-bold">
                                Tamamlanan
                            </div>
                            <div className="text-2xl font-extrabold text-accentGreen mt-1">
                                {completedTasks.length}
                            </div>
                        </div>

                        <div className="bg-darkSurface/60 border border-gray-500/20 rounded-xl p-4 col-span-2 sm:col-span-1">
                            <div className="text-gray-500 uppercase tracking-widest text-[10px] font-bold">
                                Kayıtlı Saat
                            </div>
                            <div className="text-2xl font-extrabold text-gray-100 mt-1">
                                {timeLogs.reduce(
                                    (total, log) => total + (Number(log.hours) || 0),
                                    0
                                )}
                                h
                            </div>
                        </div>
                    </div>
                </section>

                <section className="lg:col-span-5 space-y-6 relative">
                    <div className="absolute -inset-4 border border-gray-600/30 rounded-3xl opacity-50 scale-110 -z-10 pointer-events-none"></div>

                    <article className="workspace-card relative bg-darkSurface p-6 sm:p-7 rounded-xl shadow-xl shadow-black/40 border border-gray-500/25">
                        <div className="flex justify-between items-center gap-4 mb-5">
                            <h2 className="text-xl font-semibold text-gray-100">
                                Bana Atanan Görevler
                            </h2>

                            <span className="bg-accentSoft text-darkBase text-[13px] font-extrabold px-2.5 py-1 rounded whitespace-nowrap">
                                {activeTasks.length} AKTİF
                            </span>
                        </div>

                        <div className="space-y-3 relative h-[180px] overflow-y-auto custom-scrollbar pr-2">
                            {activeTasks.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                                    Aktif görevin bulunmuyor.
                                </div>
                            ) : (
                                activeTasks.slice(0, 8).map(task => (
                                    <button
                                        key={task.id}
                                        onClick={() => openTask(task)}
                                        className="w-full flex justify-between items-center gap-5 text-left text-[15px] leading-6 border-b border-gray-500/40 pb-3 hover:bg-white/5 p-2 -mx-2 rounded transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span
                                                className={`w-2 h-2 rounded-full shrink-0 ${statusDotClass(task.status)}`}
                                            ></span>

                                            <span className="text-gray-200 font-medium truncate">
                                                {task.title}
                                            </span>
                                        </div>

                                        <span
                                            className={`font-bold whitespace-nowrap text-[11px] border px-2 py-0.5 rounded uppercase tracking-wider ${statusClass(task.status)}`}
                                        >
                                            {displayStatus(task.status)}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </article>

                    <article className="workspace-card relative bg-darkSurface p-6 sm:p-7 rounded-xl shadow-xl shadow-black/40 border border-gray-500/25 lg:ml-8">
                        <div className="flex justify-between items-center gap-4 mb-5">
                            <h2 className="text-xl font-semibold text-gray-100 flex items-center">
                                Son Aktiviteler
                                <span className="text-sm font-medium text-gray-500/40 ml-2 tracking-wide hidden sm:inline-block">
                                    / ZAMAN KAYITLARI
                                </span>
                            </h2>
                        </div>

                        <div className="space-y-4 h-[180px] overflow-y-auto custom-scrollbar pr-2">
                            {recentTimeLogs.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                                    Henüz zaman kaydı bulunmuyor.
                                </div>
                            ) : (
                                recentTimeLogs.map(log => (
                                    <div
                                        key={log.id}
                                        className="flex items-start gap-3 group"
                                    >
                                        <div className="w-2 h-2 mt-2 rounded-full bg-accentGreen/50 shrink-0"></div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-200 text-[14.5px] leading-snug">
                                                <span className="font-semibold text-gray-100">
                                                    {log.userFullName || currentUserName}
                                                </span>{' '}
                                                {log.description
                                                    ? `${log.description}`
                                                    : 'çalışma süresi ekledi.'}{' '}
                                                <span className="text-accentSoft">
                                                    ({log.hours} saat)
                                                </span>
                                            </p>

                                            <p className="text-gray-500 text-xs mt-1">
                                                {formatDate(log.workDate)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </article>
                </section>
            </main>

            <footer className="px-6 sm:px-10 py-5 flex flex-col sm:flex-row gap-3 sm:gap-6 justify-between sm:items-center border-t border-gray-800 relative z-10 bg-darkBase/55 backdrop-blur-sm text-sm shrink-0">
                <p className="text-gray-300 font-medium">
                    HEWESOSync{' '}
                    <span className="text-gray-500 font-normal">
                        · Dahili çalışma alanı
                    </span>
                </p>

                <p className="text-gray-400">
                    Projeler, görevler, zaman kayıtları ve ekip yönetimi tek bir yerde.
                </p>
            </footer>

            {showTasksModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowTasksModal(false);
                        }
                    }}
                >
                    <div className="relative bg-darkSurface border border-gray-600/40 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh]">
                        <div className="flex justify-between items-center mb-6 shrink-0 border-b border-gray-600/30 pb-4">
                            <h3 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-accentSoft"></span>
                                Tüm Görevlerim
                            </h3>

                            <button
                                onClick={() => setShowTasksModal(false)}
                                className="text-gray-400 hover:text-accentSoft transition-colors text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="overflow-y-auto custom-scrollbar pr-3 space-y-8 flex-1">
                            {activeTasks.length > 0 && (
                                <div>
                                    <p className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-accentGreen"></span>
                                        Aktif Görevler
                                    </p>

                                    <div className="space-y-2">
                                        {activeTasks.map(task => (
                                            <button
                                                key={task.id}
                                                onClick={() => openTask(task)}
                                                className="w-full flex justify-between items-center gap-5 text-left text-[15px] leading-6 bg-darkBase/40 border border-gray-600/30 p-3.5 rounded-lg hover:border-gray-500 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span
                                                        className={`w-2 h-2 rounded-full shrink-0 ${statusDotClass(task.status)}`}
                                                    ></span>

                                                    <span className="text-gray-200 font-medium truncate">
                                                        {task.title}
                                                    </span>
                                                </div>

                                                <span
                                                    className={`font-bold whitespace-nowrap text-[11px] border px-2 py-0.5 rounded uppercase tracking-wider ${statusClass(task.status)}`}
                                                >
                                                    {displayStatus(task.status)}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {completedTasks.length > 0 && (
                                <div>
                                    <p className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                                        Geçmiş Görevler
                                    </p>

                                    <div className="space-y-2 opacity-70">
                                        {completedTasks.map(task => (
                                            <button
                                                key={task.id}
                                                onClick={() => openTask(task)}
                                                className="w-full flex justify-between items-center gap-5 text-left text-[15px] leading-6 bg-darkBase/20 border border-gray-700/50 p-3.5 rounded-lg hover:border-gray-600 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span className="w-2 h-2 rounded-full bg-gray-500 shrink-0"></span>
                                                    <span className="text-gray-400 line-through truncate">
                                                        {task.title}
                                                    </span>
                                                </div>

                                                <span className="text-gray-400 font-bold whitespace-nowrap text-[11px] border border-gray-600/50 px-2 py-0.5 rounded uppercase tracking-wider">
                                                    Done
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {myTasks.length === 0 && (
                                <div className="py-10 text-center text-gray-500">
                                    Sana atanmış görev bulunmuyor.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showReviewsModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowReviewsModal(false);
                        }
                    }}
                >
                    <div className="relative bg-darkSurface border border-gray-600/40 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh]">
                        <div className="flex justify-between items-center mb-6 shrink-0 border-b border-gray-600/30 pb-4">
                            <h3 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-accentSoft"></span>
                                İncelemeler
                            </h3>

                            <button
                                onClick={() => setShowReviewsModal(false)}
                                className="text-gray-400 hover:text-accentSoft transition-colors text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="overflow-y-auto custom-scrollbar pr-3 space-y-4 flex-1">
                            {reviewsLoading ? (
                                <div className="py-10 text-center text-gray-500">
                                    İncelemeler yükleniyor...
                                </div>
                            ) : reviews.length === 0 ? (
                                <div className="py-10 text-center text-gray-500">
                                    Henüz yorum veya inceleme bulunmuyor.
                                </div>
                            ) : (
                                reviews.map(comment => (
                                    <div
                                        key={comment.id}
                                        className="bg-darkBase/60 p-5 rounded-xl border border-gray-600/30"
                                    >
                                        <div className="mb-3 border-b border-gray-600/30 pb-2">
                                            <span className="text-accentSoft text-[11px] font-extrabold tracking-widest uppercase">
                                                {comment.taskTitle}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-9 h-9 rounded-full bg-gray-500 flex items-center justify-center text-[13px] font-extrabold text-darkBase">
                                                {(comment.userFullName || 'U')
                                                    .split(' ')
                                                    .map(part => part[0])
                                                    .slice(0, 2)
                                                    .join('')
                                                    .toUpperCase()}
                                            </div>

                                            <div>
                                                <p className="font-semibold text-gray-200 text-sm leading-none">
                                                    {comment.userFullName || 'Kullanıcı'}
                                                </p>

                                                <p className="text-[11px] text-gray-500 mt-1">
                                                    Yorum
                                                </p>
                                            </div>

                                            <span className="text-[11px] text-gray-400 ml-auto border border-gray-600/50 px-2 py-0.5 rounded">
                                                {formatDate(comment.createdAt)}
                                            </span>
                                        </div>

                                        <p className="text-gray-300 text-[14px] leading-relaxed">
                                            {comment.content}
                                        </p>

                                        <div className="mt-4">
                                            <button
                                                onClick={() =>
                                                    openTask(
                                                        myTasks.find(
                                                            task =>
                                                                task.title === comment.taskTitle
                                                        ) || myTasks[0]
                                                    )
                                                }
                                                className="text-xs text-accentSoft hover:text-white font-bold underline transition-colors"
                                            >
                                                Görevi Aç
                                            </button>
                                        </div>
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