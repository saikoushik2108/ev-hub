import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { Zap, Clock, Calendar, CheckCircle2, AlertTriangle, ShieldCheck, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const BookingModal = ({ isOpen, onClose, station, onBookingSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Hold State
  const [heldBooking, setHeldBooking] = useState(null);
  const [holdSecondsLeft, setHoldSecondsLeft] = useState(300);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Fetch slots whenever selectedDate or station changes
  useEffect(() => {
    if (!station?._id || !isOpen) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const res = await api.get(`/stations/${station._id}/availability`, {
          params: { date: selectedDate },
        });
        if (res.data?.success) {
          setSlots(res.data.slots || []);
        }
      } catch (err) {
        toast.error('Failed to load slots for selected date.');
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
    setSelectedSlot(null);
    setHeldBooking(null);
    setConfirmedBooking(null);
  }, [station, selectedDate, isOpen]);

  // Hold Countdown Timer
  useEffect(() => {
    if (!heldBooking || confirmedBooking) return;

    const timer = setInterval(() => {
      setHoldSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error('Booking hold expired! Please select slot again.');
          setHeldBooking(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [heldBooking, confirmedBooking]);

  if (!station) return null;

  // Price calculations
  const calculateTotal = () => {
    if (!selectedSlot) return { base: 0, tax: 0, discount: 0, total: 0 };
    let base = 0;
    if (station.priceUnit === 'hour') {
      base = station.price;
    } else {
      // Estimate 1 hour charging kWh * price
      const estimatedKWh = Math.round(station.chargingCapacity * 0.85 * 10) / 10;
      base = Math.max(50, Math.round(station.price * estimatedKWh));
    }

    const tax = Math.round(base * 0.05); // 5% GST
    let discount = 0;
    if (appliedCoupon === 'EVFIRST') discount = Math.min(50, Math.round(base * 0.2));
    if (appliedCoupon === 'GREEN10') discount = Math.round(base * 0.1);

    const total = Math.max(10, base + tax - discount);
    return { base, tax, discount, total };
  };

  const { base, tax, discount, total } = calculateTotal();

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'EVFIRST' || code === 'GREEN10') {
      setAppliedCoupon(code);
      toast.success(`Coupon ${code} applied successfully!`);
    } else {
      toast.error('Invalid coupon code. Try EVFIRST or GREEN10.');
    }
  };

  // Step 1: Create 5-Minute Hold
  const handleHoldAndPay = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to reserve a charging slot.');
      navigate('/login');
      return;
    }

    if (!selectedSlot) {
      toast.error('Please select an available time slot.');
      return;
    }

    setProcessingPayment(true);
    try {
      const res = await api.post('/bookings/hold', {
        stationId: station._id,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        couponCode: appliedCoupon,
      });

      if (res.data?.success) {
        const holdData = res.data.data;
        setHeldBooking(holdData);
        setHoldSecondsLeft(300); // 5 minutes

        // Step 2: Trigger Razorpay Checkout
        launchRazorpayCheckout(holdData);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not hold slot. It may have just been booked.');
      setProcessingPayment(false);
    }
  };

  // Step 2: Razorpay Checkout Handler
  const launchRazorpayCheckout = (holdData) => {
    const isSandbox = holdData.isSandbox;
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder_key';

    // If real Razorpay key is present and SDK loaded
    if (window.Razorpay && !isSandbox && !keyId.includes('placeholder')) {
      const options = {
        key: keyId,
        amount: Math.round(holdData.amount * 100),
        currency: holdData.currency || 'INR',
        name: 'EV Hub',
        description: `Charging Slot at ${station.name}`,
        order_id: holdData.orderId,
        handler: async (response) => {
          await verifyAndFinalizeBooking({
            bookingId: holdData.booking._id,
            gatewayOrderId: response.razorpay_order_id,
            gatewayPaymentId: response.razorpay_payment_id,
            gatewaySignature: response.razorpay_signature,
          });
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        theme: { color: '#39F28A' },
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
            toast('Payment window closed. Slot remains held for remaining minutes.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      // Seamless Sandbox / Instant Test Payment (no live gateway keys required)
      toast.loading('Processing instant test payment...', { id: 'test-pay' });
      setTimeout(async () => {
        toast.dismiss('test-pay');
        await verifyAndFinalizeBooking({
          bookingId: holdData.booking._id,
          gatewayOrderId: holdData.orderId,
          gatewayPaymentId: `pay_test_${Date.now()}`,
          gatewaySignature: 'mock_sig_valid',
        });
      }, 700);
    }
  };

  const verifyAndFinalizeBooking = async (payload) => {
    try {
      const res = await api.post('/bookings/confirm', payload);
      if (res.data?.success) {
        setConfirmedBooking(res.data.data);
        toast.success('Payment verified & Booking Confirmed! ⚡');
        onBookingSuccess?.(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment verification failed.');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={confirmedBooking ? 'Booking Confirmed! ⚡' : `Book Charging Slot`} maxWidth="620px">
      {confirmedBooking ? (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-green-dim)',
              color: 'var(--primary-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
            Ready to Charge!
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Your charging slot has been reserved and confirmed.
          </p>

          {/* QR Code & Verification Pin */}
          <div className="card-elevated" style={{ marginBottom: '20px', padding: '20px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Check-In Verification Code
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-green)', letterSpacing: '4px', margin: '8px 0' }}>
              {confirmedBooking.verificationCode}
            </div>
            {confirmedBooking.qrCode && (
              <img
                src={confirmedBooking.qrCode}
                alt="Booking QR Code"
                style={{ width: '160px', height: '160px', borderRadius: 'var(--radius-md)', margin: '12px auto' }}
              />
            )}
            <p style={{ fontSize: '0.775rem', color: 'var(--text-dim)' }}>
              Show this QR code or 6-digit code to the host upon arrival.
            </p>
          </div>

          {/* Unlocked Host Address */}
          <div className="card" style={{ textAlign: 'left', marginBottom: '24px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary-green)', fontWeight: 700, marginBottom: '4px' }}>
              UNLOCKED EXACT RESIDENTIAL ADDRESS
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{station.name}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {station.address?.full || `${station.address?.street || ''}, ${station.address?.area || ''}, ${station.address?.city}`}
            </div>
            {station.address?.landmark && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Landmark: {station.address.landmark}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                onClose();
                navigate('/user/bookings');
              }}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              View My Bookings
            </button>
            <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Done
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Station Summary */}
          <div
            className="card-elevated"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              padding: '14px 18px',
            }}
          >
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700 }}>{station.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {station.connectorType} • {station.chargingCapacity} kW {station.chargerType}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-green)' }}>
                ₹{station.price}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>per {station.priceUnit || 'kWh'}</div>
            </div>
          </div>

          {/* Date Picker */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} color="var(--primary-green)" /> Select Date
            </label>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Slot Grid */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} color="var(--primary-green)" /> Available Time Slots
            </label>
            {loadingSlots ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="skeleton" style={{ height: '44px' }} />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <div className="card-elevated" style={{ textAlign: 'center', padding: '24px 12px' }}>
                <AlertTriangle size={24} color="var(--warning)" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  No available charging slots for this date.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '8px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  paddingRight: '4px',
                }}
              >
                {slots.map((slot, index) => {
                  const isSelected = selectedSlot?.startTime === slot.startTime;
                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={!slot.isAvailable}
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        backgroundColor: !slot.isAvailable
                          ? 'rgba(255, 114, 114, 0.08)'
                          : isSelected
                          ? 'var(--primary-green)'
                          : 'var(--bg-elevated)',
                        color: !slot.isAvailable
                          ? 'var(--error)'
                          : isSelected
                          ? '#090B0A'
                          : 'var(--text-main)',
                        border: isSelected
                          ? '1px solid var(--primary-green)'
                          : '1px solid var(--border-subtle)',
                        cursor: slot.isAvailable ? 'pointer' : 'not-allowed',
                        opacity: slot.isAvailable ? 1 : 0.6,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Coupon Code */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Coupon code (e.g. EVFIRST)"
                className="form-input"
                style={{ width: '100%', textTransform: 'uppercase' }}
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
            </div>
            <button type="button" onClick={handleApplyCoupon} className="btn btn-secondary btn-sm">
              <Tag size={14} /> Apply
            </button>
          </div>

          {/* Pricing Breakdown */}
          {selectedSlot && (
            <div
              className="card-elevated"
              style={{
                marginBottom: '20px',
                padding: '14px 18px',
                fontSize: '0.875rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Estimated Energy / Time Charge</span>
                <span>₹{base}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>GST (5%)</span>
                <span>₹{tax}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary-green)' }}>
                  <span>Discount ({appliedCoupon})</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '8px',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: 'var(--text-main)',
                }}
              >
                <span>Total Payable</span>
                <span style={{ color: 'var(--primary-green)' }}>₹{total}</span>
              </div>
            </div>
          )}

          {/* Active Hold Countdown Alert */}
          {heldBooking && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--warning-dim)',
                color: 'var(--warning)',
                fontSize: '0.825rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>Slot held! Complete payment in:</span>
              <strong style={{ fontSize: '1rem', fontFamily: 'var(--font-mono)' }}>
                {Math.floor(holdSecondsLeft / 60)}:
                {String(holdSecondsLeft % 60).padStart(2, '0')}
              </strong>
            </div>
          )}

          {/* Test Payment Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: 'rgba(57, 242, 138, 0.08)',
              border: '1px solid rgba(57, 242, 138, 0.25)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              color: 'var(--primary-green)',
              marginBottom: '14px',
            }}
          >
            <Zap size={16} />
            <span>
              <strong>Instant Test Mode:</strong> 1-click payment confirmation active (no Razorpay credentials required).
            </span>
          </div>

          {/* CTA Button */}
          <button
            type="button"
            disabled={!selectedSlot || processingPayment}
            onClick={handleHoldAndPay}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
          >
            {processingPayment ? (
              'Processing Payment...'
            ) : (
              <>
                <ShieldCheck size={18} /> Pay ₹{total} (Instant Confirmation ⚡)
              </>
            )}
          </button>
          <div
            style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              color: 'var(--text-dim)',
              marginTop: '10px',
            }}
          >
            Exact residential address & directions unlocked immediately upon confirmed payment.
          </div>
        </div>
      )}
    </Modal>
  );
};

export default BookingModal;

