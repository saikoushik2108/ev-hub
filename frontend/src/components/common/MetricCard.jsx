import React from 'react';

const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'green', trend }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: color === 'green' ? 'var(--primary-green-dim)' : 'var(--bg-elevated)',
              color: color === 'green' ? 'var(--primary-green)' : 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
          {value}
        </span>
        {trend && (
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-green)' }}>
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          {subtitle}
        </span>
      )}
    </div>
  );
};

export default MetricCard;

