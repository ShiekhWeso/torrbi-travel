import {assertAuthSecret} from '@/lib/auth';

export function register() {
  if (process.env.NODE_ENV === 'production') assertAuthSecret();
}
