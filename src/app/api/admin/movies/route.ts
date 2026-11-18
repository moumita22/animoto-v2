import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateAdminApiRequest, setAdminCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const auth = await validateAdminApiRequest(request);
  if (!auth.authorized) {
    return auth.errorResponse;
  }

  try {
    const body = await request.json();
    const {
      title,
      slug,
      year,
      genre,
      language,
      director,
      rating,
      posterUrl,
      backdropUrl,
      trailerUrl,
      synopsis,
      lifeLessons,
      featured,
      published,
    } = body;

    // Check if slug is already taken
    const existing = await prisma.movieReview.findUnique({
      where: { slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'A review with this URL slug already exists. Please choose a unique slug.' },
        { status: 400 }
      );
    }

    const movie = await prisma.movieReview.create({
      data: {
        title,
        slug,
        year,
        genre,
        language: language || 'English',
        director,
        rating,
        posterUrl,
        backdropUrl: backdropUrl || posterUrl,
        trailerUrl: trailerUrl || null,
        synopsis,
        lifeLessons,
        featured: Boolean(featured),
        published: Boolean(published),
      },
    });

    const response = NextResponse.json({ success: true, movie });
    // Slide the 40-minute window forward
    setAdminCookie(response, auth.refreshedToken);
    return response;
  } catch (error: unknown) {
    console.error('Create movie error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create movie review';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
