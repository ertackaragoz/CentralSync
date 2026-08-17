import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Projects from './Projects';
import Tasks from './Tasks';
import Users from './Users';
import TimeLogs from './TimeLogs';
import Layout from './Layout';

function App() {
    const isAuthenticated = !!localStorage.getItem('token');

    return (
        <Router>
            <Routes>
                <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={isAuthenticated ? <Layout><Dashboard /></Layout> : <Navigate to="/login" replace />} />
                <Route path="/users" element={isAuthenticated ? <Layout><Users /></Layout> : <Navigate to="/login" replace />} />
                <Route path="/projects" element={isAuthenticated ? <Layout><Projects /></Layout> : <Navigate to="/login" replace />} />
                <Route path="/tasks" element={isAuthenticated ? <Layout><Tasks /></Layout> : <Navigate to="/login" replace />} />
                <Route path="/time-logs" element={isAuthenticated ? <Layout><TimeLogs /></Layout> : <Navigate to="/login" replace />} />
                <Route path="*" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
