import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../context/AuthContext';
import { Zap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await login(email, password);
      const role = data.user.role;
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'OWNER') navigate('/owner');
      else navigate('/user');
    } catch (err) {
      // Error handled in auth context toast
    } finally {
      setSubmitting(false);
    }
  };

  // Quick 1-Click Demo Login fill helpers
  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    toast.success(`Demo credentials populated for ${demoEmail}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          background: 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(57, 242, 138, 0.08), transparent 70%)',
        }}
      >
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-green)',
                color: '#090B0A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 0 24px var(--primary-green-glow)',
              }}
            >
              <Zap size={28} fill="#090B0A" />
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
              Welcome to EV Hub
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Sign in to manage your charging slots or host infrastructure
            </p>
          </div>

          {/* Quick Demo Login Preset Buttons */}
          <div
            className="card-elevated"
            style={{
              padding: '16px',
              marginBottom: '24px',
              border: '1px dashed rgba(57, 242, 138, 0.4)',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-green)', marginBottom: '8px', letterSpacing: '0.5px' }}>
              ⚡ 1-CLICK DEMO TEST ACCOUNTS:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleDemoFill('admin@evhub.com', 'Admin@12345')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '8px 4px', fontWeight: 600 }}
              >
                👑 Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('rajesh.host@evhub.com', 'Password@123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '8px 4px', fontWeight: 600 }}
              >
                🏠 Host / Owner
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('aditya.user@evhub.com', 'Password@123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '8px 4px', fontWeight: 600 }}
              >
                🚗 EV Driver
              </button>
            </div>
            <div style={{ marginTop: '8px', fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center' }}>
              Click any button above to auto-fill verified test credentials
            </div>
          </div>

          {/* Login Form Card */}
          <div className="card" style={{ padding: '32px' }}>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="email"
                    className="form-input"
                    style={{ width: '100%', paddingLeft: '40px' }}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Password</label>
                  <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--primary-green)' }}>
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="password"
                    className="form-input"
                    style={{ width: '100%', paddingLeft: '40px' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: '8px' }}
              >
                {submitting ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div
              style={{
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid var(--border-subtle)',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
              }}
            >
              Don't have an account yet?{' '}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                <Link to="/register" style={{ color: 'var(--primary-green)', fontWeight: 600 }}>
                  Driver Signup
                </Link>
                <span>•</span>
                <Link to="/register-owner" style={{ color: 'var(--secondary-mint)', fontWeight: 600 }}>
                  Become a Host
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginPage;

