'use client';

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
  const text = message?.ar ?? 'هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.';
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
