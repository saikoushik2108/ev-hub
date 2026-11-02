import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import StationMap from '../../components/map/StationMap';
import BookingModal from '../../components/booking/BookingModal';
import RatingStars from '../../components/common/RatingStars';
import Badge from '../../components/common/Badge';
import api from '../../services/api';
import {
  Search,
  Filter,
  MapPin,
  Zap,
  SlidersHorizontal,
  Calendar,
  Grid,
  Map as MapIcon,
  Navigation,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ExplorePage = () => {
  const [searchParams] = useSearchParams();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'list'

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [distanceKm, setDistanceKm] = useState('25');
  const [connectorType, setConnectorType] = useState(searchParams.get('connectorType') || '');
  const [chargerType, setChargerType] = useState(searchParams.get('chargerType') || '');
  const [minCapacity, setMinCapacity] = useState('');
  const [maxPrice, setMaxPrice] = useState('50');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showingFallbackNotice, setShowingFallbackNotice] = useState(false);

  // Map Coordinates (defaults to Hyderabad IT Corridor)
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([78.3820, 17.4474]);

  // Request browser geolocation on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = [pos.coords.longitude, pos.coords.latitude];
          setUserLocation(loc);
          setMapCenter(loc);
        },
        (err) => {
          // Defaults to Hyderabad
        }
      );
    }
  }, []);

  // Fetch stations matching filters
  const fetchNearbyStations = async () => {
    setLoading(true);
    try {
      let list = [];
      const res = await api.get('/stations/nearby', {
        params: {
          lng: mapCenter[0],
          lat: mapCenter[1],
          maxDistance: distanceKm,
          date: selectedDate,
          connectorType: connectorType || undefined,
          chargerType: chargerType || undefined,
          minCapacity: minCapacity || undefined,
          maxPrice: maxPrice || undefined,
        },
      });

      if (res.data?.success && res.data.data?.length > 0) {
        list = res.data.data;
        setShowingFallbackNotice(false);
      } else {
        // If 0 stations found in immediate radius, fallback to all stations in city
        const fallbackRes = await api.get('/stations', {
          params: {
            q: searchQuery || undefined,
            connectorType: connectorType || undefined,
            chargerType: chargerType || undefined,
            minCapacity: minCapacity || undefined,
            maxPrice: maxPrice || undefined,
          },
        });
        if (fallbackRes.data?.success) {
          list = fallbackRes.data.data || [];
          setShowingFallbackNotice(true);
        }
      }

      setStations(list);
    } catch (err) {
      console.warn('[Explore] Failed nearby query, falling back to all stations:', err.message);
      try {
        const fallback = await api.get('/stations');
        if (fallback.data?.success) {
          setStations(fallback.data.data || []);
          setShowingFallbackNotice(true);
        }
      } catch (fallbackErr) {
        toast.error('Unable to connect to EV Hub server. Please check your backend connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyStations();
  }, [mapCenter, distanceKm, connectorType, chargerType, minCapacity, maxPrice, selectedDate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      <Navbar />

      {/* Top Filter Bar */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '14px 24px',
          position: 'sticky',
          top: '61px',
          zIndex: 400,
        }}
      >
        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative', width: '300px' }}>
            <Search
              size={16}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search station or area..."
              className="form-input"
              style={{ width: '100%', paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchNearbyStations();
              }}
            />
          </div>

          {/* Quick Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
            {/* Radius select */}
            <select
              className="form-select"
              style={{ height: '38px', padding: '0 10px', fontSize: '0.825rem' }}
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
            >
              <option value="5">Within 5 km</option>
              <option value="10">Within 10 km</option>
              <option value="25">Within 25 km (Default)</option>
              <option value="50">Within 50 km</option>
              <option value="100">Within 100 km</option>
              <option value="all">All Stations</option>
            </select>

            {/* AC / DC */}
            <select
              className="form-select"
              style={{ height: '38px', padding: '0 10px', fontSize: '0.825rem' }}
              value={chargerType}
              onChange={(e) => setChargerType(e.target.value)}
            >
              <option value="">All Types (AC/DC)</option>
              <option value="DC">Fast DC Charging</option>
              <option value="AC">Standard AC Charging</option>
            </select>

            {/* Connector Type */}
            <select
              className="form-select"
              style={{ height: '38px', padding: '0 10px', fontSize: '0.825rem' }}
              value={connectorType}
              onChange={(e) => setConnectorType(e.target.value)}
            >
              <option value="">All Connectors</option>
              <option value="CCS 2 DC">CCS 2 DC</option>
              <option value="Type 2 AC">Type 2 AC</option>
              <option value="CHAdeMO DC">CHAdeMO DC</option>
              <option value="15A 3-Pin Socket">15A 3-Pin Socket</option>
            </select>

            {/* Date Selector */}
            <input
              type="date"
              className="form-input"
              style={{ height: '38px', padding: '0 10px', fontSize: '0.825rem', width: '135px' }}
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Map / List View Switcher */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
            <button
              onClick={() => setViewMode('map')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: viewMode === 'map' ? 'var(--primary-green)' : 'transparent',
                color: viewMode === 'map' ? '#090B0A' : 'var(--text-muted)',
              }}
            >
              <MapIcon size={14} /> Map
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: viewMode === 'list' ? 'var(--primary-green)' : 'transparent',
                color: viewMode === 'list' ? '#090B0A' : 'var(--text-muted)',
              }}
            >
              <Grid size={14} /> List ({stations.length})
            </button>
          </div>
        </div>
      </div>

      {/* Fallback Regional Notice Banner */}
      {showingFallbackNotice && (
        <div
          style={{
            backgroundColor: 'rgba(57, 242, 138, 0.08)',
            borderBottom: '1px solid rgba(57, 242, 138, 0.25)',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            color: 'var(--primary-green)',
            zIndex: 390,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} />
            <span>
              Showing all <strong>{stations.length} verified charging stations</strong> in the Hyderabad tech corridor.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setMapCenter([78.3820, 17.4474]);
            }}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '4px 12px' }}
          >
            📍 Pan Map to Stations
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
        {/* Map View */}
        {viewMode === 'map' ? (
          <div style={{ width: '100%', height: 'calc(100vh - 128px)', position: 'relative' }}>
            <StationMap
              stations={stations}
              selectedStation={selectedStation}
              onSelectStation={(st) => setSelectedStation(st)}
              userLocation={userLocation}
              center={mapCenter}
              zoom={12}
            />

            {/* Map Legend Floating Box */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                backgroundColor: 'rgba(9, 11, 10, 0.92)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                zIndex: 10,
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>
                Availability for {new Date(selectedDate).toLocaleDateString()}:
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#39F28A' }} />
                <span>Available Slots</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F5B942' }} />
                <span>Limited Availability</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF7272' }} />
                <span>Fully Booked</span>
              </div>
            </div>

            {/* Selected Station Slide-Over Preview Card */}
            {selectedStation && (
              <div
                className="card"
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '24px',
                  width: '380px',
                  maxHeight: '480px',
                  overflowY: 'auto',
                  padding: '18px',
                  zIndex: 20,
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--primary-green)',
                }}
              >
                <button
                  onClick={() => setSelectedStation(null)}
                  style={{ position: 'absolute', top: '14px', right: '14px', color: 'var(--text-muted)' }}
                >
                  <X size={18} />
                </button>

                <img
                  src={
                    selectedStation.photos?.[0] ||
                    'https://images.unsplash.com/photo-1558441719-8b449c6ff673?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={selectedStation.name}
                  style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '14px' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {selectedStation.name}
                    </h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {selectedStation.address?.masked || `${selectedStation.address?.area || ''}, ${selectedStation.address?.city}`}
                    </div>
                  </div>
                  <Badge status={selectedStation.availabilityStatus} text={`${selectedStation.availableSlotsCount} slots`} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '12px 0', fontSize: '0.85rem' }}>
                  <RatingStars rating={selectedStation.rating || 5} count={selectedStation.totalReviews || 0} />
                  <span style={{ color: 'var(--text-dim)' }}>•</span>
                  <span style={{ color: 'var(--primary-green)', fontWeight: 600 }}>
                    {selectedStation.distanceKm} km away
                  </span>
                </div>

                <div
                  className="card-elevated"
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Specification</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      {selectedStation.chargingCapacity} kW {selectedStation.chargerType} • {selectedStation.connectorType}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-green)' }}>
                      ₹{selectedStation.price}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      per {selectedStation.priceUnit || 'kWh'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setBookingModalOpen(true)}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    <Zap size={16} fill="#090B0A" /> Book Slot
                  </button>
                  <a
                    href={`/station/${selectedStation._id}`}
                    className="btn btn-secondary"
                    style={{ padding: '0 12px' }}
                    title="View details"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* List View */
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {stations.length} Charging Points Available Near You
              </h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Showing verified hosts with active subscriptions
              </span>
            </div>

            {loading ? (
              <div className="grid-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="skeleton" style={{ height: '320px', borderRadius: 'var(--radius-lg)' }} />
                ))}
              </div>
            ) : stations.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                <Zap size={40} color="var(--primary-green)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
                  No charging stations found matching filters
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Try expanding the distance radius or selecting different connector types.
                </p>
                <button
                  onClick={() => {
                    setDistanceKm('50');
                    setConnectorType('');
                    setChargerType('');
                  }}
                  className="btn btn-outline"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid-3">
                {stations.map((station) => (
                  <div key={station._id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={
                          station.photos?.[0] ||
                          'https://images.unsplash.com/photo-1558441719-8b449c6ff673?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={station.name}
                        style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                        <Badge status={station.availabilityStatus} text={`${station.availableSlotsCount} slots`} />
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '12px',
                          left: '12px',
                          backgroundColor: 'rgba(9, 11, 10, 0.85)',
                          backdropFilter: 'blur(4px)',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--primary-green)',
                        }}
                      >
                        {station.distanceKm} km away
                      </div>
                    </div>

                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>
                          {station.name}
                        </h4>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                          {station.address?.masked || `${station.address?.area || ''}, ${station.address?.city}`}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                          <span style={{ fontSize: '0.825rem', color: 'var(--text-main)', fontWeight: 600 }}>
                            {station.chargingCapacity} kW {station.chargerType}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {station.connectorType}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                          <RatingStars rating={station.rating || 5} count={station.totalReviews || 0} />
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-green)' }}>
                            ₹{station.price}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>per {station.priceUnit || 'kWh'}</div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedStation(station);
                            setBookingModalOpen(true);
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          <Zap size={14} fill="#090B0A" /> Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedStation && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          station={selectedStation}
          onBookingSuccess={() => {
            fetchNearbyStations();
          }}
        />
      )}
    </div>
  );
};

export default ExplorePage;

