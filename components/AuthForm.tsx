'use client';

import {useActionState} from 'react';
import {useLocale} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {signup, userLogin} from '@/lib/user-actions';

export default function AuthForm({mode, googleError}: {mode: 'login' | 'signup'; googleError?: boolean}) {
  const ar = useLocale() === 'ar';
  const t = (en: string, a: string) => (ar ? a : en);
  const isLogin = mode === 'login';
  const [error, action, pending] = useActionState(isLogin ? userLogin : signup, null);
  const input = 'w-full rounded-xl bg-mist px-4 py-3 font-bold text-navy focus:outline-none';
  const msg = error || (googleError ? t('Google sign-in failed', 'فشل تسجيل الدخول عبر Google') : null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-4 pb-16 pt-28">
      <div className="w-full max-w-sm space-y-4 rounded-3xl bg-snow p-8 shadow-[0_16px_40px_rgba(15,24,89,0.08)]">
        <Link href="/" className="mb-4 flex w-fit items-center gap-1 text-sm font-bold text-sky">
        <span className="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_back</span>
        {t('Back to home', 'العودة للرئيسية')}
        </Link>
        <h1 className="font-display text-2xl font-bold leading-normal text-navy">
          {isLogin ? t('Log in', 'تسجيل الدخول') : t('Create account', 'إنشاء حساب')}
        </h1>
        <a
          href={`/api/auth/google?locale=${ar ? 'ar' : 'en'}`}
          className="flex w-full items-center justify-center rounded-full border-2 border-navy/15 py-3 font-bold text-navy transition-colors hover:bg-mist"
        >
          {t('Continue with Google', 'المتابعة عبر Google')}
        </a>
        <p className="text-center text-xs text-navy/50">{t('or', 'أو')}</p>
        <form action={action} className="space-y-4">
          {!isLogin && <input name="name" required placeholder={t('Full name', 'الاسم الكامل')} className={input} />}
          <input name="email" type="email" required placeholder={t('Email', 'البريد الإلكتروني')} className={input} />
          {!isLogin && <input name="phone" type="tel" placeholder={t('Phone (optional)', 'الهاتف (اختياري)')} className={input} />}
          <input name="password" type="password" required minLength={isLogin ? undefined : 8} placeholder={t('Password', 'كلمة المرور')} className={input} />
          {msg && <p className="text-sm font-bold text-[#ef4444]">{msg}</p>}
          <button
            disabled={pending}
            className="w-full rounded-full bg-brand-warm py-3 font-bold text-navy transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {pending ? '...' : isLogin ? t('Log in', 'دخول') : t('Sign up', 'إنشاء الحساب')}
          </button>
        </form>
        <p className="text-center text-sm text-navy/70">
          {isLogin ? t('No account?', 'ليس لديك حساب؟') : t('Have an account?', 'لديك حساب؟')}{' '}
          <Link href={isLogin ? '/signup' : '/login'} className="font-bold text-sky">
            {isLogin ? t('Sign up', 'إنشاء حساب') : t('Log in', 'تسجيل الدخول')}
          </Link>
        </p>
      </div>
    </main>
  );
}