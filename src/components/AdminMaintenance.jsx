import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api.js';

export default function AdminMaintenance() {
  const [requests, setRequests] = useState([]);
  const [properties, setProperties] = useState({});
  const [vendorList, setVendorList] = useState([]);
  const [vendorMap, setVendorMap] = useState({});
  const [picked, setPicked] = useState({});
  const [acting, setActing] = useState(null);

  const token = localStorage.getItem('dar_admin_token');

  const loadRequests = () => {
    apiFetch('/api/maintenance/', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRequests(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (!token) return;

    apiFetch('/api/properties/').then((r) => r.json()).then((props) => {
      const pMap = {};
      props.forEach((p) => { pMap[p.id] = p.title; });
      setProperties(pMap);
    });

    apiFetch('/api/vendors/', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((vends) => {
        if (!Array.isArray(vends)) return;
        setVendorList(vends);
        const vMap = {};
        vends.forEach((v) => { vMap[v.id] = v.name; });
        setVendorMap(vMap);
      });

    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const candidatesFor = (req) =>
    vendorList.filter((v) => v.service_type === req.issue_type && v.is_active);

  const assignVendor = async (requestId) => {
    const vendorId = picked[requestId];
    if (!vendorId) return;
    setActing(requestId);
    try {
      await apiFetch(`/api/maintenance/${requestId}/assign`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_id: vendorId }),
      });
      loadRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setActing(null);
    }
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', marginBottom: '24px' }}>Maintenance Requests</h1>

      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
              <th style={th}>Property</th>
              <th style={th}>Requested By</th>
              <th style={th}>Issue</th>
              <th style={th}>Vendor</th>
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => {
              const cands = candidatesFor(r);
              return (
                <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ ...td, fontWeight: 500 }}>{properties[r.property_id] || r.property_id}</td>
                  <td style={{ ...td, color: '#666' }}>{r.requested_by}</td>
                  <td style={{ ...td, color: '#666' }}>{r.issue_type}</td>
                  <td style={{ ...td, color: '#666' }}>
                    {r.vendor_id ? (
                      vendorMap[r.vendor_id] || r.vendor_id
                    ) : cands.length > 0 ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select
                          value={picked[r.id] || ''}
                          onChange={(e) => setPicked({ ...picked, [r.id]: e.target.value })}
                          style={selectStyle}
                        >
                          <option value="">Select vendor…</option>
                          {cands.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name} ({v.phone})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={acting === r.id || !picked[r.id]}
                          onClick={() => assignVendor(r.id)}
                          style={btnStyle('#0B1120')}
                        >
                          Assign
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#c5221f' }}>No vendor available</span>
                    )}
                  </td>
                  <td style={td}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                      background: r.status === 'open' ? '#fef7e0' : '#e6f4ea',
                      color: r.status === 'open' ? '#b06000' : '#137333',
                    }}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {requests.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#888' }}>No requests found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = { padding: '16px', fontSize: '13px', color: '#555' };
const td = { padding: '16px', fontSize: '14px' };

const selectStyle = {
  padding: '6px 8px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  fontSize: '13px',
  maxWidth: '200px',
};

function btnStyle(bg) {
  return {
    background: bg,
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  };
}
