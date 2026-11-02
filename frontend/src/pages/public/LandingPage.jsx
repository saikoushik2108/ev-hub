import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import CostEstimator from '../../components/widgets/CostEstimator';
import CarbonCalculator from '../../components/widgets/CarbonCalculator';
import {
  Zap,
  MapPin,
  Shield,
  CalendarCheck,
  CreditCard,
  Leaf,
  ChevronDown,
  ChevronUp,
  Star,
  Users,
  CheckCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const LandingPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const stats = [
    { label: 'Verified Charging Points', value: '500+' },
    { label: 'Network Uptime', value: '99.8%' },
    { label: 'CO₂ Emissions Offset', value: '45,000+ kg' },
    { label: 'Happy EV Bookings', value: '15,000+' },
  ];

  const faqs = [
    {
      q: 'How does EV Hub protect the residential host’s privacy?',
      a: 'We show the general neighborhood and area (e.g. Madhapur, Hyderabad) during public map discovery. The host’s exact house address, directions, and direct phone contact are only unlocked to the driver after a booking is confirmed with payment.',
    },
    {
      q: 'How does the 5-minute booking hold prevent double bookings?',
      a: 'When you select a time slot and click proceed, our concurrency engine places an atomic 5-minute hold on that connector capacity. During this window, no other user can book or hold that slot while you complete your Razorpay payment.',
    },
    {
      q: 'Can I earn passive income by listing my home charger?',
      a: 'Yes! EV owners and homeowners with dedicated AC or DC home chargers can register as hosts on EV Hub. You decide your operating hours, hourly or per-kWh rate, and bookable dates. EV Hub handles reservations, payments, and 24-hr payouts.',
    },
    {
      q: 'What types of electric vehicles are supported?',
      a: 'EV Hub supports all 2-wheelers, 3-wheelers, and 4-wheelers. Hosts specify supported connectors such as CCS2 DC, Type 2 AC, CHAdeMO, GB/T, and heavy-duty 15A 3-pin sockets.',
    },
    {
      q: 'What is the cancellation and refund policy?',
      a: 'Cancellations made more than 2 hours before the scheduled slot receive a 100% refund. Cancellations within 2 hours receive a 75% refund. Refunds are tracked in your user ledger.',
    },
  ];

  const testimonials = [
    {
      name: 'Dr. Arjun Sen',
      role: 'Tata Nexon EV Driver • Hyderabad',
      comment: 'EV Hub is a total game changer! I was running at 11% battery near Gachibowli with commercial chargers occupied. Found a verified host 800m away, booked in 30 seconds, and topped up seamlessly.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Rajesh & Kavita Kumar',
      role: 'Residential Hosts • Jubilee Hills',
      comment: 'Our home 22kW wallbox used to sit idle all afternoon. With EV Hub host subscription, we generate ₹8,000 - ₹12,000 every month in passive income, helping neighborhood EV drivers charge green.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '90px 24px 80px',
          textAlign: 'center',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(57, 242, 138, 0.15), transparent 70%)',
        }}
      >
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          {/* Tagline Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-green-dim)',
              border: '1px solid rgba(57, 242, 138, 0.3)',
              color: 'var(--primary-green)',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '24px',
              letterSpacing: '0.5px',
            }}
          >
            <span className="pulse-indicator" />
            CHARGE ANYWHERE. CONNECT EVERYWHERE.
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              color: 'var(--text-main)',
              letterSpacing: '-1.5px',
              marginBottom: '24px',
            }}
          >
            Power Your Journey.{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #39F28A, #8CF5B4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Find Your Next Charge.
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: '36px',
              maxWidth: '720px',
              margin: '0 auto 36px',
            }}
          >
            Discover, book and access convenient residential and private EV charging points near you.
            Turn your unused home charging infrastructure into a steady earning opportunity.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link to="/explore" className="btn btn-primary btn-lg">
              <Zap size={20} fill="#090B0A" /> Find Charging Stations
            </Link>
            <Link to="/register-owner" className="btn btn-secondary btn-lg">
              Become a Host <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Platform Hero Visual Card */}
        <div
          style={{
            maxWidth: '1080px',
            margin: '64px auto 0',
            position: 'relative',
          }}
        >
          <div
            className="card"
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-glow)',
              border: '1px solid rgba(57, 242, 138, 0.3)',
              background: 'linear-gradient(180deg, #171E1A 0%, #0E1310 100%)',
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1600&q=80"
              alt="EV Hub Charging Station Experience"
              style={{
                width: '100%',
                maxHeight: '440px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-lg)',
              }}
            />
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section
        style={{
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-card)',
          padding: '36px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            textAlign: 'center',
          }}
        >
          {stats.map((s, idx) => (
            <div key={idx}>
              <div
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 800,
                  color: 'var(--primary-green)',
                  letterSpacing: '-1px',
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>
            How EV Hub Works
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            Reserve charging capacity in three frictionless steps
          </p>
        </div>

        <div className="grid-3">
          <div className="card" style={{ textAlign: 'left' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-green-dim)',
                color: 'var(--primary-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px',
              }}
            >
              <MapPin size={24} />
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-green)', marginBottom: '6px' }}>
              STEP 01
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
              Search & Discover
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Explore verified charging points near you via our interactive MapLibre map. Filter by connector type,
              AC/DC, kW capacity, price, and date.
            </p>
          </div>

          <div className="card" style={{ textAlign: 'left' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-green-dim)',
                color: 'var(--primary-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px',
              }}
            >
              <CalendarCheck size={24} />
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-green)', marginBottom: '6px' }}>
              STEP 02
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
              Lock Slot & Pay
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Select your preferred time slot. Our concurrency engine holds the slot for 5 minutes while you
              securely pay with Razorpay. Double booking is impossible.
            </p>
          </div>

          <div className="card" style={{ textAlign: 'left' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-green-dim)',
                color: 'var(--primary-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px',
              }}
            >
              <Zap size={24} />
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-green)', marginBottom: '6px' }}>
              STEP 03
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
              Plug In & Charge
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Navigate to the unlocked host address, show your check-in QR code, plug in, and power up your
              battery with total peace of mind.
            </p>
          </div>
        </div>
      </section>

      {/* Dual Value Proposition: Hosts & Drivers */}
      <section style={{ backgroundColor: 'var(--bg-card)', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="grid-2">
            {/* Host Benefits */}
            <div className="card-elevated" style={{ padding: '36px' }}>
              <div style={{ display: 'inline-block', color: 'var(--primary-green)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
                FOR CHARGING POINT OWNERS
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '16px' }}>
                Monetize Your Home EV Charger
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
                Turn idle residential chargers into a recurring revenue stream with automated billing and direct payouts.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                {[
                  'Set your own hourly or per-kWh rate',
                  'Total control over operating calendar and blocked hours',
                  'Address confidential until payment confirmation',
                  'Transparent 90% host revenue split with weekly settlements',
                  'Flexible subscription plans: Basic, Pro, and Business',
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                    <CheckCircle size={18} color="var(--primary-green)" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/register-owner" className="btn btn-primary">
                Register as Host
              </Link>
            </div>

            {/* Driver Benefits */}
            <div className="card-elevated" style={{ padding: '36px' }}>
              <div style={{ display: 'inline-block', color: 'var(--primary-green)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
                FOR EV DRIVERS
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '16px' }}>
                Never Get Stranded Again
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
                Access verified neighborhood fast and overnight chargers when highway and commercial stations are full.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                {[
                  'Real-time bookable slot availability with color-coded markers',
                  'Guaranteed slot reservation — no queueing upon arrival',
                  'Transparent pricing with zero hidden fees',
                  'Verified hosts with ratings, safety checks, and reviews',
                  'Seamless Razorpay UPI, Cards, and Netbanking payments',
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                    <CheckCircle size={18} color="var(--primary-green)" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/explore" className="btn btn-outline">
                Explore Available Stations
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Calculators Section */}
      <section style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>
            Calculate Your Savings & Eco Impact
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            See how much you save on fuel and how much carbon you prevent from entering the atmosphere
          </p>
        </div>

        <div className="grid-2">
          <CostEstimator />
          <CarbonCalculator />
        </div>
      </section>

      {/* Host Pricing Plans Preview */}
      <section style={{ backgroundColor: 'var(--bg-card)', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>
            Transparent Host Subscription Plans
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '48px' }}>
            Choose the perfect plan to list and manage your charging infrastructure
          </p>

          <div className="grid-3" style={{ textAlign: 'left' }}>
            {/* Basic */}
            <div className="card-elevated" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Basic Host</h4>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
                  ₹199<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/month</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Ideal for individual homeowners with 1 residential wallbox.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', marginBottom: '28px' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} color="var(--primary-green)" /> 1 Charging Point Listing</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} color="var(--primary-green)" /> Standard Slot Availability Engine</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} color="var(--primary-green)" /> Direct Host Directions After Booking</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} color="var(--primary-green)" /> Basic Booking Dashboard</li>
                </ul>
              </div>
              <Link to="/register-owner" className="btn btn-secondary" style={{ width: '100%' }}>
                Get Started
              </Link>
            </div>

            {/* Pro */}
            <div
              className="card-elevated"
              style={{
                border: '1px solid var(--primary-green)',
                boxShadow: 'var(--shadow-glow)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '24px',
                  backgroundColor: 'var(--primary-green)',
                  color: '#090B0A',
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                MOST POPULAR
              </div>
              <div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--primary-green)' }}>
                  Pro Host
                </h4>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
                  ₹399<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/month</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  For multi-vehicle households or community hosts with up to 3 chargers.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', marginBottom: '28px' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} color="var(--primary-green)" /> Up to 3 Charging Points</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} color="var(--primary-green)" /> Dynamic Hourly Pricing</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} color="var(--primary-green)" /> Priority Search Placement</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} color="var(--primary-green)" /> Advanced Revenue Analytics</li>
                </ul>
              </div>
              <Link to="/register-owner" className="btn btn-primary" style={{ width: '100%' }}>
                Subscribe to Pro
              </Link>
            </div>

            {/* Business */}
            <div className="card-elevated" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Business Network</h4>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
                  ₹799<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/month</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Commercial establishments, societies, and dedicated EV parking lots.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', marginBottom: '28px' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} color="var(--primary-green)" /> Unlimited Charging Points</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} color="var(--primary-green)" /> Automated Payout Engine</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} color="var(--primary-green)" /> Multi-connector Load Management</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} color="var(--primary-green)" /> 24/7 Dedicated Support</li>
                </ul>
              </div>
              <Link to="/register-owner" className="btn btn-secondary" style={{ width: '100%' }}>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div
            style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              color: 'var(--text-dim)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            DEMO TESTIMONIALS & COMMUNITY FEEDBACK
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Loved by Hosts & Drivers
          </h2>
        </div>

        <div className="grid-2">
          {testimonials.map((t, idx) => (
            <div key={idx} className="card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', gap: '4px', color: '#F5B942', marginBottom: '16px' }}>
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={18} fill="#F5B942" stroke="#F5B942" />
                ))}
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.7', fontStyle: 'italic', marginBottom: '24px' }}>
                "{t.comment}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={t.avatar}
                  alt={t.name}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Collapsible FAQ Section */}
      <section style={{ backgroundColor: 'var(--bg-card)', padding: '80px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Everything you need to know about charging and hosting on EV Hub
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="card-elevated"
                  style={{
                    padding: '18px 22px',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                    borderColor: isOpen ? 'var(--primary-green)' : 'var(--border-subtle)',
                  }}
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {faq.q}
                    </span>
                    {isOpen ? <ChevronUp size={18} color="var(--primary-green)" /> : <ChevronDown size={18} />}
                  </div>
                  {isOpen && (
                    <div style={{ marginTop: '12px', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section
        style={{
          padding: '80px 24px',
          textAlign: 'center',
          backgroundColor: '#090B0A',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px' }}>
            Ready to Electrify Your Journey?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '32px', lineHeight: '1.6' }}>
            Join thousands of EV drivers and residential hosts creating India's fastest-growing peer-to-peer charging ecosystem.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/explore" className="btn btn-primary btn-lg">
              Explore Map Now
            </Link>
            <Link to="/register-owner" className="btn btn-secondary btn-lg">
              Start Earning as a Host
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;

