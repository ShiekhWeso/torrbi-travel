import {getLocale} from 'next-intl/server';
import {count, desc, eq, sql} from 'drizzle-orm';
import {db} from '@/lib/db';
import {feedback, users} from '@/lib/db/schema';
import {tr} from '@/lib/adminT';
import ConfirmButton from '@/components/admin/ConfirmButton';
import {deleteFeedback, updateFeedback} from '@/lib/feedback-actions';

const pageSize = 20;
const statuses = ['new', 'in_progress', 'done', 'all'] as const;
type StatusFilter = (typeof statuses)[number];
type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function FeedbackPage({searchParams}: {searchParams: Promise<SearchParams>}) {
  const [locale, search] = await Promise.all([getLocale(), searchParams]);
  const t = tr(locale);
  const statusParam = first(search.status);
  const status: StatusFilter = statuses.includes(statusParam as StatusFilter) ? statusParam as StatusFilter : 'new';
  const requestedPage = first(search.page) ?? '';
  const parsedPage = /^\d+$/.test(requestedPage) ? Number(requestedPage) : 1;
  const pageNumber = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const countRows = await db.select({
    status: feedback.status,
    count: sql<number>`count(*)`.mapWith(Number)
  }).from(feedback).groupBy(feedback.status);
  const countFor = (value: string) => countRows.find((row) => row.status === value)?.count ?? 0;
  const counts = {
    new: countFor('new'),
    in_progress: countFor('in_progress'),
    done: countFor('done'),
    all: countRows.reduce((total, row) => total + row.count, 0)
  };
  const [totalRow] = await db.select({value: count()}).from(feedback);
  const where = status === 'all' ? undefined : eq(feedback.status, status);
  const filteredCount = status === 'all' ? (totalRow?.value ?? 0) : counts[status];
  const pageCount = Math.max(1, Math.ceil(filteredCount / pageSize));
  const page = Math.min(pageNumber, pageCount);
  const rows = await db.select({
    item: feedback,
    senderName: users.name,
    senderEmail: users.email
  }).from(feedback)
    .leftJoin(users, eq(feedback.userId, users.id))
    .where(where)
    .orderBy(desc(feedback.createdAt), desc(feedback.id))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const paramsFor = (nextStatus: StatusFilter, nextPage?: number) => {
    const params = new URLSearchParams();
    params.set('status', nextStatus);
    if (nextPage != null) params.set('page', String(nextPage));
    return `?${params.toString()}`;
  };
  const returnTo = `${paramsFor(status, page)}`;
  const tabs: {value: StatusFilter; label: string; count: number}[] = [
    {value: 'new', label: t.feedbackNew, count: counts.new},
    {value: 'in_progress', label: t.feedbackInProgress, count: counts.in_progress},
    {value: 'done', label: t.feedbackDone, count: counts.done},
    {value: 'all', label: t.feedbackAll, count: counts.all}
  ];
  const typeLabel = (value: string) => value === 'bug'
    ? t.feedbackBug
    : value === 'complaint'
      ? t.feedbackComplaint
      : t.feedbackSuggestion;
  const typeClass = (value: string) => value === 'bug'
    ? 'bg-red-100 text-red-700'
    : value === 'complaint'
      ? 'bg-amber-100 text-amber-800'
      : 'bg-sky/15 text-sky';

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-bold text-navy">{t.feedbackTitle}</h1>
      <nav aria-label={t.status} className="mb-5 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <a key={tab.value} href={paramsFor(tab.value)} aria-current={status === tab.value ? 'page' : undefined}
            className={`rounded-full px-4 py-2 text-sm font-bold ${status === tab.value ? 'bg-navy text-snow' : 'bg-snow text-navy hover:bg-mist'}`}>
            {tab.label} <span className={status === tab.value ? 'text-snow/70' : 'text-navy/50'}>({tab.count})</span>
          </a>
        ))}
      </nav>

      <div className="space-y-3">
        {rows.length === 0 && (
          <p className="rounded-2xl bg-snow p-6 text-navy/60">{t.feedbackAll === 'All' ? 'No feedback in this list.' : 'لا توجد ملاحظات في هذه القائمة.'}</p>
        )}
        {rows.map(({item, senderName, senderEmail}) => {
          const sender = senderName || senderEmail || item.email || t.feedbackGuest;
          const mailSubject = encodeURIComponent(`[Feedback ${item.id}] ${item.title}`);
          const mailBody = encodeURIComponent(item.message);
          return (
            <article key={item.id} className="overflow-hidden rounded-2xl bg-snow shadow-sm">
              <div className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_180px_150px] md:items-center">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${typeClass(item.type)}`}>{typeLabel(item.type)}</span>
                    <span className="text-xs text-navy/50">{item.createdAt.toLocaleString(locale === 'ar' ? 'ar' : 'en')}</span>
                  </div>
                  <p className="break-words font-bold text-navy">{item.title}</p>
                  <p className="mt-1 truncate text-sm text-navy/60">{t.feedbackSender}: {sender}</p>
                </div>
                {item.pageUrl ? (
                  <a href={item.pageUrl} target="_blank" rel="noopener" className="truncate text-sm font-bold text-sky underline underline-offset-4">{t.feedbackPage}</a>
                ) : <span className="text-sm text-navy/40">-</span>}
                <details className="md:col-start-1 md:col-span-3">
                  <summary className="cursor-pointer text-sm font-bold text-sky">{t.details}</summary>
                  <div className="mt-4 space-y-4">
                    <p className="whitespace-pre-wrap break-words rounded-xl bg-mist p-4 text-sm text-navy">{item.message}</p>
                    {item.imageUrl && (
                      <a href={item.imageUrl} target="_blank" rel="noopener" className="block">
                        <img src={item.imageUrl} alt={item.title} className="max-h-96 w-full rounded-xl object-contain bg-mist" />
                      </a>
                    )}
                    {item.email && (
                      <a href={`mailto:${encodeURIComponent(item.email)}?subject=${mailSubject}&body=${mailBody}`} className="inline-flex rounded-full bg-sky px-4 py-2 text-sm font-bold text-white">
                        {t.feedbackReply}
                      </a>
                    )}
                    <form action={updateFeedback} className="grid gap-3 rounded-xl border border-navy/10 p-4 sm:grid-cols-[180px_minmax(0,1fr)_auto] sm:items-end">
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="returnTo" value={`/${locale}/admin/feedback${returnTo}`} />
                      <label className="text-xs font-bold text-navy/70">
                        {t.status}
                        <select name="status" defaultValue={item.status} className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm text-navy">
                          <option value="new">{t.feedbackNew}</option>
                          <option value="in_progress">{t.feedbackInProgress}</option>
                          <option value="done">{t.feedbackDone}</option>
                        </select>
                      </label>
                      <label className="text-xs font-bold text-navy/70">
                        {t.feedbackAdminNote}
                        <textarea name="adminNote" defaultValue={item.adminNote ?? ''} maxLength={2000} rows={3} className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm text-navy" />
                      </label>
                      <button type="submit" className="rounded-full bg-navy px-5 py-2 text-sm font-bold text-white">{t.save}</button>
                    </form>
                    <form action={deleteFeedback} className="inline-block">
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="returnTo" value={`/${locale}/admin/feedback${returnTo}`} />
                      <ConfirmButton message={{en: t.feedbackDeleteConfirm, ar: tr('ar').feedbackDeleteConfirm}} className="rounded-full border border-red-500 px-4 py-2 text-sm font-bold text-red-600">
                        {t.delete}
                      </ConfirmButton>
                    </form>
                  </div>
                </details>
              </div>
            </article>
          );
        })}
      </div>

      {filteredCount > pageSize && (
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-sm text-navy/60">{page}/{pageCount}</span>
          <div className="flex gap-2">
            {page > 1 && <a href={paramsFor(status, page - 1)} className="rounded-lg bg-snow px-3 py-2 text-sm font-bold text-navy">{t.previous}</a>}
            {page < pageCount && <a href={paramsFor(status, page + 1)} className="rounded-lg bg-snow px-3 py-2 text-sm font-bold text-navy">{t.next}</a>}
          </div>
        </div>
      )}
    </div>
  );
}
