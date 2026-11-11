import Image from 'next/image';
import {useTranslations} from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="w-full bg-mist text-navy/70">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-12 pt-12 pb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 pb-8">
          <div className="space-y-3 max-w-sm">
            <div className="flex items-center gap-3">
              <Image src="/logo.webp" alt="" width={40} height={40} className="rounded-full" />
              <span className="font-display font-bold text-xl text-navy tracking-wide">TORRBI TRAVEL</span>
            </div>
            <p className="text-sm">{t('about')}</p>
          </div>
        </div>

        <p className="pt-6 border-t border-navy/10 text-sm">{t('rights')}</p>
      </div>
    </footer>
  );
}
