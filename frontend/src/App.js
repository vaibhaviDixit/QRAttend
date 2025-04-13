import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GenerateQRCode from './components/GenerateQRCode';
import QRScanner from './components/QRScanner';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/scanner" element={<QRScanner />} />
        
        <Route
          path="/qr"
          element={
            <ProtectedRoute>
              <GenerateQRCode studentId="student123" />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
