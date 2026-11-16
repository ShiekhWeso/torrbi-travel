import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {getContactLinks} from '@/lib/queries';

export default async function Footer() {
  const [t, nav, c, links] = await Promise.all([
    getTranslations('footer'),
    getTranslations('nav'),
    getTranslations('contactPage'),
    getContactLinks()
  ]);
  const phone = links.find((link) => link.section === 'direct' && link.type === 'phone');
  const email = links.find((link) => link.section === 'direct' && link.type === 'email');
  const instagram = links.find((link) => link.section === 'social' && link.type === 'instagram');

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
          <div className="flex flex-col gap-6">
            <nav className="flex flex-col gap-2 text-sm font-bold">
              <Link href="/#about" className="hover:text-navy">{nav('about')}</Link>
              <Link href="/#contact" className="hover:text-navy">{nav('contact')}</Link>
            </nav>
            <div className="flex flex-col gap-2 text-sm">
              {phone && (
                <a href={`tel:${phone.value.replace(/[^\d+]/g, '')}`} className="hover:text-navy">
                  <span className="material-symbols-outlined me-2 text-[18px] text-sky">call</span>
                  {c('phone')}: <span dir="ltr">{phone.value}</span>
                </a>
              )}
              {email && (
                <a href={`mailto:${email.value}`} className="hover:text-navy">
                  <span className="material-symbols-outlined me-2 text-[18px] text-sky">mail</span>
                  {c('email')}: <span dir="ltr">{email.value}</span>
                </a>
              )}
              {instagram && (
                <a href={instagram.value} target="_blank" rel="noopener noreferrer" className="hover:text-navy">
                  <span className="material-symbols-outlined me-2 text-[18px] text-sky">photo_camera</span>
                  {c('instagram')}: <span dir="ltr">{instagram.value}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <p className="pt-6 border-t border-navy/10 text-sm">{t('rights')}</p>
      </div>
    </footer>
  );
}
