'use client';

import {useLocale} from 'next-intl';

export default function ConfirmButton({
  className,
  children,
  message
}: {
  className?: string;
  children: React.ReactNode;
  message?: {en: string; ar: string};
}) {
  const ar = useLocale() === 'ar';
  const text = message
    ? ar ? message.ar : message.en
    : ar ? 'هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this? This cannot be undone.';
  return (
    <button
      className={className}
      onClick={(e) => {
        if (!window.confirm(text)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
