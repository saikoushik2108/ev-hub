import React, { useState } from 'react';
import { Zap, Fuel, DollarSign, TrendingDown } from 'lucide-react';

const CostEstimator = () => {
  const [batteryKWh, setBatteryKWh] = useState(40); // Standard Nexon EV battery
  const [currentSOC, setCurrentSOC] = useState(20);
  const [targetSOC, setTargetSOC] = useState(80);
  const [pricePerKWh, setPricePerKWh] = useState(14); // Avg host price

  const energyNeededKWh = Math.round((batteryKWh * ((targetSOC - currentSOC) / 100)) * 10) / 10;
  const evCost = Math.round(energyNeededKWh * pricePerKWh);

  // Equivalent petrol car calculation:
  // EV efficiency ~7 km/kWh -> km driven = energyNeeded * 7
  // Petrol car efficiency ~15 km/L @ ₹105/L
  const kmDriven = Math.round(energyNeededKWh * 7);
  const petrolLiters = Math.round((kmDriven / 15) * 10) / 10;
  const petrolCost = Math.round(petrolLiters * 105);
  const moneySaved = Math.max(0, petrolCost - evCost);

  return (
    <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-green-dim)',
            color: 'var(--primary-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Zap size={22} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
            EV Charging Cost & Savings Estimator
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Compare your peer-to-peer charging charge against commercial fuel costs
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label className="form-label">Battery Capacity (kWh)</label>
          <input
            type="number"
            className="form-input"
            style={{ width: '100%' }}
            value={batteryKWh}
            min={3}
            max={120}
            onChange={(e) => setBatteryKWh(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="form-label">Host Rate (₹/kWh)</label>
          <input
            type="number"
            className="form-input"
            style={{ width: '100%' }}
            value={pricePerKWh}
            min={5}
            max={40}
            onChange={(e) => setPricePerKWh(Number(e.target.value))}
          />
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '6px' }}>
          <span>State of Charge (SOC) Top-up</span>
          <strong style={{ color: 'var(--primary-green)' }}>{currentSOC}% → {targetSOC}%</strong>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={targetSOC}
          onChange={(e) => setTargetSOC(Math.max(currentSOC + 5, Number(e.target.value)))}
          style={{ width: '100%', accentColor: 'var(--primary-green)' }}
        />
      </div>

      {/* Results Comparison Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          textAlign: 'center',
        }}
      >
        <div className="card-elevated" style={{ padding: '14px 8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Energy Needed</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0' }}>
            {energyNeededKWh} kWh
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>~{kmDriven} km range</div>
        </div>

        <div className="card-elevated" style={{ padding: '14px 8px', border: '1px solid rgba(57, 242, 138, 0.3)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary-green)' }}>EV Hub Charge</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-green)', margin: '4px 0' }}>
            ₹{evCost}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>@ ₹{pricePerKWh}/kWh</div>
        </div>

        <div className="card-elevated" style={{ padding: '14px 8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Petrol Equivalent</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--error)', margin: '4px 0' }}>
            ₹{petrolCost}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>₹{moneySaved} Saved!</div>
        </div>
      </div>
    </div>
  );
};

export default CostEstimator;

