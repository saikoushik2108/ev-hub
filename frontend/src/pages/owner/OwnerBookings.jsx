import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  CalendarCheck,
  QrCode,
  CheckCircle2,
  Phone,
  User,
  Car,
  Clock,
  Play,
  CheckSquare,
  AlertOctagon,
} from 'lucide-react';
import toast from 'react-hot-toast';

const OwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  // QR / Code check-in state
  const [verifyModalBooking, setVerifyModalBooking] = useState(null);
  const [enteredCode, setEnteredCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/owner/bookings', {
        params: { status: filter || undefined },
      });
      if (res.data?.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load host reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const handleActionSession = async (bookingId, action) => {
    setVerifying(true);
    try {
      const res = await api.post(`/bookings/${bookingId}/verify-qr`, {
        verificationCode: enteredCode || undefined,
        action,
      });
      if (res.data?.success) {
        toast.success(`Session updated: ${action === 'START_SESSION' ? 'Started ⚡' : 'Completed 🏁'}`);
        setVerifyModalBooking(null);
        setEnteredCode('');
        fetchBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification action failed.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            Bookings & Check-In Verification
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Verify driver arrivals, scan check-in QR codes, and monitor charging sessions
          </p>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--bg-elevated)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          {[
            { label: 'All Bookings', value: '' },
            { label: 'Confirmed', value: 'CONFIRMED' },
            { label: 'Charging Now', value: 'IN_PROGRESS' },
            { label: 'Completed', value: 'COMPLETED' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: filter === tab.value ? 'var(--primary-green)' : 'transparent',
                color: filter === tab.value ? '#090B0A' : 'var(--text-muted)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <CalendarCheck size={44} color="var(--primary-green)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
            No reservations found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Upcoming driver bookings will appear here in real-time.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {bookings.map((b) => (
            <div
              key={b._id}
              className="card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px',
                borderLeft: b.bookingStatus === 'CONFIRMED' ? '4px solid var(--primary-green)' : '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{b.stationId?.name}</h3>
                  <Badge status={b.bookingStatus} />
                </div>

                {/* Driver Details */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <User size={14} color="var(--primary-green)" /> Driver: <strong style={{ color: 'var(--text-main)' }}>{b.userId?.name}</strong>
                  </span>
                  {b.userId?.phone && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Phone size={14} /> {b.userId?.phone}
                    </span>
                  )}
                  {b.userId?.vehicleDetails?.model && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Car size={14} /> {b.userId?.vehicleDetails?.make} {b.userId?.vehicleDetails?.model} ({b.userId?.vehicleDetails?.registrationNumber || 'EV'})
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-main)', fontWeight: 600 }}>
                    <Clock size={14} color="var(--primary-green)" />
                    {new Date(b.startTime).toLocaleDateString()} • {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span style={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                    Your Earning: ₹{b.ownerEarning}
                  </span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.775rem' }}>
                    PIN: {b.verificationCode}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {b.bookingStatus === 'CONFIRMED' && (
                  <button
                    onClick={() => {
                      setVerifyModalBooking(b);
                      setEnteredCode(b.verificationCode);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <QrCode size={16} /> Verify Check-In
                  </button>
                )}

                {b.bookingStatus === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleActionSession(b._id, 'COMPLETE_SESSION')}
                    className="btn btn-primary btn-sm"
                  >
                    <CheckSquare size={16} /> Mark Session Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verification Check-In Modal */}
      {verifyModalBooking && (
        <Modal
          isOpen={!!verifyModalBooking}
          onClose={() => setVerifyModalBooking(null)}
          title="Verify Driver Arrival"
          maxWidth="460px"
        >
          <div>
            <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Driver <strong>{verifyModalBooking.userId?.name}</strong> has arrived at {verifyModalBooking.stationId?.name}.
            </div>

            <div className="form-group">
              <label className="form-label">Driver's 6-Digit Verification Code</label>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '1.4rem', letterSpacing: '4px', textAlign: 'center', fontWeight: 800 }}
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value)}
                maxLength={6}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                type="button"
                disabled={verifying}
                onClick={() => handleActionSession(verifyModalBooking._id, 'START_SESSION')}
                className="btn btn-primary"
                style={{ flex: 1, padding: '12px' }}
              >
                <Play size={16} /> Start Charging Session
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OwnerBookings;

