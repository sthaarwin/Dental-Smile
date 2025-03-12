import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const useScrollTop = () => {
  const { pathname } = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const scrollToTop = () => {
    // If already at top (or very close to top), trigger fade transition instead
    if (window.pageYOffset < 10) {
      handlePageTransition();
      return;
    }

    const duration = 500;
    const start = window.pageYOffset;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      window.scrollTo(0, start * (1 - progress));
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  const handlePageTransition = () => {
    setIsTransitioning(true);
  };

  // Auto scroll on route change
  useEffect(() => {
    scrollToTop();
    
    // Ensure isTransitioning is reset for subsequent navigation
    return () => {
      setIsTransitioning(false);
    };
  }, [pathname]);

  return { scrollToTop, isTransitioning };
};
