import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../context/AuthContext';
import { Zap, Mail, Lock, User, Phone, Car } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterUserPage = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    make: '',
    model: '',
    vehicleType: '4-Wheeler',
    preferredConnector: 'CCS 2 DC',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        vehicleDetails: {
          make: formData.make,
          model: formData.model,
          vehicleType: formData.vehicleType,
          preferredConnector: formData.preferredConnector,
        },
      });
      navigate('/user');
    } catch (err) {
      // Error handled in auth context toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-green)',
                color: '#090B0A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
              }}
            >
              <Zap size={24} fill="#090B0A" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
              Create EV Driver Account
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Discover, book and unlock residential charging slots in seconds
            </p>
          </div>

          <div className="card" style={{ padding: '32px' }}>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g. Aditya Varma"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Vehicle Info */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginTop: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-green)', letterSpacing: '0.5px' }}>
                  VEHICLE SPECIFICATIONS (OPTIONAL)
                </span>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Vehicle Make & Model</label>
                  <input
                    type="text"
                    name="model"
                    className="form-input"
                    placeholder="e.g. Tata Nexon EV"
                    value={formData.model}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Connector</label>
                  <select
                    name="preferredConnector"
                    className="form-select"
                    value={formData.preferredConnector}
                    onChange={handleChange}
                  >
                    <option value="CCS 2 DC">CCS 2 DC</option>
                    <option value="Type 2 AC">Type 2 AC</option>
                    <option value="CHAdeMO DC">CHAdeMO DC</option>
                    <option value="15A 3-Pin Socket">15A 3-Pin Socket</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: '12px' }}
              >
                {submitting ? 'Registering Account...' : 'Complete Registration'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: 'var(--primary-green)', fontWeight: 600 }}>
                Log in here
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterUserPage;

