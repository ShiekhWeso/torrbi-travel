import {useTranslations} from 'next-intl';

const items = [
  {k: 'v1', icon: 'lock', box: 'bg-secondary-fixed/50 text-secondary'},
  {k: 'v2', icon: 'confirmation_number', box: 'bg-tertiary-fixed/60 text-on-tertiary-container'},
  {k: 'v3', icon: 'translate', box: 'bg-primary-fixed/50 text-primary-container'}
] as const;

export default function ValueProps() {
  const t = useTranslations('values');
  return (
    <section id="why" className="w-full bg-surface pb-space-xl lg:pb-24">
      <div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {items.map((i) => (
          <div key={i.k} className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-space-md ${i.box}`}>
              <span className="material-symbols-outlined text-[26px]">{i.icon}</span>
            </div>
            <div>
              <h3 className="font-title-lg text-title-lg text-primary mb-1">{t(`${i.k}.title`)}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{t(`${i.k}.text`)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
