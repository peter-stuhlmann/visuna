import { useState, useEffect, RefObject } from 'react';

function useIsInViewport<T extends HTMLElement>(
  elementRef: RefObject<T | null>,
  threshold: number = 0,
  once: boolean = false
): boolean {
  const [isInViewport, setIsInViewport] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInViewport(true);
          if (once) {
            observer.disconnect(); // stoppt weitere Beobachtungen
          }
        } else if (!once) {
          setIsInViewport(false);
        }
      },
      {
        root: null,
        threshold: threshold,
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      observer.disconnect();
    };
  }, [elementRef, threshold, once]);

  return isInViewport;
}

export default useIsInViewport;
