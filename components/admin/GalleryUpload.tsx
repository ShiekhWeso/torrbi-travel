'use client';

import Image from 'next/image';
import {useRef, useState} from 'react';
import {errorMessage, uploadImage} from './imageUploadUtils';

export default function GalleryUpload({name, defaultValue, label}: {name: string; defaultValue: string; label: string}) {
  const [images, setImages] = useState(() => defaultValue.split(/\r?\n/).map((url) => url.trim()).filter(Boolean));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function chooseFiles(files: File[]) {
    if (!files.length) return;
    setLoading(true);
    setError('');
    const errors: string[] = [];
    for (const file of files) {
      try {
        const url = await uploadImage(file);
        setImages((current) => [...current, url]);
      } catch (uploadError) {
        errors.push(`${file.name}: ${errorMessage(uploadError)}`);
      }
    }
    setError(errors.join(' '));
    setLoading(false);
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-navy">{label}</p>
      <textarea name={name} value={images.join('\n')} readOnly className="hidden" />
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((url, index) => (
            <div key={`${url}-${index}`} className="space-y-1">
              <Image src={url} alt={`${label} ${index + 1}`} width={240} height={160} sizes="(min-width: 768px) 240px, 50vw" className="h-28 w-full rounded-xl object-cover" />
              <button
                type="button"
                disabled={loading}
                onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                className="text-sm font-bold text-red-600 disabled:opacity-50"
              >
                Remove / حذف
              </button>
            </div>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);
          event.currentTarget.value = '';
          void chooseFiles(files);
        }}
      />
      <button type="button" disabled={loading} onClick={() => inputRef.current?.click()} className="rounded-full bg-mist px-4 py-2 text-sm font-bold text-navy disabled:opacity-50">
        Choose images / اختيار صور
      </button>
      {loading && <p className="text-sm text-navy/70">Uploading... / جارٍ الرفع...</p>}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
