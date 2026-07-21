import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api.js';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80';

const emptyForm = {
  title: '', property_type: 'Apartment', emirate: 'Dubai', area: '',
  description: '', address: '', amenities: '',
  price_daily: '', price_monthly: '', price_yearly: '',
  bedrooms: '', bathrooms: '', max_guests: '', image_url: '',
};

function propertyToForm(property) {
  return {
    title: property.title || '',
    property_type: property.property_type || 'Apartment',
    emirate: property.emirate || 'Dubai',
    area: property.area || '',
    description: property.description || '',
    address: property.address || '',
    amenities: Array.isArray(property.amenities) ? property.amenities.join(', ') : '',
    price_daily: property.price_daily ?? '',
    price_monthly: property.price_monthly ?? '',
    price_yearly: property.price_yearly ?? '',
    bedrooms: property.bedrooms ?? '',
    bathrooms: property.bathrooms ?? '',
    max_guests: property.max_guests ?? '',
    image_url: property.images?.[0] || '',
  }
}

function formToPayload(formData) {
  const imageUrl = formData.image_url.trim() || DEFAULT_IMAGE
  return {
    title: formData.title.trim(),
    description: formData.description.trim() || null,
    property_type: formData.property_type,
    emirate: formData.emirate,
    area: formData.area.trim() || null,
    address: formData.address.trim() || null,
    price_daily: formData.price_daily !== '' ? Number(formData.price_daily) : null,
    price_monthly: formData.price_monthly !== '' ? Number(formData.price_monthly) : null,
    price_yearly: formData.price_yearly !== '' ? Number(formData.price_yearly) : null,
    bedrooms: formData.bedrooms !== '' ? Number(formData.bedrooms) : null,
    bathrooms: formData.bathrooms !== '' ? Number(formData.bathrooms) : null,
    max_guests: formData.max_guests !== '' ? Number(formData.max_guests) : null,
    amenities: formData.amenities
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    images: [imageUrl],
  }
}

function fmtDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch {
    return iso
  }
}

function statusBadge(p) {
  if (p.status === 'inactive') {
    return { label: 'Removed', bg: '#fce8e6', color: '#c5221f' }
  }
  if (p.listing_label === 'blocked' || p.block_active) {
    return { label: 'Blocked', bg: '#fce8e6', color: '#c5221f' }
  }
  if (p.listing_label === 'blocked_soon') {
    return { label: 'Blocked soon', bg: '#fef7e0', color: '#b06000' }
  }
  return { label: 'Live', bg: '#e6f4ea', color: '#137333' }
}

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [blockForm, setBlockForm] = useState({ start_date: '', end_date: '' });
  const [managing, setManaging] = useState(false);
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
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    const payload = formToPayload(formData);

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

  const openDetails = (property) => {
    setSelectedProperty(property);
    setEditForm(propertyToForm(property));
    setBlockForm({ start_date: '', end_date: '' });
    setEditing(false);
  };

  const closeDetails = () => {
    if (saving) return;
    setSelectedProperty(null);
    setEditing(false);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!token || !selectedProperty) return;

    setSaving(true);
    setMessage('');
    try {
      const res = await apiFetch(`/api/properties/${selectedProperty.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formToPayload(editForm)),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedProperty(updated);
        setEditForm(propertyToForm(updated));
        setEditing(false);
        setMessage(`"${updated.title}" updated successfully.`);
        fetchProperties();
      } else {
        const error = await res.json();
        setMessage('Update failed: ' + (error.detail || JSON.stringify(error)));
      }
    } catch (err) {
      console.error(err);
      setMessage('Update failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const applyPropertyResponse = async (res, successMessage) => {
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || JSON.stringify(error));
    }
    const updated = await res.json();
    setSelectedProperty(updated);
    setEditForm(propertyToForm(updated));
    setMessage(successMessage);
    fetchProperties();
    return updated;
  };

  const handleBlock = async (e) => {
    e.preventDefault();
    if (!selectedProperty || !blockForm.start_date || !blockForm.end_date) return;
    setManaging(true);
    setMessage('');
    try {
      const res = await apiFetch(`/api/properties/${selectedProperty.id}/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(blockForm),
      });
      await applyPropertyResponse(res, `"${selectedProperty.title}" blocked for the selected dates.`);
      setBlockForm({ start_date: '', end_date: '' });
    } catch (err) {
      setMessage(`Block failed: ${err.message}`);
    } finally {
      setManaging(false);
    }
  };

  const handleClearBlock = async () => {
    if (!selectedProperty || !window.confirm(`Clear all date blocks for "${selectedProperty.title}"?`)) return;
    setManaging(true);
    try {
      const res = await apiFetch(`/api/properties/${selectedProperty.id}/block`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await applyPropertyResponse(res, `"${selectedProperty.title}" date blocks cleared.`);
    } catch (err) {
      setMessage(`Could not clear block: ${err.message}`);
    } finally {
      setManaging(false);
    }
  };

  const handleListingStatus = async (action) => {
    if (!selectedProperty) return;
    const goingOffline = action === 'offline';
    if (goingOffline && !window.confirm(`Take "${selectedProperty.title}" offline and hide it from the website?`)) return;
    setManaging(true);
    try {
      const endpoint = goingOffline
        ? `/api/properties/${selectedProperty.id}/offline`
        : `/api/properties/${selectedProperty.id}/restore`;
      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      await applyPropertyResponse(
        res,
        goingOffline
          ? `"${selectedProperty.title}" is offline.`
          : `"${selectedProperty.title}" is live again.`,
      );
    } catch (err) {
      setMessage(`Status update failed: ${err.message}`);
    } finally {
      setManaging(false);
    }
  };

  const handleRemoveFromDetails = async () => {
    if (!selectedProperty) return;
    if (!window.confirm(`Remove "${selectedProperty.title}" from the website?\n\nExisting bookings are kept.`)) return;
    setManaging(true);
    try {
      const res = await apiFetch(`/api/properties/${selectedProperty.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Remove failed');
      }
      setMessage(`"${selectedProperty.title}" removed from listings.`);
      setSelectedProperty(null);
      fetchProperties();
    } catch (err) {
      setMessage(`Remove failed: ${err.message}`);
    } finally {
      setManaging(false);
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
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Status</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map(p => {
              const badge = statusBadge(p)
              return (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee', opacity: p.status === 'inactive' ? 0.65 : 1 }}>
                <td style={{ padding: '16px', fontSize: '14px', fontWeight: 500 }}>{p.title}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>{p.property_type}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>{p.area}, {p.emirate}</td>
                <td style={{ padding: '16px', fontSize: '14px' }}>{p.price_daily}</td>
                <td style={{ padding: '16px', fontSize: '13px' }}>
                  <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                    background: badge.bg,
                    color: badge.color,
                  }}>
                    {badge.label}
                  </span>
                  {(p.block_start && p.block_end) && (
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '6px' }}>
                      {fmtDate(p.block_start)} – {fmtDate(p.block_end)}
                    </div>
                  )}
                </td>
                <td style={{ padding: '16px', fontSize: '13px' }}>
                  <button
                    type="button"
                    onClick={() => openDetails(p)}
                    style={detailsBtnStyle}
                  >
                    View details
                  </button>
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
            )})}
            {properties.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#888' }}>No properties found.</td></tr>
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
                <label style={labelStyle}>Address</label>
                <input name="address" value={formData.address} onChange={handleChange} style={inputStyle} placeholder="Building, street, area" />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} />
              </div>
              <div>
                <label style={labelStyle}>Amenities</label>
                <input name="amenities" value={formData.amenities} onChange={handleChange} style={inputStyle} placeholder="Pool, Gym, Balcony" />
                <p style={hintStyle}>Separate multiple amenities with commas.</p>
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

      {selectedProperty && (
        <div
          style={modalOverlayStyle}
          onMouseDown={(e) => e.target === e.currentTarget && closeDetails()}
        >
          <div style={detailsModalStyle}>
            <div style={modalHeaderStyle}>
              <div>
                <p style={{ ...hintStyle, margin: '0 0 4px' }}>PROPERTY DETAILS</p>
                <h2 style={{ margin: 0, fontFamily: 'var(--font-display)' }}>
                  {editing ? 'Edit Property' : selectedProperty.title}
                </h2>
              </div>
              <button type="button" onClick={closeDetails} style={closeBtnStyle}>×</button>
            </div>

            {editing ? (
              <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <EditField label="Title *" name="title" required value={editForm.title} onChange={handleEditChange} />
                <div style={formGridStyle}>
                  <EditSelect label="Type" name="property_type" value={editForm.property_type} onChange={handleEditChange}
                    options={['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Studio']} />
                  <EditSelect label="Emirate *" name="emirate" required value={editForm.emirate} onChange={handleEditChange}
                    options={['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman']} />
                </div>
                <div style={formGridStyle}>
                  <EditField label="Area" name="area" value={editForm.area} onChange={handleEditChange} />
                  <EditField label="Address" name="address" value={editForm.address} onChange={handleEditChange} />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea name="description" value={editForm.description} onChange={handleEditChange}
                    style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} />
                </div>
                <EditField label="Amenities" name="amenities" value={editForm.amenities}
                  onChange={handleEditChange} hint="Separate amenities with commas." />
                <div style={threeColumnGridStyle}>
                  <EditField label="Bedrooms" name="bedrooms" type="number" min="0" value={editForm.bedrooms} onChange={handleEditChange} />
                  <EditField label="Bathrooms" name="bathrooms" type="number" min="0" value={editForm.bathrooms} onChange={handleEditChange} />
                  <EditField label="Max guests" name="max_guests" type="number" min="1" value={editForm.max_guests} onChange={handleEditChange} />
                </div>
                <div style={threeColumnGridStyle}>
                  <EditField label="Daily AED" name="price_daily" type="number" min="0" value={editForm.price_daily} onChange={handleEditChange} />
                  <EditField label="Monthly AED" name="price_monthly" type="number" min="0" value={editForm.price_monthly} onChange={handleEditChange} />
                  <EditField label="Yearly AED" name="price_yearly" type="number" min="0" value={editForm.price_yearly} onChange={handleEditChange} />
                </div>
                <EditField label="Image URL" name="image_url" type="url" value={editForm.image_url} onChange={handleEditChange} />
                {editForm.image_url && <img src={editForm.image_url} alt="Preview" style={previewImageStyle} />}

                <div style={modalActionsStyle}>
                  <button type="button" style={secondaryBtnStyle} onClick={() => {
                    setEditForm(propertyToForm(selectedProperty))
                    setEditing(false)
                  }}>Cancel</button>
                  <button type="submit" disabled={saving} style={primaryBtnStyle}>
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                {selectedProperty.images?.[0] && (
                  <img src={selectedProperty.images[0]} alt={selectedProperty.title} style={heroImageStyle} />
                )}
                <div style={statusRowStyle}>
                  {(() => {
                    const badge = statusBadge(selectedProperty)
                    return <span style={{ ...statusPillStyle, background: badge.bg, color: badge.color }}>{badge.label}</span>
                  })()}
                  {selectedProperty.block_start && selectedProperty.block_end && (
                    <span style={{ fontSize: 13, color: '#666' }}>
                      {fmtDate(selectedProperty.block_start)} – {fmtDate(selectedProperty.block_end)}
                    </span>
                  )}
                </div>
                <div style={detailsGridStyle}>
                  <Detail label="Property type" value={selectedProperty.property_type} />
                  <Detail label="Location" value={[selectedProperty.area, selectedProperty.emirate].filter(Boolean).join(', ')} />
                  <Detail label="Address" value={selectedProperty.address} wide />
                  <Detail label="Bedrooms" value={selectedProperty.bedrooms} />
                  <Detail label="Bathrooms" value={selectedProperty.bathrooms} />
                  <Detail label="Maximum guests" value={selectedProperty.max_guests} />
                  <Detail label="Daily price" value={money(selectedProperty.price_daily)} />
                  <Detail label="Monthly price" value={money(selectedProperty.price_monthly)} />
                  <Detail label="Yearly price" value={money(selectedProperty.price_yearly)} />
                  <Detail label="Description" value={selectedProperty.description} wide />
                  <Detail label="Amenities" value={selectedProperty.amenities?.join(', ')} wide />
                  <Detail
                    label="Availability"
                    value={
                      selectedProperty.availability_status === 'available'
                        ? 'Available now'
                        : selectedProperty.availability_status === 'booked'
                          ? 'Currently booked'
                          : selectedProperty.availability_status === 'blocked'
                            ? 'Temporarily blocked'
                            : 'Offline'
                    }
                  />
                  <Detail
                    label="Next available"
                    value={selectedProperty.next_available_date ? fmtDate(selectedProperty.next_available_date) : 'Not listed'}
                  />
                  <Detail label="Property ID" value={selectedProperty.id} wide />
                  <Detail label="Created" value={selectedProperty.created_at ? new Date(selectedProperty.created_at).toLocaleString() : null} wide />
                </div>

                <section style={managementPanelStyle}>
                  <div>
                    <h3 style={{ margin: '0 0 5px', fontSize: 17 }}>Manage availability</h3>
                    <p style={{ ...hintStyle, marginTop: 0 }}>
                      These are the same property actions available through admin WhatsApp.
                    </p>
                  </div>

                  <form onSubmit={handleBlock} style={blockFormStyle}>
                    <div>
                      <label style={labelStyle}>Block from</label>
                      <input
                        required
                        type="date"
                        value={blockForm.start_date}
                        onChange={(e) => setBlockForm({ ...blockForm, start_date: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Block until</label>
                      <input
                        required
                        type="date"
                        min={blockForm.start_date || undefined}
                        value={blockForm.end_date}
                        onChange={(e) => setBlockForm({ ...blockForm, end_date: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                    <button type="submit" disabled={managing} style={blockBtnStyle}>
                      Block dates
                    </button>
                  </form>

                  <div style={managementActionsStyle}>
                    {(selectedProperty.block_start || selectedProperty.block_active) && (
                      <button type="button" disabled={managing} onClick={handleClearBlock} style={clearBlockBtnStyle}>
                        Clear block
                      </button>
                    )}
                    {selectedProperty.status === 'active' ? (
                      <button type="button" disabled={managing} onClick={() => handleListingStatus('offline')} style={offlineBtnStyle}>
                        Take offline
                      </button>
                    ) : (
                      <button type="button" disabled={managing} onClick={() => handleListingStatus('online')} style={onlineBtnStyle}>
                        Bring online
                      </button>
                    )}
                    <button type="button" disabled={managing} onClick={handleRemoveFromDetails} style={removeBtnStyle}>
                      Remove listing
                    </button>
                  </div>
                </section>

                <div style={modalActionsStyle}>
                  <button type="button" onClick={closeDetails} style={secondaryBtnStyle}>Close</button>
                  <button type="button" onClick={() => setEditing(true)} style={primaryBtnStyle}>Edit property</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function money(value) {
  return value === null || value === undefined ? null : `AED ${Number(value).toLocaleString()}`
}

function Detail({ label, value, wide = false }) {
  return (
    <div style={{ ...detailItemStyle, ...(wide ? { gridColumn: '1 / -1' } : {}) }}>
      <div style={detailLabelStyle}>{label}</div>
      <div style={detailValueStyle}>{value === null || value === undefined || value === '' ? '—' : value}</div>
    </div>
  )
}

function EditField({ label, hint, ...props }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input {...props} style={inputStyle} />
      {hint && <p style={hintStyle}>{hint}</p>}
    </div>
  )
}

function EditSelect({ label, options, ...props }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <select {...props} style={inputStyle}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  )
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

const detailsBtnStyle = {
  background: '#fff',
  color: '#0B1120',
  border: '1px solid #ccd2da',
  borderRadius: '4px',
  padding: '6px 12px',
  marginRight: '8px',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
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

const modalOverlayStyle = {
  position: 'fixed', inset: 0, zIndex: 1100,
  background: 'rgba(0,0,0,0.55)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 16,
};

const detailsModalStyle = {
  background: '#fff',
  width: 760,
  maxWidth: '100%',
  maxHeight: '92vh',
  overflowY: 'auto',
  borderRadius: 10,
  padding: 28,
  boxSizing: 'border-box',
  boxShadow: '0 24px 70px rgba(0,0,0,0.24)',
};

const modalHeaderStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
  gap: 20, marginBottom: 22,
};

const closeBtnStyle = {
  background: 'transparent', border: 0, fontSize: 28, lineHeight: 1,
  color: '#666', cursor: 'pointer', padding: 0,
};

const heroImageStyle = {
  width: '100%', height: 280, objectFit: 'cover',
  borderRadius: 8, marginBottom: 18, background: '#eee',
};

const previewImageStyle = {
  width: '100%', height: 180, objectFit: 'cover',
  borderRadius: 6, marginTop: 10, background: '#eee',
};

const statusRowStyle = {
  display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
  marginBottom: 20,
};

const statusPillStyle = {
  padding: '5px 10px', borderRadius: 4, fontSize: 12, fontWeight: 700,
};

const detailsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
  gap: 12,
};

const detailItemStyle = {
  background: '#f8f9fa', padding: 14, borderRadius: 6,
  minWidth: 0,
};

const detailLabelStyle = {
  fontSize: 11, color: '#777', textTransform: 'uppercase',
  letterSpacing: '0.05em', marginBottom: 5, fontWeight: 700,
};

const detailValueStyle = {
  fontSize: 14, color: '#1d2633', lineHeight: 1.5, overflowWrap: 'anywhere',
};

const formGridStyle = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16,
};

const threeColumnGridStyle = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16,
};

const modalActionsStyle = {
  display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24,
};

const primaryBtnStyle = {
  background: '#0B1120', color: '#fff', border: 0, borderRadius: 4,
  padding: '10px 16px', fontWeight: 600, cursor: 'pointer',
};

const secondaryBtnStyle = {
  background: '#eee', color: '#333', border: 0, borderRadius: 4,
  padding: '10px 16px', fontWeight: 600, cursor: 'pointer',
};

const managementPanelStyle = {
  marginTop: 22,
  padding: 18,
  border: '1px solid #e2e5e9',
  borderRadius: 8,
  background: '#fbfcfd',
};

const blockFormStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: 12,
  alignItems: 'end',
  marginTop: 16,
};

const managementActionsStyle = {
  display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14,
};

const managementBtnBase = {
  borderRadius: 4, padding: '9px 13px', fontSize: 12,
  fontWeight: 700, cursor: 'pointer',
};

const blockBtnStyle = {
  ...managementBtnBase,
  background: '#b06000', color: '#fff', border: '1px solid #b06000',
  minHeight: 39,
};

const clearBlockBtnStyle = {
  ...managementBtnBase,
  background: '#fff', color: '#b06000', border: '1px solid #e6b566',
};

const offlineBtnStyle = {
  ...managementBtnBase,
  background: '#fff', color: '#555', border: '1px solid #bbb',
};

const onlineBtnStyle = {
  ...managementBtnBase,
  background: '#e6f4ea', color: '#137333', border: '1px solid #b7dfc1',
};

const removeBtnStyle = {
  ...managementBtnBase,
  background: '#fff', color: '#c5221f', border: '1px solid #f0b7b5',
};
