import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { CheckCircle2, Zap, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const PricingPage = () => {
  const { user, isOwner, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Host earnings interactive calculator
  const [chargersCount, setChargersCount] = useState(1);
  const [sessionsPerDay, setSessionsPerDay] = useState(3);
  const [ratePerKWh, setRatePerKWh] = useState(15);
  const avgKWhPerSession = 20;

  // Monthly revenue calculation:
  // Gross = chargers * sessions/day * 30 * avgKWh * rate
  // Platform commission: 10%
  // Host net: 90%
  const monthlyGross = Math.round(chargersCount * sessionsPerDay * 30 * avgKWhPerSession * ratePerKWh);
  const hostEarning = Math.round(monthlyGross * 0.9);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <section style={{ padding: '80px 24px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-green-dim)',
              color: 'var(--primary-green)',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '16px',
            }}
          >
            HOST SUBSCRIPTION PLANS
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 800, marginBottom: '16px', letterSpacing: '-1px' }}>
            Predictable Pricing. Maximum Earnings.
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Keep 90% of all user charging revenue. Simple monthly plans with zero hidden hardware lock-ins.
          </p>
        </div>
      </section>

      {/* Plan Cards Grid */}
      <section style={{ maxWidth: '1240px', margin: '0 auto 80px', padding: '0 24px', width: '100%' }}>
        <div className="grid-3" style={{ alignItems: 'stretch' }}>
          {/* Basic */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '36px' }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '6px' }}>Basic Host</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
                For individual home owners with 1 charger.
              </p>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '24px' }}>
                ₹199<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/month</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', marginBottom: '32px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} color="var(--primary-green)" /> 1 Charging Point Listing</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} color="var(--primary-green)" /> Standard Availability Calendar</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} color="var(--primary-green)" /> Direct Host Directions After Booking</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} color="var(--primary-green)" /> Automated 90% Driver Payouts</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} color="var(--primary-green)" /> Community & Email Support</li>
              </ul>
            </div>
            <Link to={isAuthenticated ? '/owner/subscriptions' : '/register-owner'} className="btn btn-secondary" style={{ width: '100%' }}>
              Get Started
            </Link>
          </div>

          {/* Pro */}
          <div
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '36px',
              border: '2px solid var(--primary-green)',
              boxShadow: 'var(--shadow-glow)',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-14px',
                right: '24px',
                backgroundColor: 'var(--primary-green)',
                color: '#090B0A',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              POPULAR
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-green)', marginBottom: '6px' }}>
                <Sparkles size={16} /> <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>RECOMMENDED</span>
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '6px' }}>Pro Host</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
                For multi-charger homes and active community hosts.
              </p>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '24px' }}>
                ₹399<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/month</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', marginBottom: '32px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} color="var(--primary-green)" /> Up to 3 Charging Points</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} color="var(--primary-green)" /> Dynamic Hourly & Peak Pricing</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} color="var(--primary-green)" /> Priority Search Placement on Map</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} color="var(--primary-green)" /> Advanced Real-Time Revenue Analytics</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} color="var(--primary-green)" /> Priority Email & Ticket Support</li>
              </ul>
            </div>
            <Link to={isAuthenticated ? '/owner/subscriptions' : '/register-owner'} className="btn btn-primary" style={{ width: '100%' }}>
              Subscribe to Pro
            </Link>
          </div>

          {/* Business */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '36px' }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '6px' }}>Business Network</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
                Commercial complexes, gated societies, and fleets.
              </p>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '24px' }}>
                ₹799<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/month</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', marginBottom: '32px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} color="var(--primary-green)" /> Unlimited Charging Points</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} color="var(--primary-green)" /> Multi-connector Load Balancing</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} color="var(--primary-green)" /> Automated Settlement Payout Engine</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} color="var(--primary-green)" /> Detailed Utilization CSV Exports</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} color="var(--primary-green)" /> 24/7 Dedicated Account Manager</li>
              </ul>
            </div>
            <Link to={isAuthenticated ? '/owner/subscriptions' : '/register-owner'} className="btn btn-secondary" style={{ width: '100%' }}>
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Host Earnings Calculator Section */}
      <section id="calculator" style={{ backgroundColor: 'var(--bg-card)', padding: '80px 24px' }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
              Host Earnings Calculator
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Estimate your monthly earnings based on sessions and your rate
            </p>
          </div>

          <div className="card-elevated" style={{ padding: '32px' }}>
            <div className="grid-3" style={{ marginBottom: '28px' }}>
              <div>
                <label className="form-label">Number of Chargers</label>
                <input
                  type="number"
                  className="form-input"
                  style={{ width: '100%' }}
                  value={chargersCount}
                  min={1}
                  max={20}
                  onChange={(e) => setChargersCount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Charging Sessions / Day</label>
                <input
                  type="number"
                  className="form-input"
                  style={{ width: '100%' }}
                  value={sessionsPerDay}
                  min={1}
                  max={24}
                  onChange={(e) => setSessionsPerDay(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Your Rate (₹/kWh)</label>
                <input
                  type="number"
                  className="form-input"
                  style={{ width: '100%' }}
                  value={ratePerKWh}
                  min={8}
                  max={35}
                  onChange={(e) => setRatePerKWh(Number(e.target.value))}
                />
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(57, 242, 138, 0.08)',
                border: '1px solid rgba(57, 242, 138, 0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                ESTIMATED MONTHLY HOST NET PAYOUT (90%)
              </div>
              <div
                style={{
                  fontSize: 'clamp(2.4rem, 4vw, 3.2rem)',
                  fontWeight: 800,
                  color: 'var(--primary-green)',
                  margin: '8px 0',
                }}
              >
                ₹{hostEarning.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Gross Revenue: ₹{monthlyGross.toLocaleString('en-IN')} • Platform Commission: 10%
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;

