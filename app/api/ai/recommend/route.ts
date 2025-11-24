export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';


import { NextRequest } from 'next/server';
import { getAuthSession, errorResponse, successResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { redis } from '@/lib/redis-mock';

// Mock AI logic to generate recommendations
function generateRecommendations(userBooks: any[]) {
    // Collect genres/authors
    const authors = new Set<string>();
    const categories = new Set<string>();

    userBooks.forEach(ub => {
        if(ub.book.authors) ub.book.authors.split(',').forEach((a: string) => authors.add(a.trim()));
        if(ub.book.categories) ub.book.categories.split(',').forEach((c: string) => categories.add(c.trim()));
    });

    // Mock recommendations
    return [
        {
            id: 'mock-1',
            title: `Book inspired by ${Array.from(authors)[0] || 'Unknown'}`,
            authors: 'AI Author',
            description: 'A thrilling generated adventure.',
            thumbnail: 'https://via.placeholder.com/128x196.png?text=AI+Rec'
        },
        {
            id: 'mock-2',
            title: `Best of ${Array.from(categories)[0] || 'Fiction'}`,
            authors: 'Smart Bot',
            description: 'Deep learning applied to storytelling.',
            thumbnail: 'https://via.placeholder.com/128x196.png?text=AI+Rec+2'
        }
    ];
}

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || !session.user?.email) return errorResponse("Unauthorized", 401);

  const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { userBooks: { include: { book: true } } }
  });

  if (!user) return errorResponse("User not found", 404);

  // Check cache
  const cacheKey = `recommendations:${user.id}`;
  const cachedRecs = redis.get(cacheKey);
  if (cachedRecs) {
      console.log('Returning cached recommendations');
      return successResponse(cachedRecs);
  }

  // Generate recommendations
  const recommendations = generateRecommendations(user.userBooks);

  // Cache for 1 hour
  redis.set(cacheKey, recommendations, 3600);

  return successResponse(recommendations);
}
