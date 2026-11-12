export const metadata = {title: 'TORRBI Admin', robots: {index: false, follow: false}};

export default function AdminRoot({children}: {children: React.ReactNode}) {
  return <div dir="ltr">{children}</div>;
}