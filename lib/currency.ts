export const CURRENCIES = ['USD', 'MYR'] as const;
export type Currency = (typeof CURRENCIES)[number];
export type Rates = Record<Currency, number>;
export const DEFAULT_RATES: Rates = {USD: 1, MYR: 4.5};
export const SYMBOL: Record<Currency, string> = {USD: '$', MYR: 'RM '};
export const formatMoney = (usd: number, cur: Currency, rates: Rates) =>
  `${SYMBOL[cur]}${Math.round(usd * (rates[cur] ?? 1)).toLocaleString('en-US')}`;
