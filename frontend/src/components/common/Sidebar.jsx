import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building,
  Zap,
  CalendarCheck,
  CreditCard,
  Receipt,
  AlertCircle,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Calendar,
  Wallet,
  Star,
  Bell,
  Heart,
  HelpCircle,
  MapPin,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, role, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  // Role-specific navigation items
  const adminNav = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Hosts & Owners', path: '/admin/owners', icon: Building },
    { label: 'Charging Stations', path: '/admin/stations', icon: Zap },
    { label: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
    { label: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard },
    { label: 'Financials & Payouts', path: '/admin/financials', icon: Receipt },
    { label: 'CSV Reports', path: '/admin/reports', icon: FileText },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: Activity },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const ownerNav = [
    { label: 'Overview', path: '/owner', icon: LayoutDashboard },
    { label: 'My Stations', path: '/owner/stations', icon: Zap },
    { label: 'Register Station', path: '/owner/stations/new', icon: PlusCircle },
    { label: 'Calendar & Slots', path: '/owner/calendar', icon: Calendar },
    { label: 'Bookings & QR', path: '/owner/bookings', icon: CalendarCheck },
    { label: 'Earnings & Payouts', path: '/owner/earnings', icon: Wallet },
    { label: 'Subscriptions', path: '/owner/subscriptions', icon: CreditCard },
    { label: 'Reviews', path: '/owner/reviews', icon: Star },
    { label: 'Profile & Bank', path: '/owner/profile', icon: Building },
  ];

  const userNav = [
    { label: 'Overview', path: '/user', icon: LayoutDashboard },
    { label: 'Interactive Map', path: '/explore', icon: MapPin },
    { label: 'My Bookings', path: '/user/bookings', icon: CalendarCheck },
    { label: 'Saved Favorites', path: '/user/favorites', icon: Heart },
    { label: 'My Profile & EV', path: '/user/profile', icon: Users },
    { label: 'Support & Tickets', path: '/user/support', icon: HelpCircle },
  ];

  let navItems = userNav;
  if (role === 'ADMIN') navItems = adminNav;
  if (role === 'OWNER') navItems = ownerNav;

  return (
    <aside
      style={{
        width: collapsed ? '72px' : '260px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 200,
        height: 'calc(100vh - 61px)',
        position: 'sticky',
        top: '61px',
      }}
    >
      {/* Top Header & Collapse Toggle */}
      <div>
        <div
          style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.8px',
                  color: 'var(--primary-green)',
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary-green-dim)',
                }}
              >
                {role} PORTAL
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin' || item.path === '/owner' || item.path === '/user'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#090B0A' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--primary-green)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                })}
              >
                <Icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer User Info & Logout */}
      <div
        style={{
          padding: '14px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        {!collapsed && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '10px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--primary-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.name}
              </div>
              <div
                style={{
                  fontSize: '0.725rem',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.email}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '10px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--error)',
            fontSize: '0.85rem',
            background: 'var(--error-dim)',
            border: '1px solid rgba(255, 114, 114, 0.2)',
          }}
        >
          <LogOut size={16} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
