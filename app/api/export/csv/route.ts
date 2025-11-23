import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, errorResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import Papa from 'papaparse';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || !session.user?.email) return errorResponse("Unauthorized", 401);

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { userBooks: { include: { book: true } } }
  });

  if (!user) return errorResponse("User not found", 404);

  const data = user.userBooks.map(ub => ({
    Title: ub.book.title,
    Authors: ub.book.authors,
    Status: ub.status,
    Rating: ub.rating || 0,
    StartDate: ub.startDate ? ub.startDate.toISOString().split('T')[0] : '',
    FinishDate: ub.finishDate ? ub.finishDate.toISOString().split('T')[0] : ''
  }));

  const csv = Papa.unparse(data);

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="library-export-${user.name}.csv"`,
    },
  });
}
