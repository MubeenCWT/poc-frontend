import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api.js';

export default function AdminOwners() {
  const [owners, setOwners] = useState([]);
  const [form, setForm] = useState({ full_name: '', phone: '', email: '' });
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('dar_admin_token');

  const fetchOwners = () => {
    if (!token) return;
    apiFetch('/api/owners/', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setOwners(Array.isArray(data) ? data : []))
      .catch(() => setMessage('Could not load owners.'));
  };

  useEffect(() => {
    fetchOwners();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await apiFetch('/api/owners/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ full_name: '', phone: '', email: '' });
        setMessage('Owner added. They can WhatsApp the bot from that number.');
        fetchOwners();
      } else {
        const err = await res.json();
        setMessage(err.detail || 'Could not create owner.');
      }
    } catch {
      setMessage('Could not create owner.');
    }
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', marginBottom: '8px' }}>Owners</h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px', maxWidth: '640px' }}>
        Register a property owner&apos;s WhatsApp number. Once assigned properties, they can message the bot for
        portfolio updates, guest release dates, date blocks, and taking units offline.
      </p>

      {message && (
        <p style={{ marginBottom: '16px', fontSize: '14px', color: '#2D3B4E' }}>{message}</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <h2 style={{ marginTop: 0, fontSize: '18px' }}>Add owner</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Full name *</label>
              <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>WhatsApp phone *</label>
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} placeholder="+9715XXXXXXXX" />
            </div>
            <div>
              <label style={labelStyle}>Email (optional)</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
            </div>
            <button type="submit" style={submitStyle}>Save owner</button>
          </div>
        </form>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <h2 style={{ marginTop: 0, fontSize: '18px' }}>Registered owners</h2>
          {owners.length === 0 ? (
            <p style={{ color: '#888', fontSize: '14px' }}>No owners yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {owners.map((o) => (
                <li key={o.id} style={{ padding: '12px 0', borderBottom: '1px solid #eee', fontSize: '14px' }}>
                  <strong>{o.full_name}</strong>
                  <div style={{ color: '#666' }}>{o.phone}</div>
                  {o.email && <div style={{ color: '#888', fontSize: '13px' }}>{o.email}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600,
};

const submitStyle = {
  background: '#0B1120', color: '#fff', padding: '10px', border: 'none', borderRadius: '4px',
  cursor: 'pointer', fontWeight: 600, marginTop: '8px',
};
