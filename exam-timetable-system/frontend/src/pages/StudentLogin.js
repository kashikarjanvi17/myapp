import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { studentLogin } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function StudentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await studentLogin(email, password);
      login(data.token, data.user);
      navigate('/student/timetable');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <div className="auth-page">
      <h1>Student Login</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="alert alert-error">{error}</div>}
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aditi.2a@example.com" />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </label>
        <button type="submit" className="btn btn-primary">Log In</button>
      </form>
      <p className="hint">
        Test credentials: <code>aditi.2a@example.com</code> / <code>Password123</code> (2nd Year - A)
      </p>
      <p><Link to="/admin/login">Admin login instead →</Link></p>
    </div>
  );
}
