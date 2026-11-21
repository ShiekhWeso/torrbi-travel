'use client';

import {Link, usePathname} from '@/i18n/navigation';

type AdminNavProps = {
  items: readonly (readonly [label: string, href: string])[];
  pendingCount: number;
  feedbackCount?: number;
};

export default function AdminNav({items, pendingCount, feedbackCount = 0}: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1">
      {items.map(([label, href]) => {
        const active = pathname === href || (href !== '/admin' && pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${active ? 'bg-brand-warm text-navy' : 'text-navy hover:bg-mist'}`}
          >
            {label}
            {href === '/admin/bookings' && pendingCount > 0 && (
              <span className="ms-2 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">{pendingCount}</span>
            )}
            {href === '/admin/feedback' && feedbackCount > 0 && (
              <span className="ms-2 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">{feedbackCount}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
