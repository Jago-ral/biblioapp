import { NextRequest } from 'next/server';
import { getAuthSession, errorResponse, successResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { redis } from '@/lib/redis-mock';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) return errorResponse("Query parameter 'q' is required");

  // Cache key
  const cacheKey = `local-search:${query}`;
  const cachedResults = redis.get(cacheKey);

  if (cachedResults) {
    console.log('Returning cached local search results');
    return successResponse(cachedResults);
  }

  try {
    // Attempt full text search if enabled in Prisma and DB
    // Fallback to contains for standard compatibility
    const books = await prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { authors: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 20
    });

    // Cache results for 5 minutes
    redis.set(cacheKey, books, 300);

    return successResponse(books);
  } catch (error) {
    console.error("Local search error:", error);
    return errorResponse("Failed to search local books", 500);
  }
}
