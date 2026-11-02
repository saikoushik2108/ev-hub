import React, { useState } from 'react';
import { Leaf, Trees, Wind, HelpCircle } from 'lucide-react';

const CarbonCalculator = () => {
  const [monthlyKm, setMonthlyKm] = useState(1200);

  // Assumptions & Methodology:
  // - Conventional petrol car emits ~135g CO2/km (0.135 kg/km)
  // - EV consumes ~0.14 kWh/km
  // - Net CO2 offset per km is approx 0.117 kg after accounting for grid emissions
  // - Mature tree absorbs approx 21 kg CO2 per year (~1.75 kg/month)
  const monthlyCo2SavedKg = Math.round(monthlyKm * 0.117 * 10) / 10;
  const annualCo2SavedKg = Math.round(monthlyCo2SavedKg * 12);
  const treesEquivalent = Math.round(annualCo2SavedKg / 21);

  return (
    <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(57, 242, 138, 0.12)',
            color: 'var(--primary-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Leaf size={22} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Carbon Offset & Eco Impact Calculator
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Calculate the environmental impact of your zero-emission travel
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '8px' }}>
          <span>Your Estimated Monthly Driving Distance</span>
          <strong style={{ color: 'var(--primary-green)' }}>{monthlyKm} km / month</strong>
        </div>
        <input
          type="range"
          min="200"
          max="5000"
          step="100"
          value={monthlyKm}
          onChange={(e) => setMonthlyKm(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--primary-green)' }}
        />
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div className="card-elevated" style={{ textAlign: 'center', padding: '16px' }}>
          <Wind size={24} color="var(--primary-green)" style={{ margin: '0 auto 6px' }} />
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {annualCo2SavedKg} kg
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Annual CO₂ Emissions Avoided</div>
        </div>

        <div className="card-elevated" style={{ textAlign: 'center', padding: '16px' }}>
          <Trees size={24} color="#8CF5B4" style={{ margin: '0 auto 6px' }} />
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-green)' }}>
            {treesEquivalent} Trees
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Equivalent Forest Absorption</div>
        </div>
      </div>

      {/* Assumptions Footer */}
      <div
        style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--bg-elevated)',
          fontSize: '0.725rem',
          color: 'var(--text-dim)',
          lineHeight: '1.5',
        }}
      >
        <strong>Documented Assumptions:</strong> Based on 135g/km average tailpipe emissions of standard 1.5L
        petrol vehicles vs 0.14 kWh/km EV consumption factoring standard central electricity authority grid
        emission baseline. 1 tree equates to 21 kg annual carbon sequestration.
      </div>
    </div>
  );
};

export default CarbonCalculator;

