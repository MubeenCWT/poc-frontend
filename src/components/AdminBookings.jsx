import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api.js';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('dar_admin_token');
    if (!token) return;

    apiFetch('/api/properties/').then(r => r.json()).then(props => {
      const pMap = {};
      props.forEach(p => pMap[p.id] = p.title);
      setProperties(pMap);
    });

    apiFetch('/api/bookings/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if(Array.isArray(data)) setBookings(data);
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', marginBottom: '24px' }}>Bookings</h1>
      
      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Property</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Guest</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Dates</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Type</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '16px', fontSize: '14px', fontWeight: 500 }}>{properties[b.property_id] || b.property_id}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>{b.guest_name}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>{b.start_date} - {b.end_date}</td>
                <td style={{ padding: '16px', fontSize: '14px' }}>{b.booking_type}</td>
                <td style={{ padding: '16px', fontSize: '14px' }}>
                  <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                    background: b.status === 'confirmed' ? '#e6f4ea' : '#fef7e0',
                    color: b.status === 'confirmed' ? '#137333' : '#b06000'
                  }}>
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#888' }}>No bookings found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
