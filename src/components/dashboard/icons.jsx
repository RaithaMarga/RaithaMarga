// A small, consistent icon language for empty states and section
// visuals — replaces ad-hoc emoji (which render inconsistently across
// devices and read as less premium) with hand-drawn line icons that
// match the style already used in TrustBar and the Hero flow cards.
// All use currentColor so they inherit whatever tone wraps them.

export const IconField = (props) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path d="M3 18c2-3 4-3 6 0s4 3 6 0 4-3 6 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M3 13c2-3 4-3 6 0s4 3 6 0 4-3 6 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
    <path d="M12 3c-1.4 2.6-1.4 5.2 0 7 1.4-1.8 1.4-4.4 0-7Z" fill="currentColor" opacity="0.8" />
  </svg>
);

export const IconSprout = (props) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path d="M12 21V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M12 11c0-3.5-2.5-6-6-6 0 3.5 2.5 6 6 6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M12 8c0-2.8 2-5 5-5 0 2.8-2 5-5 5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

export const IconHandshake = (props) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path d="M2 12h4l3-3 3 3 3-3 3 3h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 12c0 3 2.5 4.5 4 1.2L12.5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M18 12c0 3-2.5 4.5-4 1.2L11.5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const IconScale = (props) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <line x1="12" y1="3" x2="12" y2="18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="12" cy="3" r="1.4" fill="currentColor" />
    <path d="M4 8 12 5l8 3" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
    <path d="M2 8c0 2.6 2.2 3.8 4 1L8.5 5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    <path d="M22 8c0 2.6-2.2 3.8-4 1L15.5 5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    <line x1="7" y1="20" x2="17" y2="20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const IconSearch = (props) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.6" />
    <line x1="15.5" y1="15.5" x2="21" y2="21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const IconBasket = (props) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path d="M4 9h16l-1.5 10a2 2 0 0 1-2 1.8H7.5a2 2 0 0 1-2-1.8L4 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M8 9 12 3l4 6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="9" y1="13" x2="9.8" y2="18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="15" y1="13" x2="14.2" y2="18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const IconClock = (props) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconShieldCheck = (props) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path d="M12 3.5 19 6.5v5c0 5-3 8-7 9-4-1-7-4-7-9v-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
