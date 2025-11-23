import { NextRequest } from 'next/server';
import { getAuthSession, errorResponse, successResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || !session.user?.email) return errorResponse("Unauthorized", 401);

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return errorResponse("User not found", 404);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  try {
    const where: any = { userId: user.id };
    if (status) {
      where.status = status;
    }

    const userBooks = await prisma.userBook.findMany({
      where,
      include: {
        book: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    return successResponse(userBooks);
  } catch (error) {
    return errorResponse("Failed to fetch user books", 500);
  }
}

// PATCH: Update status, progress, rating
export async function PATCH(req: NextRequest) {
    const session = await getAuthSession();
    if (!session || !session.user?.email) return errorResponse("Unauthorized", 401);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return errorResponse("User not found", 404);

    const body = await req.json();
    const { userBookId, status, currentPage, rating } = body;

    if (!userBookId) return errorResponse("Missing userBookId");

    try {
        const updateData: any = {};
        if (status) updateData.status = status;
        if (currentPage !== undefined) updateData.currentPage = currentPage;
        if (rating !== undefined) updateData.rating = rating;

        const updated = await prisma.userBook.update({
            where: { id: userBookId },
            data: updateData,
            include: { book: true }
        });

        // BADGE CHECK LOGIC
        // 1. 100 Pages Badge
        if (currentPage) {
            // Aggregation of pages read is complex if we track sessions, but for simple MVP,
            // we might just sum up current pages of all books or check this specific book
            // Let's check total pages across all books for "100 Pages Lues" badge
            // (This is a simplification, real logic would sum ReadingSessions)
             const allBooks = await prisma.userBook.findMany({ where: { userId: user.id } });
             const totalPages = allBooks.reduce((acc, b) => acc + b.currentPage, 0);

             if (totalPages >= 100) {
                 const badge = await prisma.badge.findUnique({ where: { code: '100_PAGES' } });
                 if (badge) {
                      await prisma.userBadge.create({
                          data: { userId: user.id, badgeId: badge.id }
                      }).catch(() => {});
                 }
             }
        }

        // 2. Bookworm (5 books read)
        if (status === 'COMPLETED') {
             const completedCount = await prisma.userBook.count({
                 where: { userId: user.id, status: 'COMPLETED' }
             });
             if (completedCount >= 5) {
                 const badge = await prisma.badge.findUnique({ where: { code: 'BOOKWORM' } });
                 if (badge) {
                      await prisma.userBadge.create({
                          data: { userId: user.id, badgeId: badge.id }
                      }).catch(() => {});
                 }
             }
        }

        return successResponse(updated);
    } catch (error) {
        return errorResponse("Failed to update book", 500);
    }
}
