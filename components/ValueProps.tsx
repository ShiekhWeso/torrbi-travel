import {useTranslations} from 'next-intl';

const items = [
  {k: 'v1', icon: 'lock', box: 'bg-sky-light/40 text-sky'},
  {k: 'v2', icon: 'confirmation_number', box: 'bg-sun/30 text-navy'},
  {k: 'v3', icon: 'translate', box: 'bg-sunset/25 text-navy'}
] as const;

export default function ValueProps() {
  const t = useTranslations('values');
  return (
    <section id="why" className="w-full bg-snow py-16 lg:py-24">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((i) => (
          <div key={i.k} className="p-6 lg:p-8 rounded-2xl bg-mist">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${i.box}`}>
              <span className="material-symbols-outlined text-[26px]">{i.icon}</span>
            </div>
            <h3 className="font-display font-bold text-xl text-navy mb-1">{t(`${i.k}.title`)}</h3>
            <p className="text-sm text-navy/70">{t(`${i.k}.text`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
