import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import MovieForm from '@/components/admin/MovieForm';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Edit Movie Review | Admin',
};

export default async function AdminEditMoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    redirect('/admin');
  }

  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId) || numericId <= 0) {
    notFound();
  }

  const movie = await prisma.movieReview.findUnique({
    where: { id: numericId },
  });

  if (!movie) {
    notFound();
  }

  return <MovieForm initialData={movie} isEdit={true} />;
}
