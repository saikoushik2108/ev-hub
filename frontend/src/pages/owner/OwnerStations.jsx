import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import RatingStars from '../../components/common/RatingStars';
import {
  Zap,
  PlusCircle,
  Edit2,
  Trash2,
  Power,
  MapPin,
  Clock,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';

const OwnerStations = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStation, setEditingStation] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchStations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/owner/stations');
      if (res.data?.success) {
        setStations(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load host stations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleToggleActive = async (station) => {
    try {
      const res = await api.patch(`/owner/stations/${station._id}`, {
        isActive: !station.isActive,
      });
      if (res.data?.success) {
        toast.success(`Station ${station.isActive ? 'paused' : 'activated'}!`);
        fetchStations();
      }
    } catch (err) {
      toast.error('Failed to toggle status.');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await api.patch(`/owner/stations/${editingStation._id}`, {
        price: Number(editPrice),
        isActive: editIsActive,
      });
      if (res.data?.success) {
        toast.success('Station settings updated!');
        setEditingStation(null);
        fetchStations();
      }
    } catch (err) {
      toast.error('Failed to update station.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteStation = async (stationId) => {
    if (!window.confirm('Are you sure you want to delete this charging station?')) return;
    try {
      const res = await api.delete(`/owner/stations/${stationId}`);
      if (res.data?.success) {
        toast.success('Station removed.');
        fetchStations();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete station.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            My Charging Stations ({stations.length})
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage station specifications, pricing, operating schedules, and visibility
          </p>
        </div>

        <Link to="/owner/stations/new" className="btn btn-primary">
          <PlusCircle size={18} /> Add New Charging Station
        </Link>
      </div>

      {loading ? (
        <div className="grid-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : stations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <Zap size={48} color="var(--primary-green)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>
            No charging stations registered yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '480px', margin: '0 auto 24px' }}>
            Register your residential home charger or commercial EV socket to start earning 90% booking revenue.
          </p>
          <Link to="/owner/stations/new" className="btn btn-primary">
            Register Your First Charging Station
          </Link>
        </div>
      ) : (
        <div className="grid-3">
          {stations.map((st) => (
            <div
              key={st._id}
              className="card"
              style={{
                padding: '0',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: st.isActive ? '1px solid var(--border-subtle)' : '1px dashed rgba(255, 114, 114, 0.4)',
                opacity: st.isActive ? 1 : 0.8,
              }}
            >
              <div style={{ position: 'relative' }}>
                <img
                  src={
                    st.photos?.[0] ||
                    'https://images.unsplash.com/photo-1558441719-8b449c6ff673?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={st.name}
                  style={{ width: '100%', height: '170px', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                  <Badge status={st.approvalStatus} />
                  <Badge status={st.isActive ? 'ACTIVE' : 'PAUSED'} text={st.isActive ? 'Online' : 'Paused'} />
                </div>
              </div>

              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '4px' }}>{st.name}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    {st.address?.area}, {st.address?.city}
                  </div>

                  <div className="card-elevated" style={{ padding: '10px 14px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Specification:</span>
                      <strong>{st.chargingCapacity} kW {st.chargerType}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Connector:</span>
                      <strong>{st.connectorType}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Rate:</span>
                      <strong style={{ color: 'var(--primary-green)' }}>₹{st.price} / {st.priceUnit || 'kWh'}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <RatingStars rating={st.rating || 5} count={st.totalReviews || 0} size={14} />
                    <span>• {st.totalBookingsCount || 0} total bookings</span>
                  </div>
                </div>

                {/* Card Bottom Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', marginTop: '16px' }}>
                  <button
                    onClick={() => handleToggleActive(st)}
                    className={`btn btn-sm ${st.isActive ? 'btn-secondary' : 'btn-outline'}`}
                    style={{ fontSize: '0.75rem' }}
                  >
                    <Power size={13} /> {st.isActive ? 'Pause' : 'Activate'}
                  </button>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setEditingStation(st);
                        setEditPrice(st.price);
                        setEditIsActive(st.isActive);
                      }}
                      className="btn btn-secondary btn-sm"
                      title="Edit price & status"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStation(st._id)}
                      style={{ color: 'var(--error)', padding: '6px' }}
                      title="Delete station"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Station Modal */}
      {editingStation && (
        <Modal
          isOpen={!!editingStation}
          onClose={() => setEditingStation(null)}
          title={`Edit Settings: ${editingStation.name}`}
          maxWidth="460px"
        >
          <form onSubmit={handleSaveEdit}>
            <div className="form-group">
              <label className="form-label">Price per kWh or Hour (₹)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                className="form-input"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Station Operational Status</label>
              <select
                className="form-select"
                value={editIsActive ? 'active' : 'paused'}
                onChange={(e) => setEditIsActive(e.target.value === 'active')}
              >
                <option value="active">Active & Bookable</option>
                <option value="paused">Temporarily Paused (Not Bookable)</option>
              </select>
            </div>

            <button type="submit" disabled={savingEdit} className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
              {savingEdit ? 'Updating...' : 'Save Settings'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default OwnerStations;

