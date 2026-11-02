import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../services/api';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [demoToken, setDemoToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data?.success) {
        setSubmitted(true);
        if (res.data.demoResetToken) {
          setDemoToken(res.data.demoResetToken);
        }
        toast.success('Password reset instructions generated!');
      }
    } catch (err) {
      toast.error('Could not process request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div className="card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Reset Password</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
              Enter your registered email and we'll generate password recovery instructions.
            </p>

            {submitted ? (
              <div style={{ textAlign: 'center' }}>
                <CheckCircle2 size={48} color="var(--primary-green)" style={{ margin: '0 auto 16px' }} />
                <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                  If an account exists for {email}, instructions have been sent.
                </p>
                {demoToken && (
                  <div className="card-elevated" style={{ textAlign: 'left', padding: '12px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary-green)', fontWeight: 700 }}>
                      DEVELOPER TEST TOKEN (Local Dev Fallback):
                    </div>
                    <div style={{ fontSize: '0.75rem', wordBreak: 'break-all', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                      {demoToken}
                    </div>
                    <Link
                      to={`/reset-password?token=${demoToken}`}
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: '10px', display: 'inline-block' }}
                    >
                      Click Here to Reset Password
                    </Link>
                  </div>
                )}
                <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>
                  Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <ArrowLeft size={14} /> Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;

