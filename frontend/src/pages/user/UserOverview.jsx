import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MetricCard from '../../components/common/MetricCard';
import Badge from '../../components/common/Badge';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarCheck,
  Zap,
  Heart,
  Leaf,
  QrCode,
  MapPin,
  Clock,
  ArrowRight,
  Navigation,
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserOverview = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.get('/user/overview');
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load user overview metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const nextBooking = data?.upcomingBookings?.[0];

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          Welcome back, {user?.name?.split(' ')[0]} ⚡
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Your vehicle: <strong>{user?.vehicleDetails?.make || 'EV'} {user?.vehicleDetails?.model || ''}</strong> ({user?.vehicleDetails?.preferredConnector || 'Type 2'})
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <MetricCard
          title="Active Bookings"
          value={data?.upcomingBookings?.length || 0}
          subtitle="Confirmed reservations"
          icon={CalendarCheck}
          color="green"
        />
        <MetricCard
          title="Total Charging Sessions"
          value={data?.totalBookings || 0}
          subtitle="All-time sessions"
          icon={Zap}
        />
        <MetricCard
          title="Saved Stations"
          value={data?.favoritesCount || 0}
          subtitle="Favorite charging points"
          icon={Heart}
        />
        <MetricCard
          title="CO₂ Emissions Offset"
          value={`${data?.co2SavedKg || 0} kg`}
          subtitle="Clean green travel"
          icon={Leaf}
          color="green"
        />
      </div>

      {/* Next Upcoming Booking Hero Card */}
      {nextBooking && (
        <div
          className="card"
          style={{
            marginBottom: '32px',
            border: '1px solid var(--primary-green)',
            boxShadow: 'var(--shadow-glow)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-green)', letterSpacing: '0.8px' }}>
              NEXT UPCOMING CHARGING SESSION
            </span>
            <Badge status={nextBooking.bookingStatus} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '6px' }}>
                {nextBooking.stationId?.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <MapPin size={16} color="var(--primary-green)" />
                {nextBooking.stationId?.address?.full || nextBooking.stationId?.address?.street || 'Hyderabad'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-green)', fontSize: '0.9rem', fontWeight: 600, marginTop: '8px' }}>
                <Clock size={16} />
                {new Date(nextBooking.startTime).toLocaleDateString()} • {new Date(nextBooking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(nextBooking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Verification PIN: <strong style={{ color: 'var(--primary-green)', fontSize: '1.1rem', letterSpacing: '2px' }}>{nextBooking.verificationCode}</strong>
              </div>
              <Link to="/user/bookings" className="btn btn-primary btn-sm">
                <QrCode size={16} /> Open Check-In QR Code
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Tiles */}
      <div className="grid-2">
        <div className="card-elevated" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
            Need a Quick Charge?
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '16px' }}>
            Find available charging sockets around your current location with live availability.
          </p>
          <Link to="/explore" className="btn btn-primary btn-sm">
            Launch Interactive Map <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card-elevated" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
            Vehicle & Connector Settings
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '16px' }}>
            Update your battery capacity and preferred connector standard for customized search.
          </p>
          <Link to="/user/profile" className="btn btn-secondary btn-sm">
            Manage Vehicle Info
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserOverview;

