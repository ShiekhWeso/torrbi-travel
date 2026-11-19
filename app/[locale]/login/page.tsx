import AuthForm from '@/components/AuthForm';

export default async function Page({searchParams}: {searchParams: Promise<{error?: string; returnTo?: string}>}) {
  const {error, returnTo} = await searchParams;
  return <AuthForm mode="login" googleError={error === 'google'} returnTo={returnTo} />;
}