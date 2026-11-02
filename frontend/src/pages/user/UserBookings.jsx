import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import RatingStars from '../../components/common/RatingStars';
import {
  CalendarCheck,
  QrCode,
  MapPin,
  Clock,
  Zap,
  Phone,
  AlertTriangle,
  Star,
  XCircle,
  FileText,
  Navigation,
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(''); // '' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

  // Modal states
  const [qrModalBooking, setQrModalBooking] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [reviewModalBooking, setReviewModalBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/my', {
        params: { status: filter || undefined },
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
  }, [filter]);

  // Handle Cancellation
  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    setSubmittingAction(true);
    try {
      const res = await api.patch(`/bookings/${cancelModalBooking._id}/cancel`, {
        reason: cancelReason,
      });
      if (res.data?.success) {
        toast.success(`Booking cancelled. Refund of ₹${res.data.refundAmount} initiated.`);
        setCancelModalBooking(null);
        fetchBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle Review Submission
  const handleSubmitReview = async () => {
    if (!reviewModalBooking) return;
    if (!reviewComment.trim()) {
      toast.error('Please enter a comment.');
      return;
    }

    setSubmittingAction(true);
    try {
      const res = await api.post('/reviews', {
        bookingId: reviewModalBooking._id,
        rating: reviewRating,
        comment: reviewComment,
      });
      if (res.data?.success) {
        toast.success('Review submitted! Thank you.');
        setReviewModalBooking(null);
        setReviewComment('');
        fetchBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            My Charging Sessions
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            View your upcoming reservations, unlocked host addresses, and past charging records
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--bg-elevated)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          {[
            { label: 'All Sessions', value: '' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Completed', value: 'COMPLETED' },
            { label: 'Cancelled', value: 'CANCELLED' },
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
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <Zap size={48} color="var(--primary-green)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
            No bookings found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Ready to hit the road? Discover and book nearby fast charging points.
          </p>
          <a href="/explore" className="btn btn-primary">
            Explore Charging Map
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {bookings.map((booking) => {
            const isConfirmed =
              booking.bookingStatus === 'CONFIRMED' ||
              booking.bookingStatus === 'IN_PROGRESS';
            const isCompleted = booking.bookingStatus === 'COMPLETED';

            return (
              <div
                key={booking._id}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '20px',
                  borderLeft: isConfirmed ? '4px solid var(--primary-green)' : '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
                  <img
                    src={
                      booking.stationId?.photos?.[0] ||
                      'https://images.unsplash.com/photo-1558441719-8b449c6ff673?auto=format&fit=crop&w=300&q=80'
                    }
                    alt="Station"
                    style={{ width: '84px', height: '84px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                  />

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                        {booking.stationId?.name || 'Charging Station'}
                      </h3>
                      <Badge status={booking.bookingStatus} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.825rem', marginBottom: '6px' }}>
                      <MapPin size={14} color="var(--primary-green)" />
                      {booking.stationId?.address?.full || booking.stationId?.address?.street || 'Hyderabad'}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} color="var(--primary-green)" />
                        {new Date(booking.startTime).toLocaleDateString()} • {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>Total: ₹{booking.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Action Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {isConfirmed && (
                    <>
                      <button
                        onClick={() => setQrModalBooking(booking)}
                        className="btn btn-primary btn-sm"
                      >
                        <QrCode size={15} /> Check-In QR
                      </button>
                      <button
                        onClick={() => {
                          setCancelModalBooking(booking);
                          setCancelReason('');
                        }}
                        className="btn btn-danger btn-sm"
                      >
                        Cancel Slot
                      </button>
                    </>
                  )}

                  {isCompleted && !booking.isReviewed && (
                    <button
                      onClick={() => {
                        setReviewModalBooking(booking);
                        setReviewRating(5);
                        setReviewComment('');
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      <Star size={14} color="#F5B942" /> Leave Review
                    </button>
                  )}

                  {isCompleted && booking.isReviewed && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary-green)', fontWeight: 600 }}>
                      ✓ Reviewed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Check-In Modal */}
      {qrModalBooking && (
        <Modal
          isOpen={!!qrModalBooking}
          onClose={() => setQrModalBooking(null)}
          title="Check-In Verification"
          maxWidth="460px"
        >
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              6-Digit Host PIN
            </span>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary-green)', letterSpacing: '6px', margin: '6px 0' }}>
              {qrModalBooking.verificationCode}
            </div>

            {qrModalBooking.qrCode && (
              <img
                src={qrModalBooking.qrCode}
                alt="QR Code"
                style={{ width: '180px', height: '180px', borderRadius: 'var(--radius-md)', margin: '14px auto' }}
              />
            )}

            <div className="card-elevated" style={{ textAlign: 'left', marginTop: '16px', padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary-green)', fontWeight: 700 }}>
                UNLOCKED RESIDENTIAL ADDRESS:
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '2px' }}>
                {qrModalBooking.stationId?.name}
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {qrModalBooking.stationId?.address?.full || qrModalBooking.stationId?.address?.street}
              </div>
              {qrModalBooking.stationId?.address?.landmark && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Landmark: {qrModalBooking.stationId.address.landmark}
                </div>
              )}
              {qrModalBooking.ownerId?.phone && (
                <div style={{ fontSize: '0.825rem', color: 'var(--primary-green)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} /> Host Contact: {qrModalBooking.ownerId.phone}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Booking Confirmation Modal */}
      {cancelModalBooking && (
        <Modal
          isOpen={!!cancelModalBooking}
          onClose={() => setCancelModalBooking(null)}
          title="Confirm Booking Cancellation"
          maxWidth="480px"
        >
          <div>
            <div
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--warning-dim)',
                color: 'var(--warning)',
                fontSize: '0.85rem',
                marginBottom: '16px',
                lineHeight: '1.5',
              }}
            >
              <strong>Cancellation Policy:</strong> Cancellations made &gt;2 hours before session start receive a 100% refund.
              Cancellations within 2 hours receive a 75% refund.
            </div>

            <div className="form-group">
              <label className="form-label">Reason for Cancellation (Optional)</label>
              <textarea
                className="form-textarea"
                placeholder="e.g. Change of plans, found alternate charger..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                disabled={submittingAction}
                onClick={handleCancelBooking}
                className="btn btn-danger"
                style={{ flex: 1 }}
              >
                {submittingAction ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Keep Booking
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Leave Review Modal */}
      {reviewModalBooking && (
        <Modal
          isOpen={!!reviewModalBooking}
          onClose={() => setReviewModalBooking(null)}
          title="Review Your Charging Session"
          maxWidth="480px"
        >
          <div>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                How was your experience at {reviewModalBooking.stationId?.name}?
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    style={{ padding: '4px' }}
                  >
                    <Star
                      size={28}
                      fill={star <= reviewRating ? '#F5B942' : 'transparent'}
                      stroke="#F5B942"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Your Comments & Experience</label>
              <textarea
                className="form-textarea"
                placeholder="Speed of charging, host hospitality, accessibility of parking bay..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                required
              />
            </div>

            <button
              type="button"
              disabled={submittingAction}
              onClick={handleSubmitReview}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              {submittingAction ? 'Submitting...' : 'Post Verified Review'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserBookings;

