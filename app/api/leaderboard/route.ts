import { NextRequest } from 'next/server';
import { getAuthSession, errorResponse, successResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { redis } from '@/lib/redis-mock';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  // Check cache first
  const cacheKey = 'leaderboard:global';
  const cachedLeaderboard = redis.get(cacheKey);

  if (cachedLeaderboard) {
    return successResponse(cachedLeaderboard);
  }

  try {
    // Correctly fetch top users by completed books count using Prisma's relation ordering
    // This requires Prisma 5+ features for orderBy relations
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        _count: {
            select: {
                userBooks: { where: { status: 'COMPLETED' } },
                userBadges: true
            }
        }
      },
      orderBy: {
        userBooks: {
          _count: 'desc'
        }
      },
      take: 10
    });

    const leaderboard = users.map(u => {
        const booksRead = u._count.userBooks;
        const badgesCount = u._count.userBadges;
        return {
            id: u.id,
            name: u.name || 'Anonymous',
            image: u.image,
            booksRead,
            badgesCount,
            score: (booksRead * 10) + (badgesCount * 5)
        };
    }).sort((a, b) => b.score - a.score); // Re-sort by score just in case badge count changes the order slightly from pure book count

    redis.set(cacheKey, leaderboard, 600);

    return successResponse(leaderboard);
  } catch (error) {
    console.error("Leaderboard error:", error);
    return errorResponse("Failed to fetch leaderboard", 500);
  }
}
