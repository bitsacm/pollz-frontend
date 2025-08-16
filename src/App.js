import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import SUElection from './pages/SUElection';
import HuelVoting from './pages/HuelVoting';
import DepartmentClubs from './pages/DepartmentClubs';
import Contributors from './pages/Contributors';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || "your-google-client-id"}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/elections" element={<SUElection />} />
              <Route path="/huels" element={<HuelVoting />} />
              <Route path="/departments" element={<DepartmentClubs />} />
              <Route path="/contributors" element={<Contributors />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
