import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GenerateQRCode from './components/GenerateQRCode';
import QRScanner from './components/QRScanner';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/qr" element={<GenerateQRCode studentId="student123" />} />
        <Route path="/scanner" element={<QRScanner />} />
      </Routes>
    </Router>
  );
};

export default App;
