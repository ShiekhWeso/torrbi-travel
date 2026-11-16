'use client';

import {useState, useTransition} from 'react';
import {Link} from '@/i18n/navigation';
import {toggleFavorite} from '@/lib/user-actions';

type Props = {
  kind: 'package' | 'activity';
  id: number;
  active: boolean;
  loggedIn: boolean;
};

const className = 'inline-flex h-11 w-11 items-center justify-center rounded-full bg-mist text-navy transition-colors hover:bg-sky-light/40';

export default function FavoriteButton({kind, id, active, loggedIn}: Props) {
  const [isActive, setIsActive] = useState(active);
  const [pending, startTransition] = useTransition();
  const icon = <span className="material-symbols-outlined text-[22px]">favorite</span>;

  if (!loggedIn) {
    return (
      <Link href="/login" aria-label="Save to favorites" className={className}>
        {icon}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={isActive ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={isActive}
      disabled={pending}
      onClick={() => startTransition(async () => {
        await toggleFavorite(kind, id);
        setIsActive((value) => !value);
      })}
      className={`${className} ${isActive ? 'text-red-600' : ''}`}
    >
      {icon}
    </button>
  );
}
