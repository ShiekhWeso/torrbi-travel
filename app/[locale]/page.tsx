import {setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Destinations from '@/components/Destinations';
import ValueProps from '@/components/ValueProps';
import PlanWithUs from '@/components/PlanWithUs';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Destinations />
        <ValueProps />
        <PlanWithUs />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
