'use client';

import {useEffect} from 'react';
import {usePathname} from '@/i18n/navigation';

export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem('visitorId', visitorId);
    }
    navigator.sendBeacon(
      '/api/track',
      new Blob([JSON.stringify({path: pathname, visitorId})], {type: 'application/json'})
    );
  }, [pathname]);

  return null;
}
