import React, { useState, useEffect } from 'react';
import MetricCard from '../../components/common/MetricCard';
import Badge from '../../components/common/Badge';
import api from '../../services/api';
import {
  Users,
  Building,
  Zap,
  CalendarCheck,
  CreditCard,
  DollarSign,
  Clock,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';

const AdminOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.get('/admin/overview');
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load admin overview metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const m = data?.metrics;

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          System Administration Overview 🛡️
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Real-time platform telemetry, marketplace financials, host verifications, and charging throughput
        </p>
      </div>

      {/* Metrics Row 1 */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <MetricCard
          title="Total Registered Users"
          value={m?.totalUsers || 0}
          subtitle="Active EV drivers"
          icon={Users}
        />
        <MetricCard
          title="Verified Hosts"
          value={m?.totalOwners || 0}
          subtitle="Charging infrastructure hosts"
          icon={Building}
        />
        <MetricCard
          title="Active Charging Stations"
          value={`${m?.activeStations || 0} / ${m?.totalStations || 0}`}
          subtitle="Approved & publicly listed"
          icon={Zap}
          color="green"
        />
        <MetricCard
          title="Pending Approvals"
          value={m?.pendingApprovals || 0}
          subtitle={`${m?.pendingOwners || 0} hosts, ${m?.pendingStations || 0} stations`}
          icon={Clock}
          color="yellow"
        />
      </div>

      {/* Financial Metrics Row 2 */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <MetricCard
          title="Platform Commission (10%)"
          value={`₹${(m?.platformCommission || 0).toLocaleString('en-IN')}`}
          subtitle="Marketplace take-rate"
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Subscription Revenue"
          value={`₹${(m?.subscriptionRevenue || 0).toLocaleString('en-IN')}`}
          subtitle="Host recurring monthly plans"
          icon={CreditCard}
          color="green"
        />
        <MetricCard
          title="Gross Bookings Volume"
          value={`₹${(m?.bookingRevenue || 0).toLocaleString('en-IN')}`}
          subtitle="Total marketplace GMV"
          icon={TrendingUp}
        />
        <MetricCard
          title="Pending Host Settlements"
          value={`₹${(m?.pendingSettlements || 0).toLocaleString('en-IN')}`}
          subtitle="Due for host bank payout"
          icon={ShieldCheck}
        />
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid-2" style={{ marginBottom: '32px' }}>
        {/* Revenue Area Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '18px' }}>
            Platform Revenue & Commission (INR)
          </h3>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthlyTrends || []}>
                <defs>
                  <linearGradient id="colorAdminRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#39F28A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#39F28A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#243028" />
                <XAxis dataKey="name" stroke="#929C95" fontSize={12} />
                <YAxis stroke="#929C95" fontSize={12} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171E1A',
                    border: '1px solid #243028',
                    borderRadius: '8px',
                    color: '#F2F5F2',
                  }}
                />
                <Area type="monotone" dataKey="revenue" name="Total GMV" stroke="#8CF5B4" fill="url(#colorAdminRev)" />
                <Area type="monotone" dataKey="commission" name="Platform Commission" stroke="#39F28A" fillOpacity={0} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings Volume Bar Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '18px' }}>
            Monthly Booking Frequency
          </h3>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthlyTrends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243028" />
                <XAxis dataKey="name" stroke="#929C95" fontSize={12} />
                <YAxis stroke="#929C95" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171E1A',
                    border: '1px solid #243028',
                    borderRadius: '8px',
                    color: '#F2F5F2',
                  }}
                />
                <Bar dataKey="bookings" name="Bookings Count" fill="#39F28A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '18px' }}>
          Recent Global Marketplace Bookings
        </h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Driver</th>
                <th>Host</th>
                <th>Station</th>
                <th>Total GMV</th>
                <th>Platform Take (10%)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentBookings?.map((b) => (
                <tr key={b._id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    #{b._id.slice(-6)}
                  </td>
                  <td>{b.userId?.name || 'Driver'}</td>
                  <td>{b.ownerId?.name || 'Host'}</td>
                  <td>{b.stationId?.name || 'Station'}</td>
                  <td style={{ fontWeight: 700 }}>₹{b.totalAmount}</td>
                  <td style={{ color: 'var(--primary-green)', fontWeight: 700 }}>₹{b.platformFee}</td>
                  <td>
                    <Badge status={b.bookingStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;

