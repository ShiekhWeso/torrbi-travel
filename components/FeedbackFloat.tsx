'use client';

import dynamic from 'next/dynamic';
import {useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {usePathname} from '@/i18n/navigation';

const FeedbackDialog = dynamic(() => import('@/components/FeedbackDialog'), {
  ssr: false,
  loading: () => null
});

export default function FeedbackFloat({userEmail}: {userEmail?: string}) {
  const t = useTranslations('feedback');
  const pathname = usePathname();
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setLoaded(true);
          setOpen(true);
        }}
        aria-label={t('open')}
        className="fixed bottom-24 start-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-warm to-sun text-navy shadow-[0_8px_24px_rgba(254,153,98,0.5)] transition-transform hover:scale-105"
      >
        <span className="material-symbols-outlined text-[28px]" aria-hidden="true">feedback</span>
      </button>
      {loaded && (
        <FeedbackDialog
          open={open}
          onClose={() => setOpen(false)}
          pathname={pathname}
          userEmail={userEmail}
          triggerRef={triggerRef}
        />
      )}
    </>
  );
}
