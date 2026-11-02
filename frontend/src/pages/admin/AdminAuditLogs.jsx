import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Shield, Clock, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/audit-logs');
        if (res.data?.success) {
          setLogs(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load audit logs.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          Administrative Security Audit Trail
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Immutable logs tracking sensitive admin operations, approvals, suspensions, settlements, and settings changes
        </p>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '24px' }}>
            <div className="skeleton" style={{ height: '240px' }} />
          </div>
        ) : logs.length === 0 ? (
          <p style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No audit logs recorded yet.
          </p>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Admin</th>
                  <th>Action</th>
                  <th>Target Type</th>
                  <th>Metadata Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <strong>{log.adminId?.name || 'Administrator'}</strong>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-elevated)',
                          color: 'var(--primary-green)',
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td>{log.targetType}</td>
                    <td style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {JSON.stringify(log.details || {})}
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

export default AdminAuditLogs;

