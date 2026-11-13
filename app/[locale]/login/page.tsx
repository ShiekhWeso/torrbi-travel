import AuthForm from '@/components/AuthForm';

export default async function Page({searchParams}: {searchParams: Promise<{error?: string}>}) {
  const {error} = await searchParams;
  return <AuthForm mode="login" googleError={error === 'google'} />;
}