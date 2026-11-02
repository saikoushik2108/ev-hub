import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import { Building, CheckCircle2, XCircle, Shield, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminOwners = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);

  const fetchOwners = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/owners');
      if (res.data?.success) {
        setOwners(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load host list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const handleApprove = async (id) => {
    setVerifyingId(id);
    try {
      const res = await api.patch(`/admin/owners/${id}/approve`);
      if (res.data?.success) {
        toast.success('Host profile approved!');
        fetchOwners();
      }
    } catch (err) {
      toast.error('Approval failed.');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter reason for rejection:');
    if (!reason) return;

    setVerifyingId(id);
    try {
      const res = await api.patch(`/admin/owners/${id}/reject`, { reason });
      if (res.data?.success) {
        toast.success('Host profile rejected.');
        fetchOwners();
      }
    } catch (err) {
      toast.error('Rejection failed.');
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          Host Verification & Owner Management
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Verify host residential addresses, review credentials, and monitor subscription standing
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
                  <th>Host Name</th>
                  <th>Residential Address</th>
                  <th>Payout Bank</th>
                  <th>Verification</th>
                  <th>Subscription</th>
                  <th>Earnings</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {owners.map((owner) => (
                  <tr key={owner._id}>
                    <td>
                      <strong>{owner.userId?.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{owner.userId?.email}</div>
                    </td>
                    <td>
                      <div>{owner.address?.street}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {owner.address?.area}, {owner.address?.city} {owner.address?.pincode}
                      </div>
                    </td>
                    <td>
                      <div>{owner.payoutDetailsReference?.bankName || 'HDFC Bank'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {owner.payoutDetailsReference?.accountNumberMasked || 'Verified'}
                      </div>
                    </td>
                    <td>
                      <Badge status={owner.verificationStatus} />
                    </td>
                    <td>
                      <Badge status={owner.subscriptionStatus} />
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                      ₹{(owner.totalEarnings || 0).toLocaleString('en-IN')}
                    </td>
                    <td>
                      {owner.verificationStatus === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleApprove(owner._id)}
                            disabled={verifyingId === owner._id}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(owner._id)}
                            disabled={verifyingId === owner._id}
                            className="btn btn-danger btn-sm"
                            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                          Verified
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

export default AdminOwners;

