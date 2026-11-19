import AuthForm from '@/components/AuthForm';

export default async function Page({searchParams}: {searchParams: Promise<{returnTo?: string}>}) {
  const {returnTo} = await searchParams;
  return <AuthForm mode="signup" returnTo={returnTo} />;
}