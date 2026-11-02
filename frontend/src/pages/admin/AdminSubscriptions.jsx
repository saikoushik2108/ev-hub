import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import { CreditCard, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubs = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/subscriptions');
        if (res.data?.success) {
          setSubscriptions(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load subscriptions.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubs();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          Host Subscriptions ({subscriptions.length})
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Monitor monthly recurring host plans, active validity windows, and revenue
        </p>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '24px' }}>
            <div className="skeleton" style={{ height: '200px' }} />
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Host</th>
                  <th>Subscribed Plan</th>
                  <th>Monthly Fee</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub._id}>
                    <td>
                      <strong>{sub.ownerId?.name || 'Host'}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{sub.ownerId?.email}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                        {sub.planId?.name || 'Host Plan'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>₹{sub.amount}/mo</td>
                    <td style={{ fontSize: '0.8rem' }}>{new Date(sub.startDate).toLocaleDateString()}</td>
                    <td style={{ fontSize: '0.8rem' }}>{new Date(sub.endDate).toLocaleDateString()}</td>
                    <td>
                      <Badge status={sub.status} />
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

export default AdminSubscriptions;

