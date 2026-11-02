import React, { useState, useEffect } from 'react';
import MetricCard from '../../components/common/MetricCard';
import Badge from '../../components/common/Badge';
import api from '../../services/api';
import {
  Wallet,
  ArrowUpRight,
  Receipt,
  Building,
  CheckCircle2,
  Clock,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import toast from 'react-hot-toast';

const OwnerEarnings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await api.get('/owner/earnings');
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load earnings analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          Earnings & Payout Ledger
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Track daily and monthly net revenue (90% host share) and bank settlements
        </p>
      </div>

      {/* Metrics */}
      <div className="grid-3" style={{ marginBottom: '32px' }}>
        <MetricCard
          title="All-Time Host Revenue"
          value={`₹${(data?.totalEarnings || 0).toLocaleString('en-IN')}`}
          subtitle="Net earnings credited"
          icon={Wallet}
          color="green"
        />
        <MetricCard
          title="Pending Bank Settlement"
          value={`₹${(data?.pendingSettlement || 0).toLocaleString('en-IN')}`}
          subtitle="Scheduled for next transfer batch"
          icon={Clock}
        />
        <MetricCard
          title="Completed Bank Payouts"
          value={`₹${(data?.settledAmount || 0).toLocaleString('en-IN')}`}
          subtitle="Transferred to verified account"
          icon={CheckCircle2}
          color="green"
        />
      </div>

      {/* Recharts Monthly Revenue Trend */}
      <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>
          Monthly Host Net Revenue Trend (INR)
        </h3>
        <div style={{ width: '100%', height: '280px' }}>
          {data?.monthlyTrends?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyTrends}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#39F28A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#39F28A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#243028" />
                <XAxis dataKey="month" stroke="#929C95" fontSize={12} />
                <YAxis stroke="#929C95" fontSize={12} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171E1A',
                    border: '1px solid #243028',
                    borderRadius: '8px',
                    color: '#F2F5F2',
                  }}
                  formatter={(val) => [`₹${val}`, 'Host Earning']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#39F28A" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No completed monthly bookings data yet.
            </div>
          )}
        </div>
      </div>

      {/* Payout Details & Ledger Table */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            Transaction & Payout History
          </h3>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Account on file: <strong>{data?.payoutDetails?.bankName || 'HDFC Bank'}</strong> ({data?.payoutDetails?.accountNumberMasked || 'Verified'})
          </div>
        </div>

        {data?.transactions?.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '24px 0' }}>
            No transaction records found.
          </p>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Transaction Type</th>
                  <th>Gross Amount</th>
                  <th>10% Platform Fee</th>
                  <th>Net Host Payout</th>
                  <th>Settlement Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.transactions?.map((t) => (
                  <tr key={t._id}>
                    <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td>{t.type}</td>
                    <td>₹{t.grossAmount}</td>
                    <td style={{ color: 'var(--text-dim)' }}>-₹{t.platformCommission}</td>
                    <td style={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                      ₹{t.ownerNetAmount}
                    </td>
                    <td>
                      <Badge status={t.settlementStatus} />
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

export default OwnerEarnings;

