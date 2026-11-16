'use client';

import {useCurrency} from '@/components/CurrencyProvider';

export default function Price({usd}: {usd: number | null | undefined}) {
  const {money} = useCurrency();
  return usd == null ? null : <>{money(usd)}</>;
}
