import React from 'react';

const Badge = ({ status, text }) => {
  let badgeClass = 'badge-neutral';
  const s = (status || '').toUpperCase();

  if (
    s === 'ACTIVE' ||
    s === 'APPROVED' ||
    s === 'VERIFIED' ||
    s === 'CONFIRMED' ||
    s === 'COMPLETED' ||
    s === 'SUCCESS' ||
    s === 'SETTLED' ||
    s === 'GREEN'
  ) {
    badgeClass = 'badge-green';
  } else if (
    s === 'PENDING' ||
    s === 'TEMPORARILY_HELD' ||
    s === 'PAYMENT_PENDING' ||
    s === 'PROCESSING' ||
    s === 'IN_PROGRESS' ||
    s === 'YELLOW'
  ) {
    badgeClass = 'badge-yellow';
  } else if (
    s === 'SUSPENDED' ||
    s === 'REJECTED' ||
    s === 'EXPIRED' ||
    s === 'CANCELLED' ||
    s === 'FAILED' ||
    s === 'HOLD_EXPIRED' ||
    s === 'RED'
  ) {
    badgeClass = 'badge-red';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {text || status}
    </span>
  );
};

export default Badge;

