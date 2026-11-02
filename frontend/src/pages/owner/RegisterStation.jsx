import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import LocationPicker from '../../components/map/LocationPicker';
import {
  Zap,
  MapPin,
  ShieldCheck,
  Upload,
  Calendar,
  Clock,
  Car,
  ChevronLeft,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterStation = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    street: '',
    area: '',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '',
    landmark: '',
    latitude: 17.4474,
    longitude: 78.3820,
    chargerBrand: 'Universal / OEM',
    chargerModel: '',
    chargerType: 'AC',
    connectorType: 'Type 2 AC',
    chargingCapacity: 7.4,
    price: 14,
    priceUnit: 'kWh',
    openTime: '06:00',
    closeTime: '23:00',
    operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    maximumCapacity: 1,
    supportedVehicles: ['4-Wheeler'],
    safetyDetails: 'Dedicated MCB, RCCB, and ground earthing pit installed.',
  });

  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleLocationChange = (coords) => {
    setFormData((prev) => ({
      ...prev,
      latitude: coords.lat,
      longitude: coords.lng,
    }));
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => {
      const exists = prev.operatingDays.includes(day);
      return {
        ...prev,
        operatingDays: exists
          ? prev.operatingDays.filter((d) => d !== day)
          : [...prev.operatingDays, day],
      };
    });
  };

  const handleVehicleToggle = (vehicle) => {
    setFormData((prev) => {
      const exists = prev.supportedVehicles.includes(vehicle);
      return {
        ...prev,
        supportedVehicles: exists
          ? prev.supportedVehicles.filter((v) => v !== vehicle)
          : [...prev.supportedVehicles, vehicle],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.street || !formData.area) {
      toast.error('Please complete all required fields.');
      return;
    }
    if (formData.operatingDays.length === 0) {
      toast.error('Please select at least one operating day.');
      return;
    }

    setSubmitting(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('name', formData.name);
      uploadFormData.append('description', formData.description);
      uploadFormData.append(
        'address',
        JSON.stringify({
          full: `${formData.street}, ${formData.area}, ${formData.city}, ${formData.state} ${formData.pincode}`,
          street: formData.street,
          area: formData.area,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          landmark: formData.landmark,
        })
      );
      uploadFormData.append('latitude', formData.latitude);
      uploadFormData.append('longitude', formData.longitude);
      uploadFormData.append('chargerBrand', formData.chargerBrand);
      uploadFormData.append('chargerModel', formData.chargerModel);
      uploadFormData.append('chargerType', formData.chargerType);
      uploadFormData.append('connectorType', formData.connectorType);
      uploadFormData.append('chargingCapacity', formData.chargingCapacity);
      uploadFormData.append('price', formData.price);
      uploadFormData.append('priceUnit', formData.priceUnit);
      uploadFormData.append(
        'operatingHours',
        JSON.stringify({
          open: formData.openTime,
          close: formData.closeTime,
          days: formData.operatingDays,
        })
      );
      uploadFormData.append('maximumCapacity', formData.maximumCapacity);
      formData.supportedVehicles.forEach((v) => uploadFormData.append('supportedVehicles', v));
      uploadFormData.append('safetyDetails', formData.safetyDetails);

      if (selectedPhotos.length > 0) {
        Array.from(selectedPhotos).forEach((file) => {
          uploadFormData.append('photos', file);
        });
      }

      const res = await api.post('/owner/stations', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        toast.success('Charging station registered! Pending admin verification.');
        navigate('/owner/stations');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register station.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto' }}>
      <Link
        to="/owner/stations"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          marginBottom: '16px',
        }}
      >
        <ChevronLeft size={16} /> Back to Stations
      </Link>

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          Register New Charging Station
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Provide station specifications and pinpoint its exact location on the interactive map
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Section 1: Basic & Location Info */}
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="var(--primary-green)" /> 1. Station Name & Pinpoint Location
            </h3>

            <div className="form-group">
              <label className="form-label">Station Listing Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Telecom Nagar Solar Fast Point"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Station Description</label>
              <textarea
                className="form-textarea"
                placeholder="Describe your charging setup, bay accessibility, entry gate instructions..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Interactive GPS Location Picker */}
            <div className="form-group">
              <label className="form-label">
                Click on the map or drag the green pin to your exact charging socket location:
              </label>
              <LocationPicker
                initialLat={formData.latitude}
                initialLng={formData.longitude}
                onLocationChange={handleLocationChange}
              />
            </div>

            {/* Address fields */}
            <div className="form-group">
              <label className="form-label">Full Street / Building / House Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="Plot 42, Telecom Nagar, Gachibowli"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                required
              />
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Neighborhood / Area</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Gachibowli"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="500032"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Landmark / Gate Directions</label>
              <input
                type="text"
                className="form-input"
                placeholder="Near DLF Cyber City Gate 2"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              />
            </div>
          </div>

          {/* Section 2: Technical Specifications & Pricing */}
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} color="var(--primary-green)" /> 2. Technical Specifications & Pricing
            </h3>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Charging Type</label>
                <select
                  className="form-select"
                  value={formData.chargerType}
                  onChange={(e) => setFormData({ ...formData, chargerType: e.target.value })}
                >
                  <option value="AC">Standard AC Charging</option>
                  <option value="DC">High-Speed DC Fast Charging</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Connector Standard</label>
                <select
                  className="form-select"
                  value={formData.connectorType}
                  onChange={(e) => setFormData({ ...formData, connectorType: e.target.value })}
                >
                  <option value="Type 2 AC">Type 2 AC</option>
                  <option value="CCS 2 DC">CCS 2 DC</option>
                  <option value="CHAdeMO DC">CHAdeMO DC</option>
                  <option value="15A 3-Pin Socket">15A 3-Pin Socket</option>
                  <option value="Bharat AC001">Bharat AC001</option>
                  <option value="GB/T DC">GB/T DC</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Power Output Capacity (kW)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="350"
                  className="form-input"
                  value={formData.chargingCapacity}
                  onChange={(e) => setFormData({ ...formData, chargingCapacity: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Price per Unit (₹)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  className="form-input"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price Basis</label>
                <select
                  className="form-select"
                  value={formData.priceUnit}
                  onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value })}
                >
                  <option value="kWh">Per kWh (Recommended)</option>
                  <option value="hour">Per Hour</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Simultaneous Vehicles Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="form-input"
                  value={formData.maximumCapacity}
                  onChange={(e) => setFormData({ ...formData, maximumCapacity: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Charger Brand (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. ABB, Delta, Schneider, Tata Power"
                  value={formData.chargerBrand}
                  onChange={(e) => setFormData({ ...formData, chargerBrand: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Model Name / Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Terra AC 22kW"
                  value={formData.chargerModel}
                  onChange={(e) => setFormData({ ...formData, chargerModel: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Operating Schedule & Days */}
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="var(--primary-green)" /> 3. Operating Hours & Schedule
            </h3>

            <div className="grid-2" style={{ marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Opening Time (HH:mm)</label>
                <input
                  type="time"
                  className="form-input"
                  value={formData.openTime}
                  onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Closing Time (HH:mm)</label>
                <input
                  type="time"
                  className="form-input"
                  value={formData.closeTime}
                  onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Operating Days of the Week</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                  const isChecked = formData.operatingDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        backgroundColor: isChecked ? 'var(--primary-green)' : 'var(--bg-elevated)',
                        color: isChecked ? '#090B0A' : 'var(--text-muted)',
                        border: isChecked ? '1px solid var(--primary-green)' : '1px solid var(--border-subtle)',
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Supported Vehicle Classes</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['4-Wheeler', '2-Wheeler', '3-Wheeler'].map((veh) => {
                  const isChecked = formData.supportedVehicles.includes(veh);
                  return (
                    <button
                      key={veh}
                      type="button"
                      onClick={() => handleVehicleToggle(veh)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        backgroundColor: isChecked ? 'var(--primary-green)' : 'var(--bg-elevated)',
                        color: isChecked ? '#090B0A' : 'var(--text-muted)',
                        border: isChecked ? '1px solid var(--primary-green)' : '1px solid var(--border-subtle)',
                      }}
                    >
                      {veh}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 4: Safety & Photos */}
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="var(--primary-green)" /> 4. Safety Guarantee & Photos
            </h3>

            <div className="form-group">
              <label className="form-label">Safety Details / Electrical Protection</label>
              <input
                type="text"
                className="form-input"
                value={formData.safetyDetails}
                onChange={(e) => setFormData({ ...formData, safetyDetails: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Upload Charger & Bay Photos (Max 5)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                className="form-input"
                onChange={(e) => setSelectedPhotos(e.target.files)}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '1.05rem', marginTop: '16px' }}
            >
              {submitting ? 'Submitting for Admin Verification...' : 'Submit Charging Station for Listing'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterStation;

