import React from 'react';

export const CarFrontWavesUp = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 4.5a6 6 0 0 1 8 0" />
    <path d="M10 6.5a3 3 0 0 1 4 0" />
    <path d="M5 14l1.5-4.5A2 2 0 0 1 8.4 8h7.2a2 2 0 0 1 1.9 1.5L19 14" />
    <path d="M4 14h16v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3z" />
    <path d="M7 16h.01" strokeWidth="3" />
    <path d="M17 16h.01" strokeWidth="3" />
  </svg>
);

export const CarSideExclamationFill = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13 2h-2v5h2V2zM13 8h-2v2h2V8z" />
    <path d="M18.5 11.5l-2.8-3.3c-.5-.6-1.2-1-2-1H7.5c-.8 0-1.5.4-2 1L2.7 11.5c-.5.6-.7 1.3-.7 2v4c0 .8.7 1.5 1.5 1.5h.2c.2 1.4 1.4 2.5 2.8 2.5s2.6-1.1 2.8-2.5h5.4c.2 1.4 1.4 2.5 2.8 2.5s2.6-1.1 2.8-2.5h.2c.8 0 1.5-.7 1.5-1.5v-4c0-.7-.2-1.4-.7-2zM6.5 19.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm11 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zM4.5 11.5l2-2.4c.3-.3.6-.5 1-.5h6c.4 0 .8.2 1 .5l2 2.4H4.5z" />
  </svg>
);

export const CarBlocked = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 4v5" />
    <path d="M12 12v.01" strokeWidth="2" />
    <path d="M9 10H6.5L5 12.5H3a2 2 0 0 0-2 2v1.5a2 2 0 0 0 2 2h1" />
    <circle cx="6" cy="18" r="2" />
    <path d="M8 18h1" />
    <path d="M15 10h2.5l1.5 2.5H21a2 2 0 0 1 2 2v1.5a2 2 0 0 1-2 2h-1" />
    <circle cx="18" cy="18" r="2" />
    <path d="M16 18h-1" />
  </svg>
);

export const TowTruck = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 17h18" />
    <path d="M3 17v-2a2 2 0 0 1 2-2h3l2-3h4l2 3h3a2 2 0 0 1 2 2v2" />
    <circle cx="6.5" cy="17.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
    <path d="M14 10V6a2 2 0 0 1 2-2h3" />
    <path d="M19 4v4" />
  </svg>
);

export const Car2Fill = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    {/* Back car - lower opacity for hierarchical effect */}
    <path d="M17.5 8.5l-2.8-3.3c-.5-.6-1.2-1-2-1H6.5c-.8 0-1.5.4-2 1L1.7 8.5c-.5.6-.7 1.3-.7 2v4c0 .8.7 1.5 1.5 1.5h.2c.2 1.4 1.4 2.5 2.8 2.5s2.6-1.1 2.8-2.5h5.4c.2 1.4 1.4 2.5 2.8 2.5s2.6-1.1 2.8-2.5h.2c.8 0 1.5-.7 1.5-1.5v-4c0-.7-.2-1.4-.7-2zM5.5 16.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm11 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z" opacity="0.4" />
    {/* Front car */}
    <path d="M22.5 11.5l-2.8-3.3c-.5-.6-1.2-1-2-1H11.5c-.8 0-1.5.4-2 1L6.7 11.5c-.5.6-.7 1.3-.7 2v4c0 .8.7 1.5 1.5 1.5h.2c.2 1.4 1.4 2.5 2.8 2.5s2.6-1.1 2.8-2.5h5.4c.2 1.4 1.4 2.5 2.8 2.5s2.6-1.1 2.8-2.5h.2c.8 0 1.5-.7 1.5-1.5v-4c0-.7-.2-1.4-.7-2zM10.5 19.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm11 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z" />
  </svg>
);

export const ClockBadgeExclamationFill = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" />
    <path d="M12.5 7H11v6l5.2 3.1.8-1.2-4.5-2.7V7z" />
    <circle cx="19" cy="19" r="5" fill="black" />
    <circle cx="19" cy="19" r="4" fill="currentColor" />
    <path d="M19 16h-1v4h1v-4zm0 5h-1v1h1v-1z" fill="black" />
  </svg>
);

export const Person2Fill = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 11c1.93 0 3.5-1.57 3.5-3.5S13.93 4 12 4 8.5 5.57 8.5 7.5 10.07 11 12 11zM4 20c0-2.21 1.79-4 4-4h8c2.21 0 4 1.79 4 4v1H4v-1z" />
    <path d="M18 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zM21 15c0-1.66-1.34-3-3-3-1.66 0-3 1.34-3 3v1h6v-1z" />
  </svg>
);
