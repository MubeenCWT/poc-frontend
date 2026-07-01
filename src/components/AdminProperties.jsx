import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api.js';

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', property_type: 'Apartment', emirate: 'Dubai', area: '',
    price_daily: '', price_monthly: '', price_yearly: '',
    bedrooms: '', bathrooms: '', max_guests: '', images: []
  });

  const fetchProperties = () => {
    apiFetch('/api/properties/')
      .then(r => r.json())
      .then(data => setProperties(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('dar_admin_token');
    
    // Parse numeric fields properly
    const payload = {
      ...formData,
      price_daily: formData.price_daily ? Number(formData.price_daily) : null,
      price_monthly: formData.price_monthly ? Number(formData.price_monthly) : null,
      price_yearly: formData.price_yearly ? Number(formData.price_yearly) : null,
      bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
      max_guests: formData.max_guests ? Number(formData.max_guests) : null,
      images: ['https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80'] // Default image for newly created ones
    };

    try {
      const res = await apiFetch('/api/properties/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({
          title: '', property_type: 'Apartment', emirate: 'Dubai', area: '',
          price_daily: '', price_monthly: '', price_yearly: '',
          bedrooms: '', bathrooms: '', max_guests: '', images: []
        });
        fetchProperties();
      } else {
        const error = await res.json();
        alert('Error: ' + JSON.stringify(error));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

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
      
      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Title</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Type</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Area</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Daily AED</th>
            </tr>
          </thead>
          <tbody>
            {properties.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '16px', fontSize: '14px', fontWeight: 500 }}>{p.title}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>{p.property_type}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>{p.area}, {p.emirate}</td>
                <td style={{ padding: '16px', fontSize: '14px' }}>{p.price_daily}</td>
              </tr>
            ))}
            {properties.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#888' }}>No properties found.</td></tr>
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
