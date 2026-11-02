import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import BookingModal from '../../components/booking/BookingModal';
import RatingStars from '../../components/common/RatingStars';
import { Heart, Trash2, Zap, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const UserFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await api.get('/user/favorites');
      if (res.data?.success) {
        setFavorites(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load favorites.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (stationId) => {
    try {
      const res = await api.delete(`/user/favorites/${stationId}`);
      if (res.data?.success) {
        setFavorites((prev) => prev.filter((st) => st._id !== stationId));
        toast.success('Station removed from favorites.');
      }
    } catch (err) {
      toast.error('Failed to remove favorite.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          Saved Charging Stations
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Quick access to your preferred neighborhood charging points
        </p>
      </div>

      {loading ? (
        <div className="grid-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '260px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <Heart size={44} color="var(--primary-green)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
            No saved stations yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
            Save your favorite charging points on the map for one-click access.
          </p>
          <a href="/explore" className="btn btn-primary">
            Explore Stations
          </a>
        </div>
      ) : (
        <div className="grid-3">
          {favorites.map((station) => (
            <div key={station._id} className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <img
                src={
                  station.photos?.[0] ||
                  'https://images.unsplash.com/photo-1558441719-8b449c6ff673?auto=format&fit=crop&w=400&q=80'
                }
                alt={station.name}
                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
              />
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>{station.name}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {station.address?.area}, {station.address?.city}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-green)' }}>
                    {station.chargingCapacity} kW • {station.connectorType}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: '14px' }}>
                  <button
                    onClick={() => {
                      setSelectedStation(station);
                      setBookingModalOpen(true);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <Zap size={14} fill="#090B0A" /> Book Slot
                  </button>
                  <button
                    onClick={() => handleRemoveFavorite(station._id)}
                    style={{ color: 'var(--error)', padding: '6px' }}
                    title="Remove from favorites"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedStation && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          station={selectedStation}
        />
      )}
    </div>
  );
};

export default UserFavorites;

