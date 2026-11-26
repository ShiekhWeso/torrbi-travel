export const metadata = {title: 'TORRBI Admin', robots: {index: false, follow: false}};

export default async function AdminRoot({children}: {children: React.ReactNode}) {
  return <div dir="rtl">{children}</div>;
}