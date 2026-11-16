import {getTranslations, getLocale} from 'next-intl/server';
import {getContactLinks} from '@/lib/queries';
import {waLink} from '@/lib/whatsapp';
import type {ContactType} from '@/lib/db/schema';
import SocialIcon from '@/components/SocialIcon';

const platforms: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  x: 'X',
  snapchat: 'Snapchat',
  youtube: 'YouTube',
  linkedin: 'LinkedIn'
};

const directIcons: Partial<Record<ContactType, string>> = {
  whatsapp: 'chat',
  phone: 'call',
  email: 'mail',
  address: 'location_on',
  hours: 'schedule'
};

export default async function Contact() {
  const [t, locale, rows] = await Promise.all([getTranslations('contactPage'), getLocale(), getContactLinks()]);
  const social = rows.filter((row) => row.section === 'social');
  const direct = rows.filter((row) => row.section === 'direct');
  const card = 'flex items-center gap-4 rounded-2xl bg-mist p-5';
  const icon = (name: string) => (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-snow">
      <span className="material-symbols-outlined text-sky">{name}</span>
    </span>
  );
  const directLabel = (type: ContactType) => {
    switch (type) {
      case 'whatsapp': return t('whatsapp');
      case 'phone': return t('phone');
      case 'email': return t('email');
      case 'address': return t('address');
      case 'hours': return t('hours');
      default: return platforms[type] ?? type;
    }
  };

  return (
    <section id="contact" className="w-full bg-mist py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-4 lg:px-12">
        <h2 className="font-display text-3xl font-bold text-navy lg:text-5xl">{t('title')}</h2>
        <p className="mb-8 mt-3 max-w-2xl text-lg text-navy/70">{t('subtitle')}</p>

        {social.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-4 font-display text-xl font-bold text-navy">
              {locale === 'ar' ? 'صفحاتنا على التواصل الاجتماعي' : 'Social media'}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {social.map((row) => (
                <a key={row.id} href={row.value} target="_blank" rel="noopener noreferrer" className={`${card} transition-transform hover:-translate-y-1`}>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-snow">
                    <SocialIcon type={row.type} />
                  </span>
                  <div>
                    <p className="text-xs text-navy/60">{platforms[row.type] ?? row.type}</p>
                    <p className="font-bold text-navy" dir="auto">{row.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {direct.length > 0 && (
          <div>
            <h3 className="mb-4 font-display text-xl font-bold text-navy">
              {locale === 'ar' ? 'معلومات التواصل المباشر' : 'Direct contact'}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {direct.map((row) => {
                const localizedLabel = row.i18n?.[locale === 'ar' ? 'ar' : 'en']?.label;
                const label = row.type === 'hours' ? directLabel(row.type) : localizedLabel || directLabel(row.type);
                const value = row.type === 'hours' ? localizedLabel || row.value : row.value;
                const href = row.type === 'whatsapp'
                  ? waLink('', row.value)
                  : row.type === 'phone'
                    ? `tel:${row.value.replace(/[^\d+]/g, '')}`
                    : row.type === 'email'
                      ? `mailto:${row.value}`
                      : null;
                const content = (
                  <>
                    {icon(directIcons[row.type] ?? 'info')}
                    <div>
                      <p className="text-xs text-navy/60">{label}</p>
                      <p className="font-bold text-navy" dir="auto">{value}</p>
                    </div>
                  </>
                );
                return href
                  ? <a key={row.id} href={href} target={row.type === 'whatsapp' ? '_blank' : undefined} rel={row.type === 'whatsapp' ? 'noopener noreferrer' : undefined} className={`${card} transition-transform hover:-translate-y-1`}>{content}</a>
                  : <div key={row.id} className={card}>{content}</div>;
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
