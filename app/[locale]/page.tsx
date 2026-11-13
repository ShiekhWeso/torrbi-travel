import {setRequestLocale} from 'next-intl/server';
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
import {getDestinations} from '@/lib/queries';
import Offers from '@/components/Offers';

export const revalidate = 3600;

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const dests = await getDestinations(locale);

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Packages />
        <Offers />
        <Destinations destinations={dests} />
        <ValueProps />
        <About />
        <Contact />
        <PlanWithUs />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
