import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Record from './pages/Record';
import Upload from './pages/Upload';
import RecordingsList from './pages/RecordingsList';
import RecordingDetail from './pages/RecordingDetail';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import SilenceDetection from './pages/SilenceDetection';
import Sidebar from './components/Sidebar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-slate-400">Chargement...</div>
      </div>
    );
  }

  return (
    <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="flex min-h-screen bg-slate-900">
                <Sidebar />
                <div className="flex-1">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/record" element={<Record />} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="/recordings" element={<RecordingsList />} />
                    <Route path="/recordings/:id" element={<RecordingDetail />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/silence-detection" element={<SilenceDetection />} />
                  </Routes>
                </div>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

