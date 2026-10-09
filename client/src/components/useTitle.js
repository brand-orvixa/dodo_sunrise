import { useEffect } from 'react';
export default function useTitle(t) {
  useEffect(() => { document.title = t ? `${t} | Sunrise Infratech` : 'Sunrise Infratech - Instant Construction Cost Estimates'; window.scrollTo({ top: 0, behavior: 'instant' }); }, [t]);
}
