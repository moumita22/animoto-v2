import { redirect } from 'next/navigation';
import MovieForm from '@/components/admin/MovieForm';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Add New Movie Review | Admin',
};

export default async function AdminNewMoviePage() {
  const session = await getAdminSession();
  if (!session.authenticated) {
    redirect('/admin');
  }

  return <MovieForm />;
}
