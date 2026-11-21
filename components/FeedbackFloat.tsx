'use client';

import {useActionState, useEffect, useRef, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {usePathname} from '@/i18n/navigation';
import {submitFeedback, type FeedbackSubmitState} from '@/lib/feedback-actions';

type Props = {
  userEmail?: string;
};

const initialState: FeedbackSubmitState = {};

export default function FeedbackFloat({userEmail}: Props) {
  const t = useTranslations('feedback');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pageUrl, setPageUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [state, formAction, pending] = useActionState(submitFeedback, initialState);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setPageUrl(window.location.href);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const currentPaddingRight = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;

    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      triggerRef.current?.focus();
    };
  }, [open]);

  if (pathname.startsWith('/admin')) return null;

  async function uploadImage(file: File | undefined) {
    setUploadError('');
    setImageUrl('');
    setImagePreview('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError(t('imageType'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(t('imageSize'));
      return;
    }
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set('file', file);
      const response = await fetch('/api/feedback-upload', {method: 'POST', body: formData});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t('uploadError'));
      setImageUrl(data.url);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : t('uploadError'));
      setImagePreview('');
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('open')}
        className="fixed bottom-24 start-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-warm to-sun text-navy shadow-[0_8px_24px_rgba(254,153,98,0.5)] transition-transform hover:scale-105"
      >
        <span className="material-symbols-outlined text-[28px]" aria-hidden="true">feedback</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center overscroll-contain bg-navy/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            event.preventDefault();
            setOpen(false);
          }
        }}>
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={t('title')}
            tabIndex={-1}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
            className="max-h-[calc(100dvh-2rem)] w-full overflow-y-auto overscroll-contain rounded-t-3xl bg-snow p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl"
          >
            {state.ok ? (
              <div className="py-8 text-center">
                <span className="material-symbols-outlined text-5xl text-green-600" aria-hidden="true">check_circle</span>
                <p className="mt-3 text-lg font-bold text-navy">{t('success')}</p>
                <button type="button" onClick={() => setOpen(false)} className="mt-6 rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white">{t('close')}</button>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h2 className="font-display text-2xl font-bold text-navy">{t('title')}</h2>
                  <button type="button" onClick={() => setOpen(false)} aria-label={t('cancel')} className="flex h-9 w-9 items-center justify-center rounded-full bg-mist text-navy">
                    <span className="material-symbols-outlined" aria-hidden="true">close</span>
                  </button>
                </div>
                <form action={formAction} className="space-y-4">
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                  <input type="hidden" name="pageUrl" value={pageUrl} />
                  <input type="hidden" name="imageUrl" value={imageUrl} />

                  {state.errors?.form && <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{state.errors.form}</p>}
                  <label className="block text-sm font-bold text-navy">
                    {t('type')}
                    <select name="type" required defaultValue="" className="mt-1 w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-navy">
                      <option value="" disabled>{t('chooseType')}</option>
                      <option value="bug">{t('bug')}</option>
                      <option value="complaint">{t('complaint')}</option>
                      <option value="suggestion">{t('suggestion')}</option>
                    </select>
                    {state.errors?.type && <span className="mt-1 block text-xs font-normal text-red-600">{state.errors.type}</span>}
                  </label>

                  <label className="block text-sm font-bold text-navy">
                    {t('titleLabel')}
                    <input name="title" required maxLength={120} className="mt-1 w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-navy" />
                    {state.errors?.title && <span className="mt-1 block text-xs font-normal text-red-600">{state.errors.title}</span>}
                  </label>

                  <label className="block text-sm font-bold text-navy">
                    {t('description')}
                    <textarea name="message" required maxLength={2000} rows={5} className="mt-1 w-full resize-y rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-navy" />
                    {state.errors?.message && <span className="mt-1 block text-xs font-normal text-red-600">{state.errors.message}</span>}
                  </label>

                  <label className="block text-sm font-bold text-navy">
                    {t('image')}
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => uploadImage(event.target.files?.[0])} className="mt-1 block w-full text-sm text-navy/70 file:me-3 file:rounded-full file:border-0 file:bg-mist file:px-4 file:py-2 file:font-bold file:text-navy" />
                    {(uploadError || state.errors?.imageUrl) && <span className="mt-1 block text-xs font-normal text-red-600">{uploadError || state.errors?.imageUrl}</span>}
                    {uploading && <span className="mt-2 block text-xs text-navy/60">{t('uploading')}</span>}
                    {imagePreview && <img src={imagePreview} alt={t('imagePreview')} className="mt-3 max-h-44 w-full rounded-xl object-contain" />}
                  </label>

                  <label className="block text-sm font-bold text-navy">
                    {t('email')}
                    <input type="email" name="email" defaultValue={userEmail ?? ''} readOnly={Boolean(userEmail)} maxLength={254} placeholder={t('emailOptional')} className="mt-1 w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-navy read-only:bg-mist" />
                    {state.errors?.email && <span className="mt-1 block text-xs font-normal text-red-600">{state.errors.email}</span>}
                  </label>

                  <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                    <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-navy/20 px-5 py-2.5 text-sm font-bold text-navy">{t('cancel')}</button>
                    <button type="submit" disabled={pending || uploading} className="rounded-full bg-gradient-to-r from-brand-warm to-sun px-6 py-2.5 text-sm font-bold text-navy disabled:opacity-60">
                      {pending ? t('sending') : t('send')}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
