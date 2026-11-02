import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import { Zap, CheckCircle2, XCircle, MapPin, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminStations = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchStations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stations', {
        params: { approvalStatus: statusFilter || undefined },
      });
      if (res.data?.success) {
        setStations(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load charging stations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, [statusFilter]);

  const handleApproveStation = async (id) => {
    try {
      const res = await api.patch(`/admin/stations/${id}/approve`);
      if (res.data?.success) {
        toast.success('Charging station approved! Public listing synced.');
        fetchStations();
      }
    } catch (err) {
      toast.error('Approval failed.');
    }
  };

  const handleRejectStation = async (id) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const res = await api.patch(`/admin/stations/${id}/reject`, { reason });
      if (res.data?.success) {
        toast.success('Charging station rejected.');
        fetchStations();
      }
    } catch (err) {
      toast.error('Rejection failed.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            Charging Station Approvals & Moderation ({stations.length})
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Enforce electrical specifications, host subscription eligibility, and map listings
          </p>
        </div>

        <select
          className="form-select"
          style={{ height: '38px', fontSize: '0.85rem' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending Verification</option>
          <option value="APPROVED">Approved Stations</option>
          <option value="REJECTED">Rejected Stations</option>
        </select>
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
                  <th>Station</th>
                  <th>Host</th>
                  <th>Specs & Rate</th>
                  <th>Approval</th>
                  <th>Publicly Listed?</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stations.map((st) => (
                  <tr key={st._id}>
                    <td>
                      <strong>{st.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {st.address?.area}, {st.address?.city}
                      </div>
                    </td>
                    <td>
                      <div>{st.ownerId?.name || 'Host'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{st.ownerId?.email}</div>
                    </td>
                    <td>
                      <div>{st.chargingCapacity} kW {st.chargerType} • {st.connectorType}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary-green)', fontWeight: 600 }}>
                        ₹{st.price} / {st.priceUnit || 'kWh'}
                      </div>
                    </td>
                    <td>
                      <Badge status={st.approvalStatus} />
                    </td>
                    <td>
                      {st.isPubliclyListed ? (
                        <span style={{ color: 'var(--primary-green)', fontSize: '0.8rem', fontWeight: 700 }}>
                          ✓ Live on Map
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                          Hidden (No Sub / Pending)
                        </span>
                      )}
                    </td>
                    <td>
                      {st.approvalStatus === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleApproveStation(st._id)}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectStation(st._id)}
                            className="btn btn-danger btn-sm"
                            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <a
                          href={`/station/${st._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        >
                          View
                        </a>
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

export default AdminStations;

