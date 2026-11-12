import {db} from '@/lib/db';
import {packages, destinations, offers} from '@/lib/db/schema';
import {getLocale} from 'next-intl/server';
import {tr} from '@/lib/adminT';

export default async function Dashboard() {
  const t = tr(await getLocale());
  const [p, d, o] = await Promise.all([db.$count(packages), db.$count(destinations), db.$count(offers)]);
  const cards = [[t.packages, p], [t.destinations, d], [t.offers, o]] as const;

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-navy">{t.dashboard}</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map(([label, n]) => (
          <div key={label} className="rounded-2xl bg-snow p-6 shadow-[0_8px_24px_rgba(15,24,89,0.06)]">
            <p className="text-sm text-navy/60">{label}</p>
            <p className="font-display text-4xl font-bold text-navy">{n}</p>
          </div>
        ))}
      </div>
    </>
  );
}