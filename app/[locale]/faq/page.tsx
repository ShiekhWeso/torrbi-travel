import {getTranslations, setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {getFaqs} from '@/lib/queries';

export function generateStaticParams() {
  return ['en', 'ar'].map((locale) => ({locale}));
}

export default async function FaqPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('faqPage');
  const faqs = await getFaqs(locale);

  return (
    <>
      <Header />
      <main className="bg-snow pb-20 pt-32">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-12">
          <h1 className="font-display text-3xl font-bold text-navy lg:text-5xl">{t('title')}</h1>
          <p className="mb-8 mt-3 max-w-2xl text-lg text-navy/70">{t('subtitle')}</p>
          {faqs.length === 0 ? (
            <p className="text-navy/60">{t('empty')}</p>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details key={faq.id} className="group rounded-2xl bg-mist p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-navy">
                    <span>{faq.question}</span>
                    <span className="material-symbols-outlined shrink-0 transition-transform group-open:rotate-180">
                      expand_more
                    </span>
                  </summary>
                  <p className="pe-8 pt-3 text-navy/70">{faq.answer}</p>
                </details>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
