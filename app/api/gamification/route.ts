import { NextRequest } from 'next/server';
import { getAuthSession, errorResponse, successResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || !session.user?.email) return errorResponse("Unauthorized", 401);

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return errorResponse("User not found", 404);

  try {
    const userBadges = await prisma.userBadge.findMany({
      where: { userId: user.id },
      include: { badge: true }
    });

    const booksReadCount = await prisma.userBook.count({
        where: { userId: user.id, status: 'COMPLETED' }
    });

    // Calculate total pages read (simple sum of current pages)
    const allBooks = await prisma.userBook.findMany({ where: { userId: user.id } });
    const totalPagesRead = allBooks.reduce((acc, b) => acc + b.currentPage, 0);

    return successResponse({
        badges: userBadges,
        stats: {
            booksRead: booksReadCount,
            totalPagesRead: totalPagesRead
        }
    });
  } catch (error) {
    return errorResponse("Failed to fetch gamification data", 500);
  }
}
