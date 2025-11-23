// lib/api-utils.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function getAuthSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return null;
  }
  return session;
}

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}
