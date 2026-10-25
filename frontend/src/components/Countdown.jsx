import React, { useEffect, useMemo, useState } from 'react';

const pad = (value) => String(value).padStart(2, '0');

const getRemaining = (target) => {
  const distance = new Date(target).getTime() - Date.now();
  if (!Number.isFinite(distance) || distance <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    expired: false,
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance / 3600000) % 24),
    minutes: Math.floor((distance / 60000) % 60),
    seconds: Math.floor((distance / 1000) % 60),
  };
};

/**
 * Live countdown used on event cards and details pages.
 * Server timestamps are absolute, so this stays correct across timezones.
 */
export const Countdown = ({ date, label = 'Starts in', compact = false, className = '' }) => {
  const [remaining, setRemaining] = useState(() => getRemaining(date));

  useEffect(() => {
    setRemaining(getRemaining(date));
    const timer = window.setInterval(() => {
      setRemaining(getRemaining(date));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [date]);

  const units = useMemo(
    () => [
      { value: remaining.days, label: 'days' },
      { value: remaining.hours, label: 'hrs' },
      { value: remaining.minutes, label: 'min' },
      { value: remaining.seconds, label: 'sec' },
    ],
    [remaining]
  );

  if (remaining.expired) {
    return (
      <div className={`countdown countdown--expired ${className}`.trim()}>
        <span className="countdown__dot" aria-hidden="true" />
        <span className="countdown__label">Event concluded</span>
      </div>
    );
  }

  return (
    <div className={`countdown ${compact ? 'countdown--compact' : ''} ${className}`.trim()}>
      <span className="countdown__label">{label}</span>
      <div className="countdown__units" role="timer" aria-live="off">
        {units.map((unit) => (
          <span className="countdown__unit" key={unit.label}>
            <span className="countdown__value">{pad(unit.value)}</span>
            <span className="countdown__suffix">{unit.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Countdown;
