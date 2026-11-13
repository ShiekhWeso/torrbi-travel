import {useLocale, useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {waLink} from '@/lib/whatsapp';

export default function WhatsAppFloat() {
  const t = useTranslations();
  const ar = useLocale() === 'ar';
  return (
    <>
      <a
        href={waLink(t('wa.plan'))}
        target="_blank"
        rel="noopener"
        aria-label={t('floatWhatsapp')}
        className="fixed bottom-24 end-5 z-50 w-14 h-14 rounded-full bg-brand-warm text-navy shadow-[0_8px_24px_rgba(254,153,98,0.5)] flex items-center justify-center hover:scale-110 transition-transform"
      >
        <span className="material-symbols-outlined text-[28px]">chat</span>
      </a>
      <Link
        href="/faq"
        aria-label={ar ? 'الأسئلة الشائعة' : 'FAQ'}
        className="fixed bottom-5 end-5 z-50 w-14 h-14 rounded-full bg-[#ef4444] text-snow shadow-[0_8px_24px_rgba(239,68,68,0.45)] flex items-center justify-center hover:scale-110 transition-transform"
      >
        <span className="material-symbols-outlined text-[28px]">question_mark</span>
      </Link>
    </>
  );
}