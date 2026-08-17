import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Projects from './Projects';
import Tasks from './Tasks';
import Users from './Users';
import TimeLogs from './TimeLogs';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={
            isAuthenticated
              ? <Dashboard />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/users"
          element={
            isAuthenticated
              ? <Users />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/projects"
          element={
            isAuthenticated
              ? <Projects />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/tasks"
          element={
            isAuthenticated
              ? <Tasks />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/time-logs"
          element={
            isAuthenticated
              ? <TimeLogs />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="*"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;