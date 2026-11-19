export function safeActivityReturnTo(value: string | null | undefined, locale: string) {
  if (!value || (locale !== 'en' && locale !== 'ar')) return null;

  try {
    const url = new URL(value, 'https://local.invalid');
    const path = new RegExp(`^/${locale}/activities/[^/]+/(?:book|pay|confirmed)$`);
    if (url.origin !== 'https://local.invalid' || url.hash || !path.test(url.pathname)) return null;
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}
