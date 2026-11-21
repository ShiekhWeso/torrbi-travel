'use client';

import {useLocale} from 'next-intl';

export default function ConfirmButton({
  className,
  children,
  message,
  type = 'submit',
  disabled
}: {
  className?: string;
  children: React.ReactNode;
  message?: {en: string; ar: string};
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  const ar = useLocale() === 'ar';
  const text = message
    ? ar ? message.ar : message.en
    : ar ? 'هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this? This cannot be undone.';
  return (
    <button
      type={type}
      className={className}
      disabled={disabled}
      onClick={(e) => {
        if (!window.confirm(text)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
