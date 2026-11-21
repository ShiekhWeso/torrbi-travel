'use client';

import Image from 'next/image';
import {useRef, useState} from 'react';
import {errorMessage, uploadImage} from './imageUploadUtils';

export default function ImageUpload({name, defaultValue, label}: {name: string; defaultValue: string; label: string}) {
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function chooseFile(file?: File) {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      setValue(await uploadImage(file));
    } catch (uploadError) {
      setError(errorMessage(uploadError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-navy">{label}</p>
      {value && (
        <Image src={value} alt={label} width={320} height={200} sizes="320px" className="max-h-48 w-auto max-w-full rounded-xl object-cover" />
      )}
      <input type="hidden" name={name} value={value} />
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          void chooseFile(file);
        }}
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={loading} onClick={() => inputRef.current?.click()} className="rounded-full bg-mist px-4 py-2 text-sm font-bold text-navy disabled:opacity-50">
          Choose image / اختيار صورة
        </button>
        {value && (
          <button type="button" disabled={loading} onClick={() => {setValue(''); setError('');}} className="rounded-full border border-navy/20 px-4 py-2 text-sm font-bold text-navy disabled:opacity-50">
            Remove / حذف
          </button>
        )}
      </div>
      {loading && <p className="text-sm text-navy/70">Uploading... / جارٍ الرفع...</p>}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
