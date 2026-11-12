import React, { useState, useEffect, useRef } from 'react';

export interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  fallback?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1400,
  suffix = '+',
  fallback = '—',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!value || isNaN(value)) return;

    const el = elementRef.current;
    if (!el || typeof window === 'undefined') return;

    if (!('IntersectionObserver' in window)) {
      setDisplayValue(value);
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            observer.disconnect();

            let startTime: number | null = null;
            const startVal = 0;
            const endVal = value;

            const step = (timestamp: number) => {
              if (!startTime) startTime = timestamp;
              const progress = Math.min((timestamp - startTime) / duration, 1);
              // Ease-out cubic
              const easeProgress = 1 - Math.pow(1 - progress, 3);
              const current = Math.floor(startVal + (endVal - startVal) * easeProgress);
              setDisplayValue(current);

              if (progress < 1) {
                window.requestAnimationFrame(step);
              } else {
                setDisplayValue(endVal);
              }
            };

            window.requestAnimationFrame(step);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [value, duration, hasAnimated]);

  if (!value && value !== 0) {
    return <span ref={elementRef}>{fallback}</span>;
  }

  return (
    <span ref={elementRef}>
      {hasAnimated ? displayValue : 0}
      {suffix}
    </span>
  );
};

