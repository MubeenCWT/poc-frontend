import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api.js';

export default function Dashboard() {
  const [stats, setStats] = useState({ props: 0, vends: 0, books: 0, maint: 0 });

  useEffect(() => {
    const token = localStorage.getItem('dar_admin_token');
    if (!token) return;

    const headers = { 'Authorization': `Bearer ${token}` };

    Promise.all([
      apiFetch('/api/properties/', { headers }).then(r => r.json()),
      apiFetch('/api/vendors/', { headers }).then(r => r.json()),
      apiFetch('/api/bookings/', { headers }).then(r => r.json()),
      apiFetch('/api/maintenance/', { headers }).then(r => r.json())
    ]).then(([props, vends, books, maint]) => {
      setStats({
        props: Array.isArray(props) ? props.length : 0,
        vends: Array.isArray(vends) ? vends.length : 0,
        books: Array.isArray(books) ? books.length : 0,
        maint: Array.isArray(maint) ? maint.length : 0
      });
    }).catch(console.error);
  }, []);

  const Card = ({ title, count }) => (
    <div style={{
      background: '#fff', padding: '24px', borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)'
    }}>
      <h3 style={{ fontSize: '14px', color: '#888', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
      <div style={{ fontSize: '36px', fontWeight: 700, fontFamily: 'var(--font-display)', color: '#0B1120' }}>{count}</div>
    </div>
  );

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', marginBottom: '24px' }}>Dashboard Overview</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        <Card title="Total Properties" count={stats.props} />
        <Card title="Total Bookings" count={stats.books} />
        <Card title="Maintenance Requests" count={stats.maint} />
        <Card title="Active Vendors" count={stats.vends} />
      </div>
    </div>
  );
}
