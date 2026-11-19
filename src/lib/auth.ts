import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const SESSION_COOKIE_NAME = 'admin_token';
export const INACTIVITY_TIMEOUT_MS = 40 * 60 * 1000; // 40 minutes

export interface SessionPayload {
  userId: number;
  username: string;
  lastActive: number; // timestamp in ms
}

function getSecretKey(): string {
  return (
    process.env.SESSION_SECRET ||
    'animoview-secure-secret-key-cinema-wisdom'
  );
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token
 */
export function createAdminToken(user: { id: number; username: string }): string {
  const payload: SessionPayload = {
    userId: user.id,
    username: user.username,
    lastActive: Date.now(),
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSecretKey())
    .update(payloadStr)
    .digest('base64url');

  return `${payloadStr}.${signature}`;
}

/**
 * Verifies the token signature and enforces the 40-minute inactivity window
 */
export function verifyAdminToken(token: string | null | undefined): {
  valid: boolean;
  payload?: SessionPayload;
  reason?: 'missing' | 'invalid_format' | 'tampered' | 'inactive_expired';
} {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'missing' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, reason: 'invalid_format' };
  }

  const [payloadStr, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', getSecretKey())
    .update(payloadStr)
    .digest('base64url');

  // Constant-time comparison to prevent timing attacks
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSig);
  if (
    sigBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return { valid: false, reason: 'tampered' };
  }

  try {
    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadStr, 'base64url').toString('utf8')
    );

    // Check 40-minute inactivity limit
    const idleTime = Date.now() - payload.lastActive;
    if (idleTime > INACTIVITY_TIMEOUT_MS) {
      return { valid: false, payload, reason: 'inactive_expired' };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, reason: 'invalid_format' };
  }
}

/**
 * Checks session inside Server Components (app/admin/page.tsx, etc.)
 */
export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const result = verifyAdminToken(token);

  if (!result.valid || !result.payload) {
    return {
      authenticated: false,
      reason: result.reason,
    };
  }

  return {
    authenticated: true,
    user: {
      id: result.payload.userId,
      username: result.payload.username,
    },
  };
}

/**
 * Validates request inside Route Handlers (/api/admin/*)
 * Also returns a refreshed token to slide the 40-minute window forward
 */
export async function validateAdminApiRequest(request: NextRequest): Promise<
  | { authorized: true; payload: SessionPayload; refreshedToken: string }
  | { authorized: false; errorResponse: NextResponse }
> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const result = verifyAdminToken(token);

  if (!result.valid || !result.payload) {
    const res = NextResponse.json(
      {
        error:
          result.reason === 'inactive_expired'
            ? 'Session expired due to 40 minutes of inactivity. Please log in again.'
            : 'Unauthorized',
      },
      { status: 401 }
    );
    res.cookies.delete(SESSION_COOKIE_NAME);
    return { authorized: false, errorResponse: res };
  }

  // Generate refreshed token with current timestamp to slide the 40-min window
  const refreshedToken = createAdminToken({
    id: result.payload.userId,
    username: result.payload.username,
  });

  return {
    authorized: true,
    payload: result.payload,
    refreshedToken,
  };
}

/**
 * Helper to attach the rolled 40-minute cookie to any NextResponse
 */
export function setAdminCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: INACTIVITY_TIMEOUT_MS / 1000, // 40 minutes (2400 seconds)
    path: '/',
  });
}
