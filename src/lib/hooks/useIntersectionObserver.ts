import { useEffect, RefObject } from 'react';

interface UseIntersectionObserverOptions {
  target: RefObject<HTMLElement | null>;
  onIntersect: () => void;
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export function useIntersectionObserver({
  target,
  onIntersect,
  threshold = 0.1,
  rootMargin = '0px',
  enabled = true,
}: UseIntersectionObserverOptions) {
  useEffect(() => {
    if (!enabled || !target.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onIntersect();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    const currentTarget = target.current;
    observer.observe(currentTarget);

    return () => {
      observer.unobserve(currentTarget);
    };
  }, [target, onIntersect, threshold, rootMargin, enabled]);
}

