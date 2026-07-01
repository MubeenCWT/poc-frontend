import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api.js';

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', service_type: '', phone: '', email: ''
  });

  const fetchVendors = () => {
    const token = localStorage.getItem('dar_admin_token');
    if (!token) return;

    apiFetch('/api/vendors/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setVendors(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('dar_admin_token');
    try {
      const res = await apiFetch('/api/vendors/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', service_type: '', phone: '', email: '' });
        fetchVendors();
      } else {
        const error = await res.json();
        alert('Error: ' + JSON.stringify(error));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px' }}>Vendors</h1>
        <button 
          onClick={() => setShowModal(true)}
          style={{
            background: '#0B1120', color: '#F5EDE0', border: 'none', padding: '10px 16px',
            borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '14px'
          }}
        >
          + Add Vendor
        </button>
      </div>
      
      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Name</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Service Type</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Phone</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(v => (
              <tr key={v.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '16px', fontSize: '14px', fontWeight: 500 }}>{v.name}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>{v.service_type}</td>
                <td style={{ padding: '16px', fontSize: '14px' }}>{v.phone}</td>
              </tr>
            ))}
            {vendors.length === 0 && (
              <tr><td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: '#888' }}>No vendors found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <h2 style={{ marginTop: 0, fontFamily: 'var(--font-display)' }}>Add New Vendor</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Name *</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Service Type *</label>
                <select required value={formData.service_type} onChange={e => setFormData({...formData, service_type: e.target.value})} style={inputStyle}>
                  <option value="">Select a service</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="AC Maintenance">AC Maintenance</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Phone *</label>
                <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" style={{ flex: 1, background: '#0B1120', color: '#fff', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Save Vendor</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: '#eee', color: '#333', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontFamily: 'var(--font-body)'
};
