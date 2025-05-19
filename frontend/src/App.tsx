import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { getApiUrl } from './utils/urlUtils';

export const ApiUrlContext = React.createContext<string>(getApiUrl());

const CatchAllRoute = () => {
  const location = useLocation();
  const { showNotification } = useNotification();

  React.useEffect(() => {
    showNotification(`Page "${location.pathname}" not found. Redirecting to home.`, 'error');
  }, [location.pathname, showNotification]);

  return <Navigate to="/" replace />;
};

function App() {
  return (
    <NotificationProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-b from-primary-darkest to-primary-dark">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="*" element={<CatchAllRoute />} />
          </Routes>
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;
