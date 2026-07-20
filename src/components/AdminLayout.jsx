import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiTool, FiCalendar, FiBox, FiLogOut, FiBell, FiMenu, FiUsers } from 'react-icons/fi';
import { apiFetch } from '../lib/api.js';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

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
    { path: '/admin/owners', label: 'Owners', icon: <FiUsers /> },
    { path: '/admin/bookings', label: 'Bookings', icon: <FiCalendar /> },
    { path: '/admin/maintenance', label: 'Maintenance', icon: <FiTool /> },
    { path: '/admin/vendors', label: 'Vendors', icon: <FiTool /> },
  ];

  return (
    <div className="admin-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="admin-backdrop"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`admin-sidebar${sidebarOpen ? ' admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__brand">UAE Stays Admin</div>
        <nav className="admin-sidebar__nav">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`}>
                {item.icon} {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="admin-sidebar__footer">
          <button type="button" onClick={handleLogout} className="admin-logout-btn">
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <button
            type="button"
            className="admin-menu-btn"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu />
          </button>

          <div className="admin-notif-wrap">
            <button
              type="button"
              onClick={() => setShowNotifs(!showNotifs)}
              className="admin-notif-btn"
            >
              <FiBell />
              {unreadCount > 0 && (
                <span className="admin-notif-badge">{unreadCount}</span>
              )}
            </button>

            {showNotifs && (
              <div className="admin-notif-panel">
                <div className="admin-notif-panel__head">
                  <h3>Notifications</h3>
                  <button type="button" onClick={markAllRead}>Mark all read</button>
                </div>
                <div className="admin-notif-panel__list">
                  {notifications.length === 0 ? (
                    <div className="admin-notif-empty">No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`admin-notif-item${n.delivered ? '' : ' admin-notif-item--unread'}`}>
                        {n.message}
                        <div className="admin-notif-time">
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

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
