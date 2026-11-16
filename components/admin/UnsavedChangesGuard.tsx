'use client';

import {useEffect} from 'react';
import {useLocale} from 'next-intl';

export default function UnsavedChangesGuard() {
  const ar = useLocale() === 'ar';

  useEffect(() => {
    const dirty = new Set<HTMLFormElement>();
    const isDirty = () => [...dirty].some((f) => f.isConnected);
    const msg = ar
      ? 'لديك تغييرات غير محفوظة. هل تريد المغادرة بدون حفظ؟'
      : 'You have unsaved changes. Leave without saving?';
    let guarded = false;

    const onInput = (e: Event) => {
      const form = (e.target as HTMLElement).closest?.('form');
      if (!form) return;
      dirty.add(form);
      if (!guarded) {
        history.pushState(null, '', location.href);
        guarded = true;
      }
    };
    const onSubmit = (e: Event) => {
      dirty.delete(e.target as HTMLFormElement);
    };
    const onClick = (e: MouseEvent) => {
      if (!isDirty()) return;
      const a = (e.target as HTMLElement).closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank') return;
      if (window.confirm(msg)) dirty.clear();
      else {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const onPop = () => {
      if (!isDirty()) return;
      if (window.confirm(msg)) {
        dirty.clear();
        history.back();
      } else {
        history.pushState(null, '', location.href);
      }
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    document.addEventListener('input', onInput);
    document.addEventListener('submit', onSubmit);
    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPop);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      document.removeEventListener('input', onInput);
      document.removeEventListener('submit', onSubmit);
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [ar]);

  return null;
}
