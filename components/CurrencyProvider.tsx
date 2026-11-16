'use client';

import {createContext, useContext, useSyncExternalStore} from 'react';
import {CURRENCIES, DEFAULT_RATES, formatMoney, type Currency, type Rates} from '@/lib/currency';

type Value = {cur: Currency; setCur: (c: Currency) => void; rates: Rates; money: (usd: number) => string};
const getCurrency = (): Currency => {
  const saved = localStorage.getItem('currency');
  return saved && (CURRENCIES as readonly string[]).includes(saved) ? saved as Currency : 'USD';
};
const subscribe = (onStoreChange: () => void) => {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener('currency-change', onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener('currency-change', onStoreChange);
  };
};
const getServerCurrency = (): Currency => 'USD';

const Ctx = createContext<Value>({
  cur: 'USD',
  setCur: () => {},
  rates: DEFAULT_RATES,
  money: (usd) => formatMoney(usd, 'USD', DEFAULT_RATES)
});
export const useCurrency = () => useContext(Ctx);

export default function CurrencyProvider({rates, children}: {rates: Rates; children: React.ReactNode}) {
  const cur = useSyncExternalStore(subscribe, getCurrency, getServerCurrency);
  const setCur = (c: Currency) => {
    localStorage.setItem('currency', c);
    window.dispatchEvent(new Event('currency-change'));
  };
  const money = (usd: number) => formatMoney(usd, cur, rates);
  return <Ctx.Provider value={{cur, setCur, rates, money}}>{children}</Ctx.Provider>;
}
