import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api.js';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('dar_admin_token', data.access_token);
        navigate('/admin');
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F5EDE0'
    }}>
      <form onSubmit={handleLogin} style={{
        background: '#fff', padding: '40px', borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px'
      }}>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '24px', textAlign: 'center' }}>Admin Login</h2>
        
        {error && <div style={{ color: '#E8622C', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Email</label>
          <input 
            type="email" required
            value={email} onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc',
              fontFamily: 'var(--font-body)', fontSize: '14px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Password</label>
          <input 
            type="password" required
            value={password} onChange={e => setPassword(e.target.value)}
            style={{
              width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc',
              fontFamily: 'var(--font-body)', fontSize: '14px'
            }}
          />
        </div>
        
        <button type="submit" style={{
          width: '100%', padding: '14px', background: '#0B1120', color: '#F5EDE0',
          border: 'none', borderRadius: '4px', fontWeight: 600, fontSize: '15px', cursor: 'pointer'
        }}>
          Sign In
        </button>
      </form>
    </div>
  );
}
