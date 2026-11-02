import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import { Search, UserX, UserCheck, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: {
          role: roleFilter || undefined,
          q: search || undefined,
        },
      });
      if (res.data?.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await api.patch(`/admin/users/${user._id}/status`, {
        status: newStatus,
      });
      if (res.data?.success) {
        toast.success(`User account ${newStatus.toLowerCase()}!`);
        fetchUsers();
      }
    } catch (err) {
      toast.error('Failed to update user status.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            User Account Management ({users.length})
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Inspect registered accounts, vehicle profiles, and manage access privileges
          </p>
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by name, email..."
              className="form-input"
              style={{ width: '100%', paddingLeft: '34px', height: '38px', fontSize: '0.85rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') fetchUsers(); }}
            />
          </div>

          <select
            className="form-select"
            style={{ height: '38px', fontSize: '0.85rem' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="USER">Drivers (USER)</option>
            <option value="OWNER">Hosts (OWNER)</option>
            <option value="ADMIN">Admins (ADMIN)</option>
          </select>
        </div>
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
                  <th>User</th>
                  <th>Role</th>
                  <th>Contact Info</th>
                  <th>Vehicle Details</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <strong>{u.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: u.role === 'ADMIN' ? 'rgba(79, 172, 254, 0.15)' : u.role === 'OWNER' ? 'var(--primary-green-dim)' : 'var(--bg-elevated)',
                          color: u.role === 'ADMIN' ? '#4FACFE' : u.role === 'OWNER' ? 'var(--primary-green)' : 'var(--text-main)',
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>{u.phone || '—'}</td>
                    <td>
                      {u.vehicleDetails?.make ? (
                        <div style={{ fontSize: '0.8rem' }}>
                          <div>{u.vehicleDetails.make} {u.vehicleDetails.model}</div>
                          <div style={{ color: 'var(--text-dim)' }}>{u.vehicleDetails.preferredConnector}</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      <Badge status={u.status} />
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`btn btn-sm ${u.status === 'ACTIVE' ? 'btn-danger' : 'btn-outline'}`}
                          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        >
                          {u.status === 'ACTIVE' ? (
                            <>
                              <UserX size={12} /> Suspend
                            </>
                          ) : (
                            <>
                              <UserCheck size={12} /> Reactivate
                            </>
                          )}
                        </button>
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

export default AdminUsers;

