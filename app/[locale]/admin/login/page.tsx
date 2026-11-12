'use client';

import {useActionState} from 'react';
import {login} from '../actions';

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, null);
  const input = 'w-full rounded-xl bg-mist px-4 py-3 font-bold text-navy focus:outline-none';

  return (
    <main className="flex min-h-screen items-center justify-center bg-mist p-4">
      <form action={action} className="w-full max-w-sm space-y-4 rounded-3xl bg-snow p-8 shadow-[0_16px_40px_rgba(15,24,89,0.08)]">
        <h1 className="font-display text-2xl font-bold text-navy">TORRBI Admin</h1>
        <input name="email" type="email" required placeholder="Email" className={input} />
        <input name="password" type="password" required placeholder="Password" className={input} />
        {error && <p className="text-sm font-bold text-[#ef4444]">{error}</p>}
        <button
          disabled={pending}
          className="w-full rounded-full bg-brand-warm py-3 font-bold text-navy transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {pending ? '...' : 'Log in'}
        </button>
      </form>
    </main>
  );
}