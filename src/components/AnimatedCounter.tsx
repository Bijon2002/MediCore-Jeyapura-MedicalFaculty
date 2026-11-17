import React, { useState, useEffect, useRef } from 'react';

export interface AnimatedCounterProps {
  value: number | null | undefined;
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
  const [isIntersecting, setIsIntersecting] = useState<boolean>(false);
  const elementRef = useRef<HTMLSpanElement>(null);
  const prevValueRef = useRef<number>(0);

  // Set up intersection observer to trigger animation when visible
  useEffect(() => {
    const el = elementRef.current;
    if (!el || typeof window === 'undefined') return;

    if (!('IntersectionObserver' in window)) {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Animate counter when visible in viewport and value is a valid number
  useEffect(() => {
    if (value === null || value === undefined || isNaN(value)) {
      return;
    }

    if (!isIntersecting) {
      return;
    }

    const startVal = prevValueRef.current;
    const endVal = value;

    if (startVal === endVal) {
      setDisplayValue(endVal);
      return;
    }

    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startVal + (endVal - startVal) * easeProgress);
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endVal);
        prevValueRef.current = endVal;
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value, isIntersecting, duration]);

  if (value === null || value === undefined || isNaN(value)) {
    return <span ref={elementRef}>{fallback}</span>;
  }

  // Only display suffix (e.g. "+") if count is greater than 0
  const renderedSuffix = value > 0 ? suffix : '';

  return (
    <span ref={elementRef}>
      {displayValue}
      {renderedSuffix}
    </span>
  );
};


