import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Clock, AlertTriangle, CheckCircle, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const AvailabilityCalendar = () => {
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState('');
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState({
    slotDurationMinutes: 60,
    bufferTimeMinutes: 15,
    openTime: '06:00',
    closeTime: '23:00',
    blockedDateInput: '',
    blockedDates: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      try {
        const res = await api.get('/owner/stations');
        if (res.data?.success && res.data.data.length > 0) {
          setStations(res.data.data);
          const first = res.data.data[0];
          setSelectedStationId(first._id);
          setSettings({
            slotDurationMinutes: first.availabilitySettings?.slotDurationMinutes || 60,
            bufferTimeMinutes: first.availabilitySettings?.bufferTimeMinutes || 15,
            openTime: first.operatingHours?.open || '06:00',
            closeTime: first.operatingHours?.close || '23:00',
            blockedDateInput: '',
            blockedDates: first.availabilitySettings?.blockedDates || [],
          });
        }
      } catch (err) {
        toast.error('Failed to load stations.');
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  const handleStationChange = (id) => {
    setSelectedStationId(id);
    const st = stations.find((s) => s._id === id);
    if (st) {
      setSettings({
        slotDurationMinutes: st.availabilitySettings?.slotDurationMinutes || 60,
        bufferTimeMinutes: st.availabilitySettings?.bufferTimeMinutes || 15,
        openTime: st.operatingHours?.open || '06:00',
        closeTime: st.operatingHours?.close || '23:00',
        blockedDateInput: '',
        blockedDates: st.availabilitySettings?.blockedDates || [],
      });
    }
  };

  const handleAddBlockedDate = () => {
    if (!settings.blockedDateInput) return;
    if (settings.blockedDates.includes(settings.blockedDateInput)) {
      toast.error('Date is already blocked.');
      return;
    }
    setSettings((prev) => ({
      ...prev,
      blockedDates: [...prev.blockedDates, prev.blockedDateInput],
      blockedDateInput: '',
    }));
  };

  const handleRemoveBlockedDate = (dateStr) => {
    setSettings((prev) => ({
      ...prev,
      blockedDates: prev.blockedDates.filter((d) => d !== dateStr),
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch(`/owner/stations/${selectedStationId}`, {
        operatingHours: {
          open: settings.openTime,
          close: settings.closeTime,
        },
        availabilitySettings: {
          slotDurationMinutes: Number(settings.slotDurationMinutes),
          bufferTimeMinutes: Number(settings.bufferTimeMinutes),
          blockedDates: settings.blockedDates,
        },
      });

      if (res.data?.success) {
        toast.success('Calendar & slot settings saved! Live availability updated.');
      }
    } catch (err) {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '840px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          Availability Calendar & Slot Slicing
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Configure operating hours, bookable slot durations, buffer intervals, and block vacation dates
        </p>
      </div>

      {stations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Register a charging station first to configure availability.</p>
        </div>
      ) : (
        <form onSubmit={handleSaveSettings}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Station Selector */}
            <div className="card" style={{ padding: '24px' }}>
              <label className="form-label">Select Charging Station to Configure</label>
              <select
                className="form-select"
                style={{ width: '100%' }}
                value={selectedStationId}
                onChange={(e) => handleStationChange(e.target.value)}
              >
                {stations.map((st) => (
                  <option key={st._id} value={st._id}>
                    {st.name} ({st.chargingCapacity} kW • {st.connectorType})
                  </option>
                ))}
              </select>
            </div>

            {/* Operating Times & Slot Durations */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>
                Slot Generation Rules
              </h3>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Default Slot Duration</label>
                  <select
                    className="form-select"
                    value={settings.slotDurationMinutes}
                    onChange={(e) => setSettings({ ...settings, slotDurationMinutes: e.target.value })}
                  >
                    <option value="30">30 Minutes</option>
                    <option value="60">60 Minutes (Standard)</option>
                    <option value="90">90 Minutes</option>
                    <option value="120">120 Minutes (2 Hours)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Buffer Time Between Bookings</label>
                  <select
                    className="form-select"
                    value={settings.bufferTimeMinutes}
                    onChange={(e) => setSettings({ ...settings, bufferTimeMinutes: e.target.value })}
                  >
                    <option value="0">0 Minutes (Immediate Turnover)</option>
                    <option value="10">10 Minutes</option>
                    <option value="15">15 Minutes (Recommended)</option>
                    <option value="30">30 Minutes</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Opening Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={settings.openTime}
                    onChange={(e) => setSettings({ ...settings, openTime: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Closing Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={settings.closeTime}
                    onChange={(e) => setSettings({ ...settings, closeTime: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Blocked Dates */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
                Block Specific Dates (Holidays / Maintenance)
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Blocked dates are marked unbookable and won't generate slots for drivers.
              </p>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <input
                  type="date"
                  className="form-input"
                  style={{ width: '200px' }}
                  value={settings.blockedDateInput}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSettings({ ...settings, blockedDateInput: e.target.value })}
                />
                <button type="button" onClick={handleAddBlockedDate} className="btn btn-secondary btn-sm">
                  Block Date
                </button>
              </div>

              {settings.blockedDates.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {settings.blockedDates.map((dateStr) => (
                    <div
                      key={dateStr}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--error-dim)',
                        border: '1px solid rgba(255, 114, 114, 0.3)',
                        color: 'var(--error)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      <span>{dateStr}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBlockedDate(dateStr)}
                        style={{ color: 'var(--error)', fontWeight: 800 }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '14px' }}>
              <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Availability Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AvailabilityCalendar;

