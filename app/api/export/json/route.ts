import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, errorResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || !session.user?.email) return errorResponse("Unauthorized", 401);

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { userBooks: { include: { book: true } } }
  });

  if (!user) return errorResponse("User not found", 404);

  const data = user.userBooks.map(ub => ({
    title: ub.book.title,
    authors: ub.book.authors,
    status: ub.status,
    rating: ub.rating,
    addedAt: ub.createdAt,
    bookDetails: ub.book
  }));

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="library-export-${user.name}.json"`,
    },
  });
}
