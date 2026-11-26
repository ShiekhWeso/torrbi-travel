'use client';

import {useState} from 'react';
import {tr} from '@/lib/adminT';

export default function AdminPasswordField({name, required = true}: {name: string; required?: boolean}) {
  const t = tr('ar');
  const [value, setValue] = useState('');
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  function generate() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const digits = '23456789';
    const randomIndex = (length: number) => {
      const random = new Uint32Array(1);
      crypto.getRandomValues(random);
      return random[0] % length;
    };
    const chars = [
      letters[randomIndex(letters.length)],
      digits[randomIndex(digits.length)],
      ...Array.from({length: 18}, () => alphabet[randomIndex(alphabet.length)])
    ];
    for (let index = chars.length - 1; index > 0; index--) {
      const swap = randomIndex(index + 1);
      [chars[index], chars[swap]] = [chars[swap], chars[index]];
    }
    setValue(chars.join(''));
    setGenerated(true);
    setCopied(false);
  }

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-navy">
        {t.temporaryPassword}
        <input
          name={name}
          type={generated ? 'text' : 'password'}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setGenerated(false);
          }}
          minLength={8}
          maxLength={72}
          required={required}
          autoComplete="new-password"
          className="mt-1 w-full rounded-xl border border-navy/15 bg-white px-3 py-2 font-normal"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={generate} className="rounded-full bg-mist px-4 py-2 text-sm font-bold text-navy">
          {t.generatePassword}
        </button>
        {generated && value && (
          <button type="button" onClick={copy} className="rounded-full bg-mist px-4 py-2 text-sm font-bold text-navy">
            {copied ? t.copied : t.copyPassword}
          </button>
        )}
      </div>
    </div>
  );
}
