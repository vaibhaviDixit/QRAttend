import React, { useState } from 'react';
import './LoginPage.css'; // Importing the CSS

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {

    const response = await fetch(`http://${window.location.hostname}:5000/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('teacherToken', data.token);
      window.location.href = '/qr'; // redirect after login
    } else {
      setError(data.message || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Teacher Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
