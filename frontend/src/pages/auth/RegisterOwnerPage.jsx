import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../context/AuthContext';
import { Zap, Building, ShieldCheck, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterOwnerPage = () => {
  const { registerOwner } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    street: '',
    area: '',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '',
    landmark: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
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
      await registerOwner({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: {
          street: formData.street,
          area: formData.area,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          landmark: formData.landmark,
        },
        bankDetails: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          upiId: formData.upiId,
        },
      });
      navigate('/owner');
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
        <div style={{ width: '100%', maxWidth: '640px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--secondary-mint)',
                color: '#090B0A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
              }}
            >
              <Building size={24} color="#090B0A" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
              Become a Charging Station Host
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Monetize your residential or commercial EV charging points with verified payouts
            </p>
          </div>

          <div className="card" style={{ padding: '36px' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-green)', letterSpacing: '0.5px', marginBottom: '14px' }}>
                1. PERSONAL & ACCOUNT CREDENTIALS
              </div>

              <div className="form-group">
                <label className="form-label">Full Host Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g. Rajesh Kumar"
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
                    placeholder="rajesh@example.com"
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
                    placeholder="+91 98765 11001"
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

              {/* Residential Location */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', marginTop: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-green)', letterSpacing: '0.5px' }}>
                  2. RESIDENTIAL ADDRESS (CONFIDENTIAL UNTIL CONFIRMED BOOKING)
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Street / House / Villa Address</label>
                <input
                  type="text"
                  name="street"
                  className="form-input"
                  placeholder="Plot 42, Telecom Nagar, Gachibowli"
                  value={formData.street}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Neighborhood / Area</label>
                  <input
                    type="text"
                    name="area"
                    className="form-input"
                    placeholder="Gachibowli"
                    value={formData.area}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    className="form-input"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    className="form-input"
                    placeholder="500032"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Landmark</label>
                  <input
                    type="text"
                    name="landmark"
                    className="form-input"
                    placeholder="Near DLF Gate 2"
                    value={formData.landmark}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Payout Details */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', marginTop: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-green)', letterSpacing: '0.5px' }}>
                  3. PAYOUT REFERENCE (FOR RECEIVING DRIVER PAYMENTS)
                </span>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    className="form-input"
                    placeholder="e.g. HDFC Bank"
                    value={formData.bankName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">UPI ID (Optional)</label>
                  <input
                    type="text"
                    name="upiId"
                    className="form-input"
                    placeholder="username@okaxis"
                    value={formData.upiId}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '12px' }}
              >
                {submitting ? 'Submitting Registration...' : 'Register as Host & Open Portal'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Already registered as a host?{' '}
              <Link to="/login" style={{ color: 'var(--primary-green)', fontWeight: 600 }}>
                Sign in to Host Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterOwnerPage;

