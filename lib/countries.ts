const EXCLUDE = new Set([
  'AC', 'AN', 'BU', 'CP', 'CQ', 'CS', 'DD', 'DG', 'DY', 'EA', 'EU', 'EZ', 'FX', 'HV', 'IC',
  'NH', 'QO', 'RH', 'SU', 'TA', 'TP', 'UK', 'UN', 'VD', 'XA', 'XB', 'YD', 'YU', 'ZR', 'ZZ'
]);

export type Country = {code: string; ar: string; en: string};
let cache: Country[] | null = null;

export function getCountries(): Country[] {
  if (cache) return cache;
  const ar = new Intl.DisplayNames(['ar'], {type: 'region', fallback: 'none'});
  const en = new Intl.DisplayNames(['en'], {type: 'region', fallback: 'none'});
  const list: Country[] = [];
  for (let a = 65; a <= 90; a++) {
    for (let b = 65; b <= 90; b++) {
      const code = String.fromCharCode(a, b);
      if (EXCLUDE.has(code)) continue;
      const nameAr = ar.of(code);
      const nameEn = en.of(code);
      if (nameAr && nameEn) list.push({code, ar: nameAr, en: nameEn});
    }
  }
  cache = list.sort((x, y) => x.ar.localeCompare(y.ar, 'ar'));
  return cache;
}

export const findCountryByCode = (code: string) => getCountries().find((c) => c.code === code);

export const findCountryByName = (name?: string) => {
  const n = name?.trim();
  return n ? getCountries().find((c) => c.ar === n || c.en === n) : undefined;
};