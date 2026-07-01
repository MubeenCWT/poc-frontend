import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api.js';

export default function AdminMaintenance() {
  const [requests, setRequests] = useState([]);
  const [properties, setProperties] = useState({});
  const [vendors, setVendors] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('dar_admin_token');
    if (!token) return;

    apiFetch('/api/properties/').then(r => r.json()).then(props => {
      const pMap = {};
      props.forEach(p => pMap[p.id] = p.title);
      setProperties(pMap);
    });

    apiFetch('/api/vendors/', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(vends => {
        const vMap = {};
        vends.forEach(v => vMap[v.id] = v.name);
        setVendors(vMap);
      });

    apiFetch('/api/maintenance/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if(Array.isArray(data)) setRequests(data);
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', marginBottom: '24px' }}>Maintenance Requests</h1>
      
      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Property</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Requested By</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Issue</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Assigned Vendor</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '16px', fontSize: '14px', fontWeight: 500 }}>{properties[r.property_id] || r.property_id}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>{r.requested_by}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>{r.issue_type}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>{r.vendor_id ? vendors[r.vendor_id] || r.vendor_id : 'Unassigned'}</td>
                <td style={{ padding: '16px', fontSize: '14px' }}>
                  <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                    background: r.status === 'open' ? '#fce8e6' : '#e6f4ea',
                    color: r.status === 'open' ? '#c5221f' : '#137333'
                  }}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#888' }}>No requests found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
