import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './index.css';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Projects from './Projects';
import Tasks from './Tasks';
import Users from './Users';
import TimeLogs from './TimeLogs';
import Layout from './Layout';

function RequireAuth({ children }) {
    const location = useLocation();
    const isAuthenticated = !!localStorage.getItem('token');

    if (!isAuthenticated) {
        return <Navigate to='/login' replace state={{ from: location.pathname }} />;
    }

    return children;
}

function RequireGuest({ children }) {
    const isAuthenticated = !!localStorage.getItem('token');

    if (isAuthenticated) {
        return <Navigate to='/dashboard' replace />;
    }

    return children;
}

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                <Route
                    path="/login"
                    element={
                        <RequireGuest>
                            <Login />
                        </RequireGuest>
                    }
                />

                <Route
                    path="/register"
                    element={
                        <RequireGuest>
                            <Register />
                        </RequireGuest>
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <RequireAuth>
                            <Layout>
                                <Dashboard />
                            </Layout>
                        </RequireAuth>
                    }
                />

                <Route
                    path="/users"
                    element={
                        <RequireAuth>
                            <Layout>
                                <Users />
                            </Layout>
                        </RequireAuth>
                    }
                />

                <Route
                    path="/projects"
                    element={
                        <RequireAuth>
                            <Layout>
                                <Projects />
                            </Layout>
                        </RequireAuth>
                    }
                />

                <Route
                    path="/tasks"
                    element={
                        <RequireAuth>
                            <Layout>
                                <Tasks />
                            </Layout>
                        </RequireAuth>
                    }
                />

                <Route
                    path="/time-logs"
                    element={
                        <RequireAuth>
                            <Layout>
                                <TimeLogs />
                            </Layout>
                        </RequireAuth>
                    }
                />

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}
