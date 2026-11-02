import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 5, size = 16, count = null }) => {
  const rounded = Math.round(rating * 10) / 10;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'flex', gap: '2px', color: '#F5B942' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            fill={star <= Math.round(rating) ? '#F5B942' : 'transparent'}
            stroke="#F5B942"
          />
        ))}
      </div>
      <span style={{ fontSize: `${size * 0.9}px`, fontWeight: 600, color: 'var(--text-main)', marginLeft: '4px' }}>
        {rounded.toFixed(1)}
      </span>
      {count !== null && (
        <span style={{ fontSize: `${size * 0.8}px`, color: 'var(--text-muted)' }}>
          ({count})
        </span>
      )}
    </div>
  );
};

export default RatingStars;

