import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { validateAdminApiRequest, setAdminCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const auth = await validateAdminApiRequest(request);
  if (!auth.authorized) {
    return auth.errorResponse;
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Both current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Lookup user in PostgreSQL
    const adminUser = await prisma.adminUser.findUnique({
      where: { id: auth.payload.userId },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin account not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, adminUser.passwordHash);
    if (!isCurrentValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { passwordHash: newHash },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });

    // Slide 40-minute window forward
    setAdminCookie(response, auth.refreshedToken);
    return response;
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Failed to change password. Please try again.' },
      { status: 500 }
    );
  }
}
