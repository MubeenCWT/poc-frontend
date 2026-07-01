import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiTool, FiCalendar, FiBox, FiLogOut, FiBell } from 'react-icons/fi';
import { apiFetch } from '../lib/api.js';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('dar_admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const fetchNotifs = () => {
      apiFetch('/api/notifications/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(r => {
        if(r.status === 401) {
          localStorage.removeItem('dar_admin_token');
          navigate('/admin/login');
        }
        return r.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data);
          setUnreadCount(data.filter(n => !n.delivered).length);
        }
      })
      .catch(console.error);
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('dar_admin_token');
    navigate('/admin/login');
  };

  const markAllRead = () => {
    apiFetch('/api/notifications/read-all', {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('dar_admin_token')}` }
    }).then(() => setUnreadCount(0));
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <FiHome /> },
    { path: '/admin/properties', label: 'Properties', icon: <FiBox /> },
    { path: '/admin/bookings', label: 'Bookings', icon: <FiCalendar /> },
    { path: '/admin/maintenance', label: 'Maintenance', icon: <FiTool /> },
    { path: '/admin/vendors', label: 'Vendors', icon: <FiTool /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5EDE0' }}>
      {/* Sidebar */}
      <div style={{
        width: '240px', background: '#0B1120', color: '#F5EDE0',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '24px', fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800 }}>
          DAR Admin
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 16px' }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                borderRadius: '8px', color: isActive ? '#0B1120' : '#F5EDE0',
                background: isActive ? '#C9A876' : 'transparent', textDecoration: 'none',
                fontWeight: isActive ? 600 : 400
              }}>
                {item.icon} {item.label}
              </Link>
            )
          })}
        </nav>
        <div style={{ padding: '24px' }}>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '12px', background: 'transparent',
            color: '#F5EDE0', border: 'none', cursor: 'pointer', fontSize: '15px'
          }}>
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{
          background: '#fff', padding: '16px 32px', display: 'flex',
          justifyContent: 'flex-end', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifs(!showNotifs)}
              style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', position: 'relative' }}
            >
              <FiBell />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-5px', right: '-5px', background: '#E8622C',
                  color: '#fff', fontSize: '10px', width: '16px', height: '16px',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifs && (
              <div style={{
                position: 'absolute', top: '40px', right: '0', width: '320px',
                background: '#fff', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                zIndex: 100, border: '1px solid rgba(0,0,0,0.1)'
              }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '14px', margin: 0 }}>Notifications</h3>
                  <button onClick={markAllRead} style={{ fontSize: '12px', color: '#2D3B4E', background: 'transparent', border: 'none', cursor: 'pointer' }}>Mark all read</button>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#888', fontSize: '14px' }}>No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} style={{
                        padding: '16px', borderBottom: '1px solid #eee',
                        background: n.delivered ? '#fff' : '#f0f7ff',
                        fontSize: '13px', whiteSpace: 'pre-wrap'
                      }}>
                        {n.message}
                        <div style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>
                          {new Date(n.sent_at).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
