import React, { useState } from 'react';
import { authAPI } from '../services/api';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const data = await authAPI.login(credentials); // ✅ karena sekarang return langsung data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.employee));
    onLogin(data.employee);
  } catch (error) {
    alert('Login failed: ' + (error.response?.data?.error || error.message));
  }
};

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
      <h2>LeaveMaster - Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px' }}>
          Login
        </button>
      </form>
      <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5' }}>
        <strong>Test Accounts:</strong><br/>
        Manager: manager@company.com / password<br/>
        Employee: employee@company.com / password
      </div>
    </div>
  );
};

export default Login;