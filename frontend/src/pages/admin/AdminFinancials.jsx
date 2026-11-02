import React, { useState, useEffect } from 'react';
import MetricCard from '../../components/common/MetricCard';
import Badge from '../../components/common/Badge';
import api from '../../services/api';
import { DollarSign, CreditCard, ShieldCheck, CheckCircle2, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminFinancials = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settlingId, setSettlingId] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/transactions');
      if (res.data?.success) {
        setTransactions(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load financials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSettle = async (t) => {
    const reference = window.prompt('Enter Bank Payout / UTR Transfer Reference:', `UTR_AXIS_${Date.now()}`);
    if (!reference) return;

    setSettlingId(t._id);
    try {
      const res = await api.patch(`/admin/transactions/${t._id}/settle`, { reference });
      if (res.data?.success) {
        toast.success(`Host payout of ₹${t.ownerNetAmount} marked settled!`);
        fetchTransactions();
      }
    } catch (err) {
      toast.error('Failed to settle transaction.');
    } finally {
      setSettlingId(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          Financial Settlement & Commission Ledger
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Manage marketplace commissions (10%), host balances, and trigger bank payouts
        </p>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '24px' }}>
            <div className="skeleton" style={{ height: '240px' }} />
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Host</th>
                  <th>Transaction Type</th>
                  <th>Gross GMV</th>
                  <th>Platform Fee (10%)</th>
                  <th>Host Net (90%)</th>
                  <th>Settlement Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id}>
                    <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td>
                      <strong>{t.ownerId?.name || 'Platform'}</strong>
                    </td>
                    <td>{t.type}</td>
                    <td style={{ fontWeight: 700 }}>₹{t.grossAmount}</td>
                    <td style={{ color: 'var(--primary-green)', fontWeight: 600 }}>
                      ₹{t.platformCommission}
                    </td>
                    <td style={{ fontWeight: 700 }}>₹{t.ownerNetAmount}</td>
                    <td>
                      <Badge status={t.settlementStatus} />
                    </td>
                    <td>
                      {t.settlementStatus === 'PENDING' && t.ownerNetAmount > 0 ? (
                        <button
                          onClick={() => handleSettle(t)}
                          disabled={settlingId === t._id}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        >
                          <Send size={12} /> Settle Payout
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {t.settlementReference || 'Complete'}
                        </span>
                      )}
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

export default AdminFinancials;

