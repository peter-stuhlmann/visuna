import { useState, useEffect, RefObject } from 'react';

function useIsInViewport<T extends HTMLElement>(
  elementRef: RefObject<T | null>,
  threshold: number = 0
): boolean {
  const [isInViewport, setIsInViewport] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries; // es gibt nur ein beobachtetes Element
        setIsInViewport(entry.isIntersecting); // true, wenn im Viewport
      },
      {
        root: null,
        threshold: threshold, // wann es als sichtbar gilt (0 = sobald auch nur 1px sichtbar ist)
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [elementRef, threshold]);

  return isInViewport; // Gibt true zurück, wenn das Element im Viewport ist
}

export default useIsInViewport;
