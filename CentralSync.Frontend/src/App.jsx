import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Projects from './Projects';
import Tasks from './Tasks';
import Users from './Users';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/projects" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/users" element={<Users />} />
        <Route path="/projects" element={isAuthenticated ? <Projects /> : <Navigate to="/login" />} />
        <Route path="/tasks" element={isAuthenticated ? <Tasks /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;