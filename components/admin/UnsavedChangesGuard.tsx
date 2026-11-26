'use client';

import {useEffect} from 'react';

export default function UnsavedChangesGuard() {
  useEffect(() => {
    const dirty = new Set<HTMLFormElement>();
    const isDirty = () => [...dirty].some((f) => f.isConnected);
    const msg = 'لديك تغييرات غير محفوظة. هل تريد المغادرة بدون حفظ؟';
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
    document.addEventListener('submit', onSubmit, true);
    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPop);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      document.removeEventListener('input', onInput);
      document.removeEventListener('submit', onSubmit, true);
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, []);

  return null;
}
