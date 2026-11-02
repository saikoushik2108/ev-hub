import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import BookingModal from '../../components/booking/BookingModal';
import RatingStars from '../../components/common/RatingStars';
import Badge from '../../components/common/Badge';
import api from '../../services/api';
import {
  Zap,
  MapPin,
  ShieldCheck,
  Clock,
  Calendar,
  CheckCircle,
  Share2,
  Heart,
  ChevronLeft,
  User,
  Star,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

const StationDetailsPage = () => {
  const { id } = useParams();
  const [station, setStation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [unlockedFullAddress, setUnlockedFullAddress] = useState(false);

  useEffect(() => {
    const fetchStation = async () => {
      setLoading(true);
      try {
        const [stationRes, reviewsRes] = await Promise.all([
          api.get(`/stations/${id}`),
          api.get(`/reviews/station/${id}`),
        ]);

        if (stationRes.data?.success) {
          setStation(stationRes.data.data);
          setUnlockedFullAddress(stationRes.data.unlockedFullAddress);
        }
        if (reviewsRes.data?.success) {
          setReviews(reviewsRes.data.data);
        }
      } catch (err) {
        toast.error('Failed to load station details.');
      } finally {
        setLoading(false);
      }
    };

    fetchStation();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ maxWidth: '1120px', margin: '40px auto', width: '100%', padding: '0 24px' }}>
          <div className="skeleton" style={{ height: '360px', marginBottom: '24px' }} />
          <div className="skeleton" style={{ height: '40px', width: '60%', marginBottom: '16px' }} />
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <h2>Charging Station Not Found</h2>
          <Link to="/explore" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Back to Map
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ maxWidth: '1180px', margin: '32px auto', width: '100%', padding: '0 24px', flex: 1 }}>
        <Link
          to="/explore"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            marginBottom: '20px',
          }}
        >
          <ChevronLeft size={16} /> Back to Stations
        </Link>

        {/* Hero Photo Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', height: '360px', marginBottom: '28px' }}>
          <img
            src={station.photos?.[0] || 'https://images.unsplash.com/photo-1558441719-8b449c6ff673?auto=format&fit=crop&w=1200&q=80'}
            alt={station.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
            <img
              src={station.photos?.[1] || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80'}
              alt={station.name}
              style={{ width: '100%', height: 'calc(50% - 6px)', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
            />
            <img
              src={station.photos?.[2] || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80'}
              alt={station.name}
              style={{ width: '100%', height: 'calc(50% - 6px)', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
            />
          </div>
        </div>

        {/* Content Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          {/* Main Details */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                  {station.name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <MapPin size={16} color="var(--primary-green)" />
                  <span>
                    {unlockedFullAddress
                      ? station.address?.full || `${station.address?.street}, ${station.address?.area}, ${station.address?.city}`
                      : station.address?.masked || `${station.address?.area || ''}, ${station.address?.city}`}
                  </span>
                  {!unlockedFullAddress && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Lock size={12} /> (Exact house number unlocked on booking)
                    </span>
                  )}
                </div>
              </div>

              <RatingStars rating={station.rating || 5} count={station.totalReviews || 0} size={18} />
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: '20px 0' }}>
              {station.description || 'Verified private EV charging point in a safe neighborhood.'}
            </p>

            {/* Hardware Specs Grid */}
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
              Technical Specifications
            </h3>
            <div className="grid-2" style={{ marginBottom: '24px' }}>
              <div className="card-elevated" style={{ padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Charging Type</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-green)', marginTop: '2px' }}>
                  {station.chargingCapacity} kW {station.chargerType} Fast Charge
                </div>
              </div>
              <div className="card-elevated" style={{ padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Connector Standard</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2px' }}>
                  {station.connectorType}
                </div>
              </div>
              <div className="card-elevated" style={{ padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Charger Brand & Model</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2px' }}>
                  {station.chargerBrand || 'Commercial Grade'} {station.chargerModel}
                </div>
              </div>
              <div className="card-elevated" style={{ padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Operating Hours</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2px' }}>
                  {station.operatingHours?.open} - {station.operatingHours?.close}
                </div>
              </div>
            </div>

            {/* Amenities */}
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '14px' }}>
              Site Amenities & Features
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '28px' }}>
              {station.amenities?.map((amenity, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg-elevated)',
                    fontSize: '0.85rem',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <CheckCircle size={14} color="var(--primary-green)" /> {amenity}
                </div>
              ))}
            </div>

            {/* Safety Installation Details */}
            {station.safetyDetails && (
              <div
                className="card-elevated"
                style={{
                  padding: '16px 20px',
                  marginBottom: '32px',
                  borderLeft: '4px solid var(--primary-green)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '4px' }}>
                  <ShieldCheck size={18} color="var(--primary-green)" /> Electrical Safety Guarantee
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  {station.safetyDetails}
                </p>
              </div>
            )}

            {/* Customer Reviews Section */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  Driver Reviews ({reviews.length})
                </h3>
              </div>

              {reviews.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No customer reviews yet. Be the first driver to charge here and leave feedback!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {reviews.map((r) => (
                    <div key={r._id} className="card-elevated" style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--primary-green)',
                              color: '#090B0A',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {r.userId?.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{r.userId?.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                              {new Date(r.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <RatingStars rating={r.rating} />
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                        "{r.comment}"
                      </p>

                      {r.ownerReply?.comment && (
                        <div
                          style={{
                            marginTop: '10px',
                            padding: '10px 14px',
                            backgroundColor: 'rgba(57, 242, 138, 0.05)',
                            borderLeft: '2px solid var(--primary-green)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.8rem',
                          }}
                        >
                          <strong style={{ color: 'var(--primary-green)' }}>Host Response: </strong>
                          <span style={{ color: 'var(--text-muted)' }}>{r.ownerReply.comment}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sticky Booking CTA Card */}
          <div>
            <div
              className="card"
              style={{
                position: 'sticky',
                top: '90px',
                padding: '24px',
                border: '1px solid var(--primary-green)',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-green)' }}>
                    ₹{station.price}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    /{station.priceUnit || 'kWh'}
                  </span>
                </div>
                <Badge status="ACTIVE" text="Verified Host" />
              </div>

              {/* Host Profile Info */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-elevated)',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-green)',
                    color: '#090B0A',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {station.ownerId?.name?.[0]?.toUpperCase() || 'H'}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Hosted by {station.ownerId?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Residential Host</div>
                </div>
              </div>

              <button
                onClick={() => setBookingModalOpen(true)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1rem', marginBottom: '12px' }}
              >
                <Zap size={18} fill="#090B0A" /> Reserve Charging Slot
              </button>

              <div
                style={{
                  fontSize: '0.775rem',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  lineHeight: '1.4',
                }}
              >
                ⚡ 5-minute atomic reservation hold prevents double booking. 100% refund available up to 2 hours before session.
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        station={station}
      />
    </div>
  );
};

export default StationDetailsPage;

