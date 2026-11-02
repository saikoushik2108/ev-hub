import React from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { Zap, ShieldCheck, Leaf, Globe, Award, Users } from 'lucide-react';

const AboutPage = () => {
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
            OUR MISSION & VISION
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 800, marginBottom: '16px' }}>
            Decentralizing EV Infrastructure Across India
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.7' }}>
            EV Hub is born from a simple belief: the fastest path to electric vehicle adoption is unlocking
            the millions of existing residential chargers already present in our neighborhoods.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section style={{ maxWidth: '1120px', margin: '30px auto 80px', padding: '0 24px' }}>
        <div className="grid-3">
          <div className="card" style={{ padding: '32px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-green-dim)',
                color: 'var(--primary-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Globe size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
              Ubiquitous Accessibility
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              No driver should ever worry about battery range anxiety. By transforming residential chargers into
              shared community nodes, we build an interconnected charging web everywhere.
            </p>
          </div>

          <div className="card" style={{ padding: '32px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-green-dim)',
                color: 'var(--primary-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
              Trust, Security & Privacy
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              We protect both our hosts and drivers with encrypted Razorpay payments, verified government ID checks,
              confidential residential address masking, and automated QR check-ins.
            </p>
          </div>

          <div className="card" style={{ padding: '32px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-green-dim)',
                color: 'var(--primary-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Leaf size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
              Decarbonizing Mobility
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              Every kWh charged on EV Hub replaces fossil fuels. We prioritize solar-powered residential hosts
              and help drivers track their tangible carbon emission offsets in real-time.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;

