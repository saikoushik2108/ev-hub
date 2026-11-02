import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, Heart, Leaf, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#070908',
        borderTop: '1px solid var(--border-subtle)',
        padding: '64px 24px 32px',
        color: 'var(--text-muted)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '40px',
            marginBottom: '48px',
          }}
        >
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-green)',
                  color: '#090B0A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px var(--primary-green-glow)',
                }}
              >
                <Zap size={20} fill="#090B0A" />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                EV<span style={{ color: 'var(--primary-green)' }}>HUB</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '16px' }}>
              Charge Anywhere. Connect Everywhere. The next-generation peer-to-peer EV charging
              network empowering drivers and hosts across the nation.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(57, 242, 138, 0.08)',
                color: 'var(--primary-green)',
                fontSize: '0.775rem',
                fontWeight: 600,
              }}
            >
              <Leaf size={14} /> 45,000+ kg CO₂ Offset
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>
              Explore
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <li><Link to="/explore" style={{ color: 'var(--text-muted)' }}>Interactive Map</Link></li>
              <li><Link to="/explore?connectorType=CCS 2 DC" style={{ color: 'var(--text-muted)' }}>Fast DC Charging</Link></li>
              <li><Link to="/explore?chargerType=AC" style={{ color: 'var(--text-muted)' }}>Residential AC Points</Link></li>
              <li><Link to="/how-it-works" style={{ color: 'var(--text-muted)' }}>How It Works</Link></li>
            </ul>
          </div>

          {/* For Hosts */}
          <div>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>
              For Hosts
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <li><Link to="/register-owner" style={{ color: 'var(--text-muted)' }}>List Your Home Charger</Link></li>
              <li><Link to="/pricing" style={{ color: 'var(--text-muted)' }}>Host Subscription Plans</Link></li>
              <li><Link to="/pricing#calculator" style={{ color: 'var(--text-muted)' }}>Host Earnings Calculator</Link></li>
              <li><Link to="/login" style={{ color: 'var(--text-muted)' }}>Host Portal Login</Link></li>
            </ul>
          </div>

          {/* Platform Security */}
          <div>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>
              Trust & Security
            </h4>
            <p style={{ fontSize: '0.825rem', lineHeight: '1.6', marginBottom: '12px' }}>
              Every residential host undergoes government ID verification, and precise street addresses are
              kept confidential until booking confirmation.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={16} color="var(--primary-green)" />
              <span>Razorpay 256-bit Secure Gateway</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: '24px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.8rem',
          }}
        >
          <div>
            © {new Date().getFullYear()} EV Hub Technologies Inc. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/about">About Us</Link>
            <Link to="/how-it-works">Privacy Policy</Link>
            <Link to="/how-it-works">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

