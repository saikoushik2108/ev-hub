import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MetricCard from '../../components/common/MetricCard';
import Badge from '../../components/common/Badge';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Zap,
  CalendarCheck,
  Wallet,
  Activity,
  PlusCircle,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

const OwnerOverview = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/owner/dashboard');
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load host overview.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const isSubActive = data?.subscriptionStatus === 'ACTIVE';

  return (
    <div>
      {/* Top Header & Alert Banner if subscription inactive */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            Host Control Panel ⚡
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage charging points, upcoming reservations, and track 90% payout earnings
          </p>
        </div>

        <Link to="/owner/stations/new" className="btn btn-primary">
          <PlusCircle size={18} /> Register Charging Point
        </Link>
      </div>

      {/* Mandatory Subscription Status Banner */}
      {!isSubActive && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--warning-dim)',
            border: '1px solid var(--warning)',
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={24} color="var(--warning)" />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--warning)', fontSize: '0.95rem' }}>
                Host Subscription Required for Public Discovery
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-main)', marginTop: '2px' }}>
                Your stations are hidden from driver search. Activate an active subscription plan to list them live on the map.
              </div>
            </div>
          </div>
          <Link to="/owner/subscriptions" className="btn btn-primary btn-sm">
            Activate Subscription <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Key Metrics Row */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <MetricCard
          title="Active Charging Points"
          value={`${data?.activeStations || 0} / ${data?.totalStations || 0}`}
          subtitle="Approved & online"
          icon={Zap}
          color="green"
        />
        <MetricCard
          title="Upcoming Bookings"
          value={data?.upcomingBookingsCount || 0}
          subtitle="Confirmed driver slots"
          icon={CalendarCheck}
          color="green"
        />
        <MetricCard
          title="Monthly Host Payout"
          value={`₹${(data?.monthlyEarnings || 0).toLocaleString('en-IN')}`}
          subtitle="90% net revenue split"
          icon={Wallet}
        />
        <MetricCard
          title="Station Utilization"
          value={`${data?.stationUtilization || 0}%`}
          subtitle="Operating hour efficiency"
          icon={Activity}
        />
      </div>

      {/* Secondary Metrics & Subscription Info */}
      <div className="grid-3" style={{ marginBottom: '32px' }}>
        <div className="card-elevated" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>HOST VERIFICATION</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
            <Badge status={data?.verificationStatus || 'PENDING'} />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Verified hosts receive priority search ranking
          </div>
        </div>

        <div className="card-elevated" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SUBSCRIPTION STATUS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
            <Badge status={data?.subscriptionStatus || 'INACTIVE'} />
          </div>
          <Link to="/owner/subscriptions" style={{ fontSize: '0.8rem', color: 'var(--primary-green)', fontWeight: 600 }}>
            Manage Subscription →
          </Link>
        </div>

        <div className="card-elevated" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PENDING SETTLEMENT</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-green)', margin: '4px 0' }}>
            ₹{(data?.pendingSettlement || 0).toLocaleString('en-IN')}
          </div>
          <Link to="/owner/earnings" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            View Payout Ledger →
          </Link>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Recent Station Reservations
          </h3>
          <Link to="/owner/bookings" style={{ fontSize: '0.85rem', color: 'var(--primary-green)', fontWeight: 600 }}>
            View All Bookings & QR Scanner →
          </Link>
        </div>

        {data?.recentBookings?.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '24px 0' }}>
            No bookings recorded yet. Once your station is approved and active, drivers can book slots.
          </p>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Station</th>
                  <th>Driver</th>
                  <th>Date & Time</th>
                  <th>Duration</th>
                  <th>Host Payout</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentBookings?.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <strong>{b.stationId?.name || 'Charging Station'}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {b.stationId?.connectorType}
                      </div>
                    </td>
                    <td>
                      <div>{b.userId?.name || 'EV Driver'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{b.userId?.phone}</div>
                    </td>
                    <td>
                      <div>{new Date(b.startTime).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td>{b.durationMinutes} min</td>
                    <td style={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                      ₹{b.ownerEarning}
                    </td>
                    <td>
                      <Badge status={b.bookingStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerOverview;

