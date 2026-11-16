import type {ContactType} from '@/lib/db/schema';

const paths: Record<Extract<ContactType, 'instagram' | 'facebook' | 'tiktok' | 'x' | 'snapchat' | 'youtube' | 'linkedin'>, React.ReactNode> = {
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="18" cy="6" r="1" fill="currentColor" stroke="none" /></>,
  facebook: <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.3v3h2.8v8z" fill="currentColor" stroke="none" />,
  tiktok: <path d="M16 3c.4 2.4 1.8 3.8 4 4v3.2a9 9 0 0 1-4-1.2v6.2a5.5 5.5 0 1 1-5.5-5.5c.4 0 .8 0 1.2.1v3.4a2.3 2.3 0 1 0 1.1 2V3z" fill="currentColor" stroke="none" />,
  x: <path d="M4 3h4.8l4.3 5.8L18 3h2l-6 7 6.5 11h-4.8l-4.7-6.4L5 21H3l6.5-7.7zm3.8 2 9 14h1.5l-9-14z" fill="currentColor" stroke="none" />,
  snapchat: <path d="M12 3.2c-2.4 0-3.8 1.8-3.8 4.5 0 .8.1 1.7.2 2.5-.6.3-1.4.2-2-.2-.3-.2-.7-.1-.9.2-.2.4 0 .8.4 1 1 .5 1.9.5 2.5.4-.7 1.3-1.7 2.6-3.1 3.3-.5.3-1 .5-1.8.7-.5.1-.6.7-.2 1 .7.5 1.7.7 2.5.7.4.8 1.1 1.1 2.1.9.6 1.2 1.7 1.8 4.1 1.8s3.5-.6 4.1-1.8c1 .2 1.7-.1 2.1-.9.8 0 1.8-.2 2.5-.7.4-.3.3-.9-.2-1-.8-.2-1.3-.4-1.8-.7-1.4-.7-2.4-2-3.1-3.3.6.1 1.5.1 2.5-.4.4-.2.6-.6.4-1-.2-.3-.6-.4-.9-.2-.6.4-1.4.5-2 .2.1-.8.2-1.7.2-2.5 0-2.7-1.4-4.5-3.8-4.5z" fill="currentColor" stroke="none" />,
  youtube: <><rect x="2.5" y="5" width="19" height="14" rx="4" /><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" /></>,
  linkedin: <><path d="M5 8.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zM3.5 10h3v10h-3zM9 10h2.9v1.4h.1c.4-.8 1.4-1.7 2.9-1.7 3.1 0 3.6 2 3.6 4.6V20h-3v-5c0-1.2 0-2.7-1.7-2.7s-1.9 1.3-1.9 2.6V20H9z" fill="currentColor" stroke="none" /></>
};

export default function SocialIcon({type}: {type: ContactType}) {
  if (!(type in paths)) return null;
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-sky">
      {paths[type as keyof typeof paths]}
    </svg>
  );
}
