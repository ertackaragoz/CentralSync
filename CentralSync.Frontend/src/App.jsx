import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Projects from './Projects';
// import Tasks from './Tasks';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/projects" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/projects" element={isAuthenticated ? <Projects /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;