'use client';

import {useState} from 'react';

export default function CopyCouponCode({code, ar}: {code: string; ar: boolean}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const copy = async () => {
    setCopied(false);
    setFailed(false);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch (error) {
      console.error('Failed to copy coupon code', error);
      setFailed(true);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-full bg-navy px-4 py-2 text-sm font-bold text-snow"
    >
      {copied ? (ar ? 'تم النسخ' : 'Copied') : failed ? (ar ? 'تعذر النسخ' : 'Copy failed') : (ar ? 'نسخ' : 'Copy')}
    </button>
  );
}
