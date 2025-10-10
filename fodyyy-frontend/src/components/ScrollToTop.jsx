import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Automatically scrolls to the top of the page when the route changes
 */
const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
      // Scroll to top immediately when route changes
      // Using multiple methods for maximum compatibility
      window.scrollTo(0, 0);
      
      // Also scroll the document element and body (for different browsers)
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
      
      // Force scroll on the root element
      const root = document.getElementById('root');
      if (root) {
        root.scrollTop = 0;
      }
    });
  }, [pathname, search]);

  return null; // This component doesn't render anything
};

export default ScrollToTop;