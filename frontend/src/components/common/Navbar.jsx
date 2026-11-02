import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Bell, User, LogOut, Menu, X, Shield, Radio, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const Navbar = () => {
  const { user, role, logout, isAuthenticated } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (role === 'ADMIN') return '/admin';
    if (role === 'OWNER') return '/owner';
    return '/user';
  };

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 500,
        backgroundColor: 'rgba(9, 11, 10, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '12px 24px',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #39F28A, #177A43)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#090B0A',
              boxShadow: '0 0 16px var(--primary-green-glow)',
            }}
          >
            <Zap size={22} fill="#090B0A" />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              EV<span style={{ color: 'var(--primary-green)' }}>HUB</span>
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.625rem',
                color: 'var(--text-muted)',
                letterSpacing: '1px',
                marginTop: '-3px',
                textTransform: 'uppercase',
              }}
            >
              Charge Anywhere
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '28px',
            fontSize: '0.925rem',
            fontWeight: 500,
          }}
          className="desktop-nav-links"
        >
          <Link to="/" style={{ color: 'var(--text-main)', transition: 'color 0.2s' }}>
            Home
          </Link>
          <Link to="/explore" style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} color="var(--primary-green)" />
            Explore Stations
          </Link>
          <Link to="/how-it-works" style={{ color: 'var(--text-muted)' }}>
            How It Works
          </Link>
          <Link to="/pricing" style={{ color: 'var(--text-muted)' }}>
            Host Plans
          </Link>
          <Link to="/about" style={{ color: 'var(--text-muted)' }}>
            About Us
          </Link>
        </div>

        {/* Right CTA / User controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  style={{
                    position: 'relative',
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: 'var(--primary-green)',
                        color: '#090B0A',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifDropdownOpen && (
                  <div
                    className="card"
                    style={{
                      position: 'absolute',
                      top: '48px',
                      right: 0,
                      width: '320px',
                      maxHeight: '380px',
                      overflowY: 'auto',
                      padding: '16px',
                      zIndex: 600,
                      boxShadow: 'var(--shadow-lg)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                        paddingBottom: '8px',
                        borderBottom: '1px solid var(--border-subtle)',
                      }}
                    >
                      <strong style={{ fontSize: '0.9rem' }}>Notifications</strong>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          style={{ fontSize: '0.75rem', color: 'var(--primary-green)' }}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                        No notifications yet.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {notifications.slice(0, 5).map((n) => (
                          <div
                            key={n._id}
                            onClick={() => {
                              markAsRead(n._id);
                              if (n.link) navigate(n.link);
                              setNotifDropdownOpen(false);
                            }}
                            style={{
                              padding: '10px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: n.isRead ? 'transparent' : 'var(--bg-elevated)',
                              borderLeft: n.isRead ? '2px solid transparent' : '2px solid var(--primary-green)',
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                              {n.title}
                            </div>
                            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {n.message}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dashboard Shortcut Button */}
              <Link to={getDashboardPath()} className="btn btn-primary btn-sm">
                Dashboard
              </Link>

              {/* User Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--primary-green)',
                      color: '#090B0A',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span>
                </button>

                {profileDropdownOpen && (
                  <div
                    className="card"
                    style={{
                      position: 'absolute',
                      top: '46px',
                      right: 0,
                      width: '200px',
                      padding: '12px',
                      zIndex: 600,
                      boxShadow: 'var(--shadow-lg)',
                    }}
                  >
                    <div style={{ paddingBottom: '8px', marginBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Role: {role}</div>
                    </div>
                    <Link
                      to={getDashboardPath()}
                      onClick={() => setProfileDropdownOpen(false)}
                      style={{
                        display: 'block',
                        padding: '8px',
                        fontSize: '0.85rem',
                        color: 'var(--text-main)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        width: '100%',
                        padding: '8px',
                        fontSize: '0.85rem',
                        color: 'var(--error)',
                        textAlign: 'left',
                        marginTop: '4px',
                      }}
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/explore" className="btn btn-primary btn-sm">
                Find Stations
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              padding: '6px',
              color: 'var(--text-main)',
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            padding: '16px 0',
            borderTop: '1px solid var(--border-subtle)',
            marginTop: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', color: 'var(--text-main)' }}>
            Home
          </Link>
          <Link to="/explore" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', color: 'var(--text-main)' }}>
            Explore Stations
          </Link>
          <Link to="/how-it-works" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', color: 'var(--text-muted)' }}>
            How It Works
          </Link>
          <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', color: 'var(--text-muted)' }}>
            Host Pricing Plans
          </Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', color: 'var(--text-muted)' }}>
            About Us
          </Link>
          {!isAuthenticated && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                Log In
              </Link>
              <Link to="/register-owner" onClick={() => setMobileMenuOpen(false)} className="btn btn-outline btn-sm" style={{ flex: 1 }}>
                Become Host
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 769px) {
          .desktop-nav-links { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;

