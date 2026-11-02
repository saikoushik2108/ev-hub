import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { User, Car, Lock, Save, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { user, refreshMe } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    make: user?.vehicleDetails?.make || '',
    model: user?.vehicleDetails?.model || '',
    registrationNumber: user?.vehicleDetails?.registrationNumber || '',
    batteryCapacityKWh: user?.vehicleDetails?.batteryCapacityKWh || 40,
    preferredConnector: user?.vehicleDetails?.preferredConnector || 'Type 2 AC',
  });

  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', {
        name: profileData.name,
        phone: profileData.phone,
        vehicleDetails: {
          make: profileData.make,
          model: profileData.model,
          registrationNumber: profileData.registrationNumber,
          batteryCapacityKWh: Number(profileData.batteryCapacityKWh),
          preferredConnector: profileData.preferredConnector,
        },
      });
      if (res.data?.success) {
        toast.success('Profile updated successfully!');
        refreshMe();
      }
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (passData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setChangingPass(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });
      if (res.data?.success) {
        toast.success('Password updated successfully!');
        setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed.');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div style={{ maxWidth: '840px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          Profile & Vehicle Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Manage your personal contact info and EV hardware preferences
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Profile Card */}
        <div className="card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="var(--primary-green)" /> Personal Details
          </h3>

          <form onSubmit={handleProfileSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email (Read Only)</label>
                <input
                  type="email"
                  className="form-input"
                  value={user?.email || ''}
                  disabled
                  style={{ opacity: 0.6 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                className="form-input"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', marginTop: '10px', marginBottom: '18px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Car size={18} color="var(--primary-green)" /> Electric Vehicle Information
              </h4>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Vehicle Make</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Tata"
                  value={profileData.make}
                  onChange={(e) => setProfileData({ ...profileData, make: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle Model</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Nexon EV Empowered"
                  value={profileData.model}
                  onChange={(e) => setProfileData({ ...profileData, model: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Registration Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="TS 09 EA 4120"
                  value={profileData.registrationNumber}
                  onChange={(e) => setProfileData({ ...profileData, registrationNumber: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Battery Capacity (kWh)</label>
                <input
                  type="number"
                  className="form-input"
                  value={profileData.batteryCapacityKWh}
                  onChange={(e) => setProfileData({ ...profileData, batteryCapacityKWh: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Connector</label>
                <select
                  className="form-select"
                  value={profileData.preferredConnector}
                  onChange={(e) => setProfileData({ ...profileData, preferredConnector: e.target.value })}
                >
                  <option value="CCS 2 DC">CCS 2 DC</option>
                  <option value="Type 2 AC">Type 2 AC</option>
                  <option value="CHAdeMO DC">CHAdeMO DC</option>
                  <option value="15A 3-Pin Socket">15A 3-Pin Socket</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={savingProfile} className="btn btn-primary" style={{ marginTop: '12px' }}>
              <Save size={16} /> {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={20} color="var(--primary-green)" /> Change Password
          </h3>

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={passData.currentPassword}
                onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={passData.newPassword}
                  onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={passData.confirmPassword}
                  onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={changingPass} className="btn btn-secondary" style={{ marginTop: '12px' }}>
              {changingPass ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

