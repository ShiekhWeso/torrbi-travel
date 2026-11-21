import {getLocale} from 'next-intl/server';
import {and, asc, desc, eq, ilike, or, sql} from 'drizzle-orm';
import {tr} from '@/lib/adminT';
import {db} from '@/lib/db';
import {bookings, users} from '@/lib/db/schema';
import {bookingRef} from '@/lib/bookingRef';
import {setBookingStatus} from '../../actions';

const st = {
  pending: {cls: 'bg-[#F2C14E]/25 text-[#8a6410]', bar: 'border-[#F2C14E]', icon: '⏳', en: 'Pending', ar: 'معلق'},
  confirmed: {cls: 'bg-[#16a34a]/15 text-[#15803d]', bar: 'border-[#16a34a]', icon: '✔', en: 'Confirmed', ar: 'مؤكد'},
  cancelled: {cls: 'bg-[#ef4444]/15 text-[#b91c1c]', bar: 'border-[#ef4444]', icon: '✖', en: 'Cancelled', ar: 'ملغي'}
} as const;
const pageSize = 20;
const statusValues = ['pending', 'confirmed', 'cancelled', 'all'] as const;
const kindValues = ['all', 'package', 'activity'] as const;
const sortValues = ['newest', 'travel'] as const;
type StatusFilter = (typeof statusValues)[number];
type KindFilter = (typeof kindValues)[number];
type SortOrder = (typeof sortValues)[number];
type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export default async function Page({searchParams}: {searchParams: Promise<SearchParams>}) {
  const [locale, search] = await Promise.all([getLocale(), searchParams]);
  const t = tr(locale);
  const ar = locale === 'ar';
  const statusParam = first(search.status);
  const kindParam = first(search.kind);
  const sortParam = first(search.sort);
  const status: StatusFilter = statusValues.includes(statusParam as StatusFilter) ? statusParam as StatusFilter : 'pending';
  const kind: KindFilter = kindValues.includes(kindParam as KindFilter) ? kindParam as KindFilter : 'all';
  const sort: SortOrder = sortValues.includes(sortParam as SortOrder) ? sortParam as SortOrder : 'newest';
  const q = (first(search.q) ?? '').trim().slice(0, 100);
  const requestedPage = first(search.page) ?? '';
  const parsedPage = /^\d+$/.test(requestedPage) ? Number(requestedPage) : 1;
  const pageNumber = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const refMatch = q.match(/^(?:TB-)?(\d+)$/i);
  const refId = refMatch ? Number(refMatch[1]) : null;
  const pattern = `%${q}%`;
  const searchFilter = q
    ? or(
        ilike(sql<string>`'TB-' || lpad(${bookings.id}::text, 4, '0')`, pattern),
        refId != null && Number.isSafeInteger(refId) ? eq(bookings.id, refId) : undefined,
        ilike(bookings.packageTitle, pattern),
        ilike(users.name, pattern),
        ilike(users.email, pattern),
        ilike(users.phone, pattern),
        ilike(bookings.phone, pattern)
      )
    : undefined;
  const filteredBy = and(
    status === 'all' ? undefined : eq(bookings.status, status),
    kind === 'all' ? undefined : eq(bookings.kind, kind),
    searchFilter
  );

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const tomorrow = new Date(todayStart);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextSevenDays = new Date(todayStart);
  nextSevenDays.setDate(nextSevenDays.getDate() + 7);
  const today = todayStart.toISOString().slice(0, 10);
  const sevenDaysEnd = nextSevenDays.toISOString().slice(0, 10);

  const countRows = await db.select({
    status: bookings.status,
    count: sql<number>`count(*)`.mapWith(Number),
    newToday: sql<number>`count(*) filter (where ${bookings.createdAt} >= ${todayStart} and ${bookings.createdAt} < ${tomorrow})`.mapWith(Number),
    travelling: sql<number>`count(*) filter (where ${bookings.status} <> 'cancelled' and ${bookings.travelDate} >= ${today} and ${bookings.travelDate} < ${sevenDaysEnd})`.mapWith(Number),
    filteredCount: sql<number>`count(*) filter (where ${filteredBy ?? sql`true`})`.mapWith(Number)
  }).from(bookings)
    .leftJoin(users, eq(bookings.userId, users.id))
    .groupBy(bookings.status);

  const countForStatus = (value: string) => countRows.find((row) => row.status === value)?.count ?? 0;
  const pendingCount = countForStatus('pending');
  const confirmedCount = countForStatus('confirmed');
  const cancelledCount = countForStatus('cancelled');
  const allCount = sum(countRows.map((row) => row.count));
  const newTodayCount = sum(countRows.map((row) => row.newToday));
  const travellingCount = sum(countRows.map((row) => row.travelling));
  const filteredCount = sum(countRows.map((row) => row.filteredCount));
  const pageCount = Math.max(1, Math.ceil(filteredCount / pageSize));
  const page = Math.min(pageNumber, pageCount);
  const offset = (page - 1) * pageSize;
  const rows = await db.select({
    b: bookings,
    name: users.name,
    email: users.email,
    phone: users.phone,
    nationality: users.nationality
  }).from(bookings)
    .innerJoin(users, eq(bookings.userId, users.id))
    .where(filteredBy)
    .orderBy(
      sort === 'travel' ? asc(bookings.travelDate) : desc(bookings.createdAt),
      desc(bookings.createdAt)
    )
    .limit(pageSize)
    .offset(offset);

  const paramsFor = (nextPage?: number, nextStatus = status) => {
    const params = new URLSearchParams();
    params.set('status', nextStatus);
    if (q) params.set('q', q);
    params.set('kind', kind);
    params.set('sort', sort);
    if (nextPage != null) params.set('page', String(nextPage));
    return `?${params.toString()}`;
  };
  const statusTabs: {value: StatusFilter; label: string; count: number}[] = [
    {value: 'pending', label: t.pending, count: pendingCount},
    {value: 'confirmed', label: t.confirmed, count: confirmedCount},
    {value: 'cancelled', label: t.cancelled, count: cancelledCount},
    {value: 'all', label: t.allBookings, count: allCount}
  ];
  const firstResult = filteredCount === 0 ? 0 : offset + 1;
  const lastResult = Math.min(offset + rows.length, filteredCount);
  const range = t.paginationRange
    .replace('{start}', String(firstResult))
    .replace('{end}', String(lastResult))
    .replace('{total}', String(filteredCount));
  const numbers = [...new Set([1, page - 2, page - 1, page, page + 1, page + 2, pageCount]
    .filter((value) => value >= 1 && value <= pageCount))].sort((a, b) => a - b);
  const pagination: (number | 'ellipsis')[] = [];
  numbers.forEach((value, index) => {
    if (index > 0 && value - numbers[index - 1] > 1) pagination.push('ellipsis');
    pagination.push(value);
  });
  const emptyMessage = q || kind !== 'all'
    ? t.noMatchingBookings
    : status === 'pending'
      ? t.emptyPending
      : status === 'confirmed'
        ? t.emptyConfirmed
        : status === 'cancelled'
          ? t.emptyCancelled
          : t.emptyAll;
  const Field = ({k, v}: {k: string; v: React.ReactNode}) => (
    <div><span className="text-navy/50">{k}: </span><span className="font-semibold text-navy">{v || '-'}</span></div>
  );

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">{t.bookings}</h1>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <a href="?status=pending" className="rounded-2xl bg-navy p-4 text-snow shadow-sm transition hover:bg-navy/90">
          <span className="text-sm text-snow/70">{t.pendingNow}</span>
          <span className="mt-1 block font-display text-3xl font-bold">{pendingCount}</span>
        </a>
        <div className="rounded-2xl bg-snow p-4 shadow-sm">
          <span className="text-sm text-navy/60">{t.newToday}</span>
          <span className="mt-1 block font-display text-3xl font-bold text-navy">{newTodayCount}</span>
        </div>
        <div className="rounded-2xl bg-snow p-4 shadow-sm">
          <span className="text-sm text-navy/60">{t.travellingNext7Days}</span>
          <span className="mt-1 block font-display text-3xl font-bold text-navy">{travellingCount}</span>
        </div>
      </div>

      <nav aria-label={t.bookingStatusFilters} className="mb-5 flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <a
            key={tab.value}
            href={paramsFor(undefined, tab.value)}
            aria-current={status === tab.value ? 'page' : undefined}
            className={`rounded-full px-4 py-2 text-sm font-bold ${status === tab.value ? 'bg-navy text-snow' : 'bg-snow text-navy hover:bg-mist'}`}
          >
            {tab.label} <span className={status === tab.value ? 'text-snow/70' : 'text-navy/50'}>({tab.count})</span>
          </a>
        ))}
      </nav>

      <div className="mb-5 flex flex-wrap items-end gap-2 rounded-2xl bg-snow p-4">
        <form method="get" className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_minmax(150px,1fr)_minmax(150px,1fr)_auto]">
          <input type="hidden" name="status" value={status} />
          <label className="text-xs font-bold text-navy/70">
            {t.searchBookings}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder={t.bookingSearchPlaceholder}
              className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm font-normal text-navy"
            />
          </label>
          <label className="text-xs font-bold text-navy/70">
            {t.kind}
            <select name="kind" defaultValue={kind} className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm font-normal text-navy">
              <option value="all">{t.allBookings}</option>
              <option value="package">{t.packageKind}</option>
              <option value="activity">{t.activityKind}</option>
            </select>
          </label>
          <label className="text-xs font-bold text-navy/70">
            {t.sort}
            <select name="sort" defaultValue={sort} className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm font-normal text-navy">
              <option value="newest">{t.newestFirst}</option>
              <option value="travel">{t.travelDateSort}</option>
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button className="rounded-full bg-navy px-5 py-2 text-sm font-bold text-white">{t.apply}</button>
          </div>
        </form>
        <form method="get">
          <input type="hidden" name="status" value="pending" />
          <button className="rounded-full border border-navy/20 px-5 py-2 text-sm font-bold text-navy">{t.reset}</button>
        </form>
      </div>

      <div className="space-y-3">
        {rows.length === 0 && <p className="rounded-2xl bg-snow p-6 text-navy/60">{emptyMessage}</p>}
        {rows.map(({b, name, email, phone, nationality}) => {
          const s = st[b.status as keyof typeof st] ?? st.pending;
          const waitingMs = now.getTime() - b.createdAt.getTime();
          const waiting = b.status === 'pending' && waitingMs > 4 * 60 * 60 * 1000;
          const waitingDays = Math.floor(waitingMs / (24 * 60 * 60 * 1000));
          const waitingHours = Math.floor(waitingMs / (60 * 60 * 1000));
          const waitingLabel = waitingMs > 48 * 60 * 60 * 1000
            ? t.waitingDays.replace('{value}', String(waitingDays))
            : t.waitingHours.replace('{value}', String(waitingHours));
          const phoneValue = b.phone || phone;
          return (
            <article key={b.id} className={`overflow-hidden rounded-2xl border-s-4 bg-snow ${waiting ? 'border-[#ef4444]' : s.bar}`}>
              <div className="grid gap-3 p-3 md:grid-cols-[minmax(160px,1.4fr)_minmax(150px,1.2fr)_110px_70px_90px_110px_auto] md:items-center md:p-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-navy/50">{bookingRef(b.id)}</p>
                  <p className="break-words font-bold text-navy">{b.packageTitle}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-mist px-2 py-0.5 text-[10px] font-bold text-navy/70">
                      {b.kind === 'activity' ? t.activityKind : t.packageKind}
                    </span>
                    {b.couponCode && (
                      <span className="rounded-full bg-brand-warm/25 px-2 py-0.5 text-[10px] font-bold text-navy">
                        {t.coupon} {b.couponCode} · -${b.discountUsd ?? 0}
                      </span>
                    )}
                    {waiting && <span className="rounded-full bg-[#ef4444]/10 px-2 py-0.5 text-[10px] font-bold text-[#b91c1c]">{waitingLabel}</span>}
                  </div>
                </div>
                <div className="min-w-0 text-sm">
                  <p className="truncate font-bold text-navy">{name}</p>
                  {phoneValue && <p className="truncate text-xs text-navy/60">{phoneValue}</p>}
                  <p className="truncate text-xs text-navy/60">{email}</p>
                </div>
                <div className="text-sm">
                  <span className="block text-[10px] font-bold text-navy/45 md:hidden">{t.travelDate}</span>
                  <span className="font-semibold text-navy">{b.travelDate}</span>
                </div>
                <div className="text-sm">
                  <span className="block text-[10px] font-bold text-navy/45 md:hidden">{t.guests}</span>
                  <span className="font-semibold text-navy">{b.pax}</span>
                </div>
                <div className="text-sm">
                  <span className="block text-[10px] font-bold text-navy/45 md:hidden">{t.total}</span>
                  <span className="font-semibold text-navy">{b.totalUsd != null ? `$${b.totalUsd}` : '—'}</span>
                </div>
                <div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${s.cls}`}>
                    <span aria-hidden="true">{s.icon}</span>{s[ar ? 'ar' : 'en']}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  {b.status !== 'confirmed' && (
                    <form action={setBookingStatus}>
                      <input type="hidden" name="id" value={b.id} />
                      <button name="status" value="confirmed" className="rounded-full bg-[#16a34a] px-3 py-1.5 text-xs font-bold text-white">
                        {t.confirm}
                      </button>
                    </form>
                  )}
                  {b.status !== 'cancelled' && (
                    <form action={setBookingStatus}>
                      <input type="hidden" name="id" value={b.id} />
                      <button name="status" value="cancelled" className="rounded-full border border-red-500 px-3 py-1.5 text-xs font-bold text-red-600">
                        {t.cancel}
                      </button>
                    </form>
                  )}
                </div>
              </div>
              <details className="border-t border-navy/10">
                <summary className="cursor-pointer px-4 py-2 text-sm font-bold text-sky hover:bg-mist/60">{t.details}</summary>
                <div className="grid gap-2 px-4 pb-4 text-sm sm:grid-cols-2">
                  <Field k={t.name} v={name} />
                  <Field k={t.email} v={email} />
                  <Field k={t.phone} v={phoneValue && <a href={`tel:${phoneValue}`} className="underline">{phoneValue}</a>} />
                  <Field k={t.nationality} v={nationality} />
                  <Field k={t.travelDate} v={b.travelDate} />
                  <Field k={t.returnDate} v={b.returnDate} />
                  <Field k={t.adults} v={b.adults} />
                  <Field k={t.children} v={b.children} />
                  <Field k={t.infants} v={b.infants} />
                  <Field k={t.total} v={b.totalUsd != null ? `$${b.totalUsd}` : null} />
                  <Field k={t.coupon} v={b.couponCode && `${b.couponCode} (-$${b.discountUsd ?? 0})`} />
                  <Field k="Lang" v={b.lang.toUpperCase()} />
                  <Field k="Created" v={b.createdAt.toLocaleString()} />
                  <div className="sm:col-span-2"><Field k={t.notes} v={b.notes} /></div>
                </div>
              </details>
            </article>
          );
        })}
      </div>

      {filteredCount > 0 && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-navy/60">{range}</p>
          <nav aria-label={t.pagination} className="flex flex-wrap items-center gap-1">
            {page > 1
              ? <a href={paramsFor(page - 1)} className="rounded-lg bg-snow px-3 py-2 text-sm font-bold text-navy">{t.previous}</a>
              : <span className="rounded-lg bg-snow/60 px-3 py-2 text-sm text-navy/40">{t.previous}</span>}
            {pagination.map((value, index) => value === 'ellipsis'
              ? <span key={`ellipsis-${index}`} className="px-1 text-navy/50">…</span>
              : <a
                  key={value}
                  href={paramsFor(value)}
                  aria-current={page === value ? 'page' : undefined}
                  className={`min-w-9 rounded-lg px-3 py-2 text-center text-sm font-bold ${page === value ? 'bg-navy text-white' : 'bg-snow text-navy'}`}
                >
                  {value}
                </a>)}
            {page < pageCount
              ? <a href={paramsFor(page + 1)} className="rounded-lg bg-snow px-3 py-2 text-sm font-bold text-navy">{t.next}</a>
              : <span className="rounded-lg bg-snow/60 px-3 py-2 text-sm text-navy/40">{t.next}</span>}
          </nav>
        </div>
      )}
    </div>
  );
}
