import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createAdminToken, SESSION_COOKIE_NAME, INACTIVITY_TIMEOUT_MS } from '@/lib/auth';

interface RateLimitRecord {
  attempts: number;
  lockoutUntil: number; // timestamp in ms
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes lockout

// In-memory attempt store keyed by IP
const rateLimitMap = new Map<string, RateLimitRecord>();

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  return forwardedFor?.split(',')[0].trim() || realIp || '127.0.0.1';
}

function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts: number; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // If locked out, check if lockout has expired
  if (record.lockoutUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  // Reset if lockout window has passed
  if (record.lockoutUntil > 0 && record.lockoutUntil <= now) {
    rateLimitMap.delete(ip);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  return { allowed: true, remainingAttempts: Math.max(0, MAX_ATTEMPTS - record.attempts) };
}

function recordFailedAttempt(ip: string): { remainingAttempts: number; lockoutTriggered: boolean } {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { attempts: 0, lockoutUntil: 0 };
  record.attempts += 1;

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockoutUntil = now + LOCKOUT_WINDOW_MS;
    rateLimitMap.set(ip, record);
    return { remainingAttempts: 0, lockoutTriggered: true };
  }

  rateLimitMap.set(ip, record);
  return { remainingAttempts: MAX_ATTEMPTS - record.attempts, lockoutTriggered: false };
}

function clearRateLimit(ip: string) {
  rateLimitMap.delete(ip);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // 1. Check rate limit before executing intensive operations
  const rateStatus = checkRateLimit(ip);
  if (!rateStatus.allowed) {
    const minutesRemaining = Math.max(1, Math.ceil((rateStatus.retryAfterSeconds || 60) / 60));
    return NextResponse.json(
      { error: `Too many failed login attempts. Please wait ${minutesRemaining} minute${minutesRemaining === 1 ? '' : 's'} before trying again.` },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateStatus.retryAfterSeconds || 900),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const username = (body.username || '').trim().toLowerCase();
    const password = body.password || '';

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Lookup user in PostgreSQL database
    const adminUser = await prisma.adminUser.findUnique({
      where: { username },
    });

    if (!adminUser) {
      const fail = recordFailedAttempt(ip);
      const remainingMsg = fail.lockoutTriggered
        ? 'Too many failed login attempts. Locked out for 15 minutes.'
        : `Invalid username or password. (${fail.remainingAttempts} attempt${fail.remainingAttempts === 1 ? '' : 's'} remaining)`;
      return NextResponse.json({ error: remainingMsg }, { status: fail.lockoutTriggered ? 429 : 401 });
    }

    // Verify bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, adminUser.passwordHash);
    if (!isPasswordValid) {
      const fail = recordFailedAttempt(ip);
      const remainingMsg = fail.lockoutTriggered
        ? 'Too many failed login attempts. Locked out for 15 minutes.'
        : `Invalid username or password. (${fail.remainingAttempts} attempt${fail.remainingAttempts === 1 ? '' : 's'} remaining)`;
      return NextResponse.json({ error: remainingMsg }, { status: fail.lockoutTriggered ? 429 : 401 });
    }

    // Login successful: Reset rate limit tracker for this IP
    clearRateLimit(ip);

    // Create 40-minute server auth token
    const token = createAdminToken({
      id: adminUser.id,
      username: adminUser.username,
    });

    const response = NextResponse.json({
      success: true,
      user: { username: adminUser.username },
    });

    // Set secure httpOnly cookie with 40-minute maxAge
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: INACTIVITY_TIMEOUT_MS / 1000, // 2400 seconds (40 mins)
      path: '/',
    });

    // Clean up any old legacy cookie
    response.cookies.delete('admin_session');

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error during login' }, { status: 500 });
  }
}
