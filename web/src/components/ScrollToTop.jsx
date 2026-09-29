import { useLocation } from 'react-router';
import { useEffect } from 'react';

const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    useEffect(() => {
      if (hash) {
        const frame = window.requestAnimationFrame(() => {
          const targetId = decodeURIComponent(hash.slice(1));
          document.getElementById(targetId)?.scrollIntoView({ block: 'start', behavior: 'auto' });
        });

        return () => window.cancelAnimationFrame(frame);
      }

        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return undefined;
    }, [pathname, hash]);

    return null;
}

export default ScrollToTop;
