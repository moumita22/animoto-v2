import { prisma } from '@/lib/prisma';
import { MovieReview } from '@prisma/client';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import AdminDashboardView from '@/components/admin/AdminDashboardView';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Admin Dashboard | AnimoView',
};

interface AdminPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await getAdminSession();

  if (!session.authenticated) {
    return <AdminLoginForm />;
  }

  const resolvedParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedParams.page || '1', 10) || 1);
  const pageSize = 20;
  const skip = (currentPage - 1) * pageSize;

  let totalReviews = 0;
  let publishedCount = 0;
  let avgRating = '0.0';
  let movies: MovieReview[] = [];

  try {
    const [totalCount, liveCount, ratingAgg, paginatedMovies] = await Promise.all([
      prisma.movieReview.count(),
      prisma.movieReview.count({ where: { published: true } }),
      prisma.movieReview.aggregate({
        _avg: { rating: true },
        where: { published: true },
      }),
      prisma.movieReview.findMany({
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip,
      }),
    ]);

    totalReviews = totalCount;
    publishedCount = liveCount;
    avgRating = (ratingAgg._avg.rating || 0).toFixed(1);
    movies = paginatedMovies;
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
  }

  const totalPages = Math.ceil(totalReviews / pageSize);

  return (
    <AdminDashboardView
      movies={movies}
      totalReviews={totalReviews}
      publishedCount={publishedCount}
      avgRating={avgRating}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
}
