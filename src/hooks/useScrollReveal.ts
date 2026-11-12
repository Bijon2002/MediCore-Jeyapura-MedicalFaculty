import { useEffect } from 'react';

/**
 * Universal hook that observes all elements with `.reveal-on-scroll` or `.reveal-stagger`
 * and applies `.is-revealed` when scrolled into view.
 */
export function useScrollReveal(dependencyTrigger?: any) {
  useEffect(() => {
    // If browser doesn't support IntersectionObserver, reveal everything immediately
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal-on-scroll, .reveal-stagger').forEach((el) => {
        el.classList.add('is-revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            // Unobserve once revealed to prevent repetitive triggers on scroll up/down
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll, .reveal-stagger');
    elements.forEach((el) => {
      // If already revealed, do not re-observe
      if (!el.classList.contains('is-revealed')) {
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [dependencyTrigger]);
}

