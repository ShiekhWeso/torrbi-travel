import {getTranslations} from 'next-intl/server';
import {contact} from '@/lib/contact';
import {waLink} from '@/lib/whatsapp';

export default async function Contact() {
  const t = await getTranslations('contactPage');
  const w = await getTranslations('wa');

  const rows = [
    ['chat', t('whatsapp'), t('chatNow'), waLink(w('plan'))],
    ['call', t('phone'), contact.phone, `tel:${contact.phone.replace(/\s/g, '')}`],
    ['mail', t('email'), contact.email, `mailto:${contact.email}`],
    ['photo_camera', t('instagram'), `@${contact.instagram}`, `https://instagram.com/${contact.instagram}`]
  ] as const;

  const card = 'flex items-center gap-4 rounded-2xl bg-mist p-5';
  const icon = (n: string) => (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-snow">
      <span className="material-symbols-outlined text-sky">{n}</span>
    </span>
  );

  return (
    <section id="contact" className="w-full bg-mist py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-4 lg:px-12">
        <h2 className="font-display text-3xl font-bold text-navy lg:text-5xl">{t('title')}</h2>
        <p className="mb-8 mt-3 max-w-2xl text-lg text-navy/70">{t('subtitle')}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map(([ic, label, value, href]) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel="noopener"
              className={`${card} transition-transform hover:-translate-y-1`}
            >
              {icon(ic)}
              <div>
                <p className="text-xs text-navy/60">{label}</p>
                <p className="font-bold text-navy" dir="auto">{value}</p>
              </div>
            </a>
          ))}
          <div className={card}>
            {icon('schedule')}
            <div>
              <p className="text-xs text-navy/60">{t('hours')}</p>
              <p className="font-bold text-navy">{t('hoursText')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
