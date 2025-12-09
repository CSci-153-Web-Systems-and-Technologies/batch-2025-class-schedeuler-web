import { useCallback } from "react";

export const useSmoothScroll = () => {
  const smoothScrollTo = useCallback((targetY: number, duration: number = 300) => {
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    const startTime = performance.now();

    const easeOutQuad = (t: number) => t * (2 - t);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuad(progress);
      window.scrollTo(0, startY + distance * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  const scrollToElement = useCallback((elementId: string, offset: number = 100) => {
    const element = document.querySelector(elementId);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset;
      const targetY = offsetTop - offset;
      smoothScrollTo(targetY, 300);
    }
  }, [smoothScrollTo]);

  return { smoothScrollTo, scrollToElement };
};