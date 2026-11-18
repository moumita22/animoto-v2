import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateAdminApiRequest, setAdminCookie } from '@/lib/auth';

// Update existing movie review
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateAdminApiRequest(request);
  if (!auth.authorized) {
    return auth.errorResponse;
  }

  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId) || numericId <= 0) {
    return NextResponse.json({ error: 'Invalid movie ID' }, { status: 400 });
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

    const movie = await prisma.movieReview.update({
      where: { id: numericId },
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
    // Slide 40-minute window forward
    setAdminCookie(response, auth.refreshedToken);
    return response;
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Movie review not found' }, { status: 404 });
    }
    console.error('Update movie error:', error);
    return NextResponse.json({ error: err?.message || 'Failed to update review' }, { status: 500 });
  }
}

// Delete movie review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateAdminApiRequest(request);
  if (!auth.authorized) {
    return auth.errorResponse;
  }

  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId) || numericId <= 0) {
    return NextResponse.json({ error: 'Invalid movie ID' }, { status: 400 });
  }

  try {
    await prisma.movieReview.delete({
      where: { id: numericId },
    });
    const response = NextResponse.json({ success: true });
    // Slide 40-minute window forward
    setAdminCookie(response, auth.refreshedToken);
    return response;
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Movie review not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
