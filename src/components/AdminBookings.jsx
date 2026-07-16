import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api.js';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState({});
  const [acting, setActing] = useState(null);
  const [counterFor, setCounterFor] = useState(null);
  const [counterAmount, setCounterAmount] = useState('');

  const token = localStorage.getItem('dar_admin_token');

  const loadBookings = () => {
    if (!token) return;
    apiFetch('/api/bookings/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBookings(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (!token) return;

    apiFetch('/api/properties/')
      .then((r) => r.json())
      .then((props) => {
        const pMap = {};
        props.forEach((p) => { pMap[p.id] = p.title; });
        setProperties(pMap);
      });

    loadBookings();
  }, [token]);

  const decideDiscount = async (bookingId, approve, counter = null) => {
    setActing(bookingId);
    try {
      const body = counter != null
        ? { approve: false, counter_amount: Number(counter) }
        : { approve };
      await apiFetch(`/api/bookings/${bookingId}/discount-decision`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      setCounterFor(null);
      setCounterAmount('');
      loadBookings();
    } catch (err) {
      console.error(err);
    } finally {
      setActing(null);
    }
  };

  const submitCounter = (bookingId) => {
    const amount = Number(counterAmount);
    if (!amount || amount <= 0) {
      alert('Enter a valid discount amount in AED');
      return;
    }
    decideDiscount(bookingId, false, amount);
  };

  const confirmBooking = async (bookingId) => {
    setActing(bookingId);
    try {
      await apiFetch(`/api/bookings/${bookingId}/confirm`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      loadBookings();
    } catch (err) {
      console.error(err);
    } finally {
      setActing(null);
    }
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', marginBottom: '24px' }}>Bookings</h1>

      <div className="table-scroll" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Property</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Guest</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Dates</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Price</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Status</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#555' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '16px', fontSize: '14px', fontWeight: 500 }}>{properties[b.property_id] || b.property_id}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>{b.guest_name}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>{b.start_date} - {b.end_date}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>
                  AED {b.final_price ?? b.base_price}
                  {b.discount_requested && (
                    <span style={{ display: 'block', fontSize: '12px', color: '#b06000' }}>
                      Discount: {b.discount_status} (-{b.discount_amount})
                    </span>
                  )}
                </td>
                <td style={{ padding: '16px', fontSize: '14px' }}>
                  <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                    background: b.status === 'confirmed' ? '#e6f4ea' : b.status === 'cancelled' ? '#fce8e6' : '#fef7e0',
                    color: b.status === 'confirmed' ? '#137333' : b.status === 'cancelled' ? '#c5221f' : '#b06000',
                  }}>
                    {b.status}
                  </span>
                </td>
                <td style={{ padding: '16px', fontSize: '13px' }}>
                  {b.discount_status === 'pending' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          disabled={acting === b.id}
                          onClick={() => decideDiscount(b.id, true)}
                          style={btnStyle('#137333')}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={acting === b.id}
                          onClick={() => setCounterFor(counterFor === b.id ? null : b.id)}
                          style={btnStyle('#b06000')}
                        >
                          Counter
                        </button>
                        <button
                          type="button"
                          disabled={acting === b.id}
                          onClick={() => decideDiscount(b.id, false)}
                          style={btnStyle('#c5221f')}
                        >
                          Reject
                        </button>
                      </div>
                      {counterFor === b.id && (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            placeholder="Offer AED off"
                            value={counterAmount}
                            onChange={(e) => setCounterAmount(e.target.value)}
                            style={{
                              padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px',
                              width: '120px', fontSize: '13px',
                            }}
                          />
                          <button
                            type="button"
                            disabled={acting === b.id}
                            onClick={() => submitCounter(b.id)}
                            style={btnStyle('#0B1120')}
                          >
                            Send offer
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {b.discount_status === 'countered' && (
                    <span style={{ fontSize: '12px', color: '#b06000' }}>Waiting on tenant…</span>
                  )}
                  {b.status === 'pending' && b.discount_status !== 'pending' && b.discount_status !== 'countered' && (
                    <button
                      type="button"
                      disabled={acting === b.id}
                      onClick={() => confirmBooking(b.id)}
                      style={btnStyle('#0B1120')}
                    >
                      Confirm payment
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#888' }}>No bookings found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
