import { useEffect, useState } from 'react';

/**
 * Given a display string like "86%" or "30–50%" or "4", animates the
 * leading integer counting up from 0 once `start` becomes true, and
 * returns the string with that integer replaced. Non-numeric strings
 * (or ranges) are returned unchanged, since only a single clean number
 * can be meaningfully animated.
 */
export function useCountUp(value, start, duration = 1200) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!start) return undefined;

    const match = value.match(/^(\d+)(.*)$/);
    // Skip animation for ranges like "30–50%" — just reveal as-is.
    if (!match || value.includes('\u2013') || value.includes('-')) {
      setDisplay(value);
      return undefined;
    }

    const target = parseInt(match[1], 10);
    const suffix = match[2];
    const startTime = performance.now();

    let frame;
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      setDisplay(`${current}${suffix}`);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, start, duration]);

  return display;
}
