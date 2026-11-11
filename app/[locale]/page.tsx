import {setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Destinations from '@/components/Destinations';
import FlightDeals from '@/components/FlightDeals';
import ValueProps from '@/components/ValueProps';
import PlanWithUs from '@/components/PlanWithUs';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';

export default async function Home({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main className="w-full pt-20 flex-grow bg-surface">
        <Hero />
        <Destinations />
        <FlightDeals />
        <ValueProps />
        <PlanWithUs />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
