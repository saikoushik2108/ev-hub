import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import { CalendarCheck, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/bookings', {
        params: { status: statusFilter || undefined },
      });
      if (res.data?.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            Platform Bookings & Reservations ({bookings.length})
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Monitor reservation lifecycles, cancellations, refunds, and driver check-in times
          </p>
        </div>

        <select
          className="form-select"
          style={{ height: '38px', fontSize: '0.85rem' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="IN_PROGRESS">In Progress (Charging)</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
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
                  <th>Booking ID</th>
                  <th>Driver</th>
                  <th>Host</th>
                  <th>Station</th>
                  <th>Start Time</th>
                  <th>Total GMV</th>
                  <th>10% Commission</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                      #{b._id.slice(-6)}
                    </td>
                    <td>
                      <div>{b.userId?.name || 'Driver'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{b.userId?.email}</div>
                    </td>
                    <td>
                      <div>{b.ownerId?.name || 'Host'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{b.ownerId?.email}</div>
                    </td>
                    <td>{b.stationId?.name || 'Station'}</td>
                    <td style={{ fontSize: '0.8rem' }}>
                      <div>{new Date(b.startTime).toLocaleDateString()}</div>
                      <div style={{ color: 'var(--text-dim)' }}>
                        {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
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
        )}
      </div>
    </div>
  );
};

export default AdminBookings;

