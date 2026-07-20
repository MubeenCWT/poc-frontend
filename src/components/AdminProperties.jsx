import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api.js';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80';

const emptyForm = {
  title: '', property_type: 'Apartment', emirate: 'Dubai', area: '',
  price_daily: '', price_monthly: '', price_yearly: '',
  bedrooms: '', bathrooms: '', max_guests: '', image_url: '',
};

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [owners, setOwners] = useState([]);
  const [assigning, setAssigning] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [deleting, setDeleting] = useState(null);
  const [restoring, setRestoring] = useState(null);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('dar_admin_token');

  const fetchProperties = () => {
    if (!token) return;
    apiFetch('/api/properties/?include_inactive=true', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (r.status === 401) {
          setMessage('Session expired — please log in again.');
          return [];
        }
        if (r.status === 404) {
          // Fallback for backends not yet redeployed with include_inactive support
          const legacy = await apiFetch('/api/properties/admin/all', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (legacy.ok) return legacy.json();
          const pub = await apiFetch('/api/properties/');
          return pub.ok ? pub.json() : [];
        }
        return r.json();
      })
      .then((data) => setProperties(Array.isArray(data) ? data : []))
      .catch(() => setMessage('Could not load properties.'));
  };

  useEffect(() => {
    fetchProperties();
    if (!token) return;
    apiFetch('/api/owners/', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setOwners(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    const imageUrl = formData.image_url.trim() || DEFAULT_IMAGE;
    const payload = {
      title: formData.title,
      property_type: formData.property_type,
      emirate: formData.emirate,
      area: formData.area,
      price_daily: formData.price_daily ? Number(formData.price_daily) : null,
      price_monthly: formData.price_monthly ? Number(formData.price_monthly) : null,
      price_yearly: formData.price_yearly ? Number(formData.price_yearly) : null,
      bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
      max_guests: formData.max_guests ? Number(formData.max_guests) : null,
      images: [imageUrl],
    };

    try {
      const res = await apiFetch('/api/properties/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowModal(false);
        setFormData(emptyForm);
        fetchProperties();
      } else {
        const error = await res.json();
        alert('Error: ' + JSON.stringify(error));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (propertyId, title) => {
    if (!token) return;
    if (!window.confirm(`Remove "${title}" from public listings?\n\nExisting bookings are kept.`)) return;

    setDeleting(propertyId);
    setMessage('');
    try {
      const res = await apiFetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage(`"${title}" removed from listings.`);
        fetchProperties();
      } else {
        const error = await res.json();
        setMessage('Delete failed: ' + (error.detail || JSON.stringify(error)));
      }
    } catch (err) {
      console.error(err);
      setMessage('Delete failed. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleRestore = async (propertyId, title) => {
    if (!token) return;
    setRestoring(propertyId);
    setMessage('');
    try {
      const res = await apiFetch(`/api/properties/${propertyId}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage(`"${title}" is live on the site again.`);
        fetchProperties();
      } else {
        const error = await res.json();
        setMessage('Restore failed: ' + (error.detail || JSON.stringify(error)));
      }
    } catch (err) {
      console.error(err);
      setMessage('Restore failed. Please try again.');
    } finally {
      setRestoring(null);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAssignOwner = async (propertyId, ownerId) => {
    if (!token) return;
    setAssigning(propertyId);
    try {
      const res = await apiFetch(`/api/owners/properties/${propertyId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ owner_id: ownerId || null }),
      });
      if (res.ok) {
        setMessage('Owner assignment updated.');
        fetchProperties();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px' }}>Properties</h1>
        <button 
          onClick={() => setShowModal(true)}
          style={{
            background: '#0B1120', color: '#F5EDE0', border: 'none', padding: '10px 16px',
            borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '14px'
          }}
        >
          + Add Property
        </button>
      </div>

      {message && (
        <p style={{ marginBottom: '16px', fontSize: '14px', color: '#2D3B4E' }}>{message}</p>
      )}
      
      <div className="table-scroll" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Title</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Type</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Area</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Daily AED</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Owner</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Status</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee', opacity: p.status === 'inactive' ? 0.65 : 1 }}>
                <td style={{ padding: '16px', fontSize: '14px', fontWeight: 500 }}>{p.title}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>{p.property_type}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>{p.area}, {p.emirate}</td>
                <td style={{ padding: '16px', fontSize: '14px' }}>{p.price_daily}</td>
                <td style={{ padding: '16px', fontSize: '13px' }}>
                  <select
                    value={p.owner_id || ''}
                    disabled={assigning === p.id}
                    onChange={(e) => handleAssignOwner(p.id, e.target.value)}
                    style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', maxWidth: '160px' }}
                  >
                    <option value="">— Admin —</option>
                    {owners.map((o) => (
                      <option key={o.id} value={o.id}>{o.full_name}</option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '16px', fontSize: '13px' }}>
                  <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                    background: p.status === 'active' ? '#e6f4ea' : '#fce8e6',
                    color: p.status === 'active' ? '#137333' : '#c5221f',
                  }}>
                    {p.status === 'active' ? 'Live' : 'Removed'}
                  </span>
                </td>
                <td style={{ padding: '16px', fontSize: '13px' }}>
                  {p.status === 'active' ? (
                    <button
                      type="button"
                      disabled={deleting === p.id}
                      onClick={() => handleDelete(p.id, p.title)}
                      style={deleteBtnStyle}
                    >
                      {deleting === p.id ? 'Removing…' : 'Delete'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={restoring === p.id}
                      onClick={() => handleRestore(p.id, p.title)}
                      style={restoreBtnStyle}
                    >
                      {restoring === p.id ? 'Restoring…' : 'Restore'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {properties.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#888' }}>No properties found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '8px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0, fontFamily: 'var(--font-display)' }}>Add New Property</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Title *</label>
                <input required name="title" value={formData.title} onChange={handleChange} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Type *</label>
                  <select required name="property_type" value={formData.property_type} onChange={handleChange} style={inputStyle}>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Studio">Studio</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Emirate *</label>
                  <select required name="emirate" value={formData.emirate} onChange={handleChange} style={inputStyle}>
                    <option value="Dubai">Dubai</option>
                    <option value="Abu Dhabi">Abu Dhabi</option>
                    <option value="Sharjah">Sharjah</option>
                    <option value="Ajman">Ajman</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Area</label>
                <input name="area" value={formData.area} onChange={handleChange} style={inputStyle} placeholder="e.g. Dubai Marina" />
              </div>
              <div>
                <label style={labelStyle}>Image URL</label>
                <input
                  name="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="https://… (leave blank for default photo)"
                />
                <p style={hintStyle}>Paste a direct link to a photo. If left empty, a default placeholder image is used.</p>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Bedrooms</label>
                  <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Bathrooms</label>
                  <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Max Guests</label>
                  <input type="number" name="max_guests" value={formData.max_guests} onChange={handleChange} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Daily Price (AED)</label>
                  <input type="number" name="price_daily" value={formData.price_daily} onChange={handleChange} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Monthly Price (AED)</label>
                  <input type="number" name="price_monthly" value={formData.price_monthly} onChange={handleChange} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Yearly Price (AED)</label>
                  <input type="number" name="price_yearly" value={formData.price_yearly} onChange={handleChange} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" style={{ flex: 1, background: '#0B1120', color: '#fff', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Save Property</button>
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

const labelStyle = {
  display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600
};

const hintStyle = {
  marginTop: '6px', fontSize: '12px', color: '#888', lineHeight: 1.4,
};

const deleteBtnStyle = {
  background: '#fff',
  color: '#c5221f',
  border: '1px solid #f5c6c6',
  borderRadius: '4px',
  padding: '6px 12px',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
};

const restoreBtnStyle = {
  background: '#fff',
  color: '#137333',
  border: '1px solid #ceead6',
  borderRadius: '4px',
  padding: '6px 12px',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
};
