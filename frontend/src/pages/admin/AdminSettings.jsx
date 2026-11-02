import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Settings, Save, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    commissionPercentage: 10,
    taxPercentage: 5,
    holdDurationMinutes: 5,
    cancellationFreeHours: 2,
    platformName: 'EV Hub',
    supportEmail: 'support@evhub.com',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        if (res.data?.success) {
          setSettings(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load settings.');
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/admin/settings', settings);
      if (res.data?.success) {
        toast.success('Platform settings updated successfully!');
      }
    } catch (err) {
      toast.error('Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          Platform Configuration & Policies
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Configure commission take-rates, cancellation windows, concurrency hold timeouts, and tax rates
        </p>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Platform Take Commission (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                className="form-input"
                value={settings.commissionPercentage}
                onChange={(e) => setSettings({ ...settings, commissionPercentage: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">GST / Tax Percentage (%)</label>
              <input
                type="number"
                min="0"
                max="30"
                className="form-input"
                value={settings.taxPercentage}
                onChange={(e) => setSettings({ ...settings, taxPercentage: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Concurrency Slot Hold Timeout (Minutes)</label>
              <input
                type="number"
                min="1"
                max="30"
                className="form-input"
                value={settings.holdDurationMinutes}
                onChange={(e) => setSettings({ ...settings, holdDurationMinutes: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">100% Refund Cancellation Free Window (Hours)</label>
              <input
                type="number"
                min="0"
                max="48"
                className="form-input"
                value={settings.cancellationFreeHours}
                onChange={(e) => setSettings({ ...settings, cancellationFreeHours: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Platform Display Name</label>
              <input
                type="text"
                className="form-input"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Operations Support Email</label>
              <input
                type="email"
                className="form-input"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '14px', marginTop: '16px' }}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Platform Policies'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;

