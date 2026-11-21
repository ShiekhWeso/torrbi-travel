import {getTranslations, setRequestLocale} from 'next-intl/server';
import Link from 'next/link';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Destinations from '@/components/Destinations';
import Packages from '@/components/Packages';
import ValueProps from '@/components/ValueProps';
import About from '@/components/About';
import Contact from '@/components/Contact';
import PlanWithUs from '@/components/PlanWithUs';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import {getDestinations, getFaqs, getSearchDurations} from '@/lib/queries';
import Offers from '@/components/Offers';

export const revalidate = 3600;

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const [dests, durations, faqs, faqTranslations] = await Promise.all([
    getDestinations(locale),
    getSearchDurations(locale),
    getFaqs(locale),
    getTranslations('homeFaq')
  ]);
  const heroDestinations = dests.map(({id, name}) => ({id, name}));
  const homeDestinations = dests.slice(0, 5).map(({id, image, name, country, rating, best, flight, temp}) => ({
    id,
    image,
    name,
    country,
    rating,
    best,
    flight,
    temp
  }));

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero destinations={heroDestinations} durations={durations} />
        <Packages />
        <PlanWithUs />
        <Offers />
        <Destinations destinations={homeDestinations} />
        <ValueProps />
        <About />
        {faqs.length > 0 && (
          <section className="w-full bg-snow py-16 lg:py-24">
            <div className="mx-auto max-w-[1440px] px-4 lg:px-12">
              <div className="mb-10 lg:mb-14">
                <h2 className="font-display text-3xl font-bold text-navy lg:text-5xl">
                  {faqTranslations('title')}
                </h2>
                <span className="mt-4 block h-1.5 w-16 rounded-full bg-gradient-to-r from-brand-warm to-sun" />
                <p className="mt-4 max-w-2xl text-lg text-navy/70">{faqTranslations('subtitle')}</p>
              </div>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <details key={faq.id} className="group rounded-2xl bg-mist p-5" open={index === 0}>
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
              <div className="mt-8">
                <Link href={`/${locale}/faq`} className="font-bold text-sky underline underline-offset-4">
                  {faqTranslations('seeAll')}
                </Link>
              </div>
            </div>
          </section>
        )}
        <Contact />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
