import {useTranslations} from 'next-intl';
import {waLink} from '@/lib/whatsapp';

export default function WhatsAppFloat() {
  const t = useTranslations();
  return (
    <a
      href={waLink(t('wa.plan'))}
      target="_blank"
      rel="noopener"
      aria-label={t('floatWhatsapp')}
      className="fixed bottom-5 end-5 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
    >
      <span className="material-symbols-outlined text-[28px]">chat</span>
    </a>
  );
}
