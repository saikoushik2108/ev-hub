import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import {
  MapPin,
  CalendarCheck,
  CreditCard,
  Zap,
  ShieldCheck,
  Lock,
  QrCode,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const HowItWorksPage = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <section style={{ padding: '80px 24px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-green-dim)',
              color: 'var(--primary-green)',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '16px',
            }}
          >
            STEP-BY-STEP PLATFORM GUIDE
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 800, marginBottom: '16px' }}>
            Charging & Hosting Made Effortless
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Learn how EV Hub’s concurrency engine, privacy protection, and payment flows work for drivers and hosts.
          </p>
        </div>
      </section>

      {/* Driver Flow Detailed */}
      <section style={{ maxWidth: '1080px', margin: '40px auto 80px', padding: '0 24px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-green)' }}>
            For EV Drivers
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Step 1 */}
          <div className="card" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '24px', alignItems: 'center' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--primary-green-dim)',
                color: 'var(--primary-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.6rem',
              }}
            >
              1
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
                Locate Nearby Charging Points On The Interactive Map
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Open our MapLibre map centered on your GPS location. Color-coded markers show immediate availability:
                <strong style={{ color: '#39F28A' }}> Green</strong> indicates available slots,
                <strong style={{ color: '#F5B942' }}> Yellow</strong> indicates limited capacity, and
                <strong style={{ color: '#FF7272' }}> Red</strong> indicates fully booked for your selected date.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="card" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '24px', alignItems: 'center' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--primary-green-dim)',
                color: 'var(--primary-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.6rem',
              }}
            >
              2
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
                Atomic 5-Minute Concurrency Reservation & Payment
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Select your start and end time slot. Our backend places a temporary 5-minute atomic lock on the station.
                No other driver can claim that slot while you complete payment through Razorpay (UPI, cards, netbanking).
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="card" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '24px', alignItems: 'center' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--primary-green-dim)',
                color: 'var(--primary-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.6rem',
              }}
            >
              3
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
                Unlock Full Address & Check In via QR Code
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Upon payment confirmation, the host's complete residential address, landmark, and contact details are
                unlocked. When you arrive, the host verifies your booking QR code or 6-digit OTP to start charging!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Host Flow Detailed */}
      <section style={{ backgroundColor: 'var(--bg-card)', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-green)' }}>
              For Charging Point Hosts
            </h2>
          </div>

          <div className="grid-3">
            <div className="card-elevated" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-green)', fontWeight: 700, marginBottom: '12px' }}>
                <ShieldCheck size={20} /> STEP 1: VERIFICATION
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
                Register & Submit Documents
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.6' }}>
                Create your host profile, upload ID/electricity bill for residential address verification, and define bank/UPI details for direct payouts.
              </p>
            </div>

            <div className="card-elevated" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-green)', fontWeight: 700, marginBottom: '12px' }}>
                <Zap size={20} /> STEP 2: LIST STATION
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
                Pin Location & Set Rate
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.6' }}>
                Pin your home location with our interactive GPS picker, specify your charger brand, connector type (Type 2/CCS2), capacity, and price per kWh.
              </p>
            </div>

            <div className="card-elevated" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-green)', fontWeight: 700, marginBottom: '12px' }}>
                <CreditCard size={20} /> STEP 3: ACTIVATE & EARN
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
                Subscribe & Receive Payouts
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.6' }}>
                Activate an active host plan (Basic ₹199, Pro ₹399). Your station is instantly listed publicly on the map. Keep 90% of all booking revenues.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;

