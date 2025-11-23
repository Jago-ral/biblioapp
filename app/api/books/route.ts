import { NextRequest } from 'next/server';
import { getAuthSession, errorResponse, successResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

// POST: Add a book to the global library (and user's library)
export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const body = await req.json();
  const { googleId, title, authors, description, pageCount, categories, thumbnail, language, publishedDate } = body;

  if (!googleId || !title) return errorResponse("Missing required fields");

  try {
    // 1. Find or Create the Book in global DB
    let book = await prisma.book.findUnique({
      where: { googleId },
    });

    if (!book) {
      book = await prisma.book.create({
        data: {
          googleId,
          title,
          authors: JSON.stringify(authors || []),
          description: description || "",
          pageCount: pageCount || 0,
          categories: JSON.stringify(categories || []),
          thumbnail: thumbnail || "",
          language: language || "en",
          publishedDate: publishedDate || ""
        }
      });
    }

    // 2. Link to User if not already
    if (!session.user?.email) return errorResponse("User not found", 401);

    // We need the user ID from the DB (or from session if we patched it correctly)
    // Ideally we rely on email to find user if session.user.id is not typed,
    // but we patched session.user.id in the auth route.
    // However, TS still complains because it thinks session.user might be undefined
    // despite the check at top of function (which checked session but not session.user specifically).

    // Explicit check
    const userEmail = session.user.email;
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) return errorResponse("User not found in DB", 404);

    const userId = user.id;

    const existingLink = await prisma.userBook.findUnique({
      where: {
        userId_bookId: {
          userId: userId,
          bookId: book.id
        }
      }
    });

    if (existingLink) {
        return successResponse({ message: "Book already in library", userBook: existingLink });
    }

    const userBook = await prisma.userBook.create({
      data: {
        userId: userId,
        bookId: book.id,
        status: "TO_READ" // Default status
      }
    });

    // CHECK BADGE: First Book
    const count = await prisma.userBook.count({ where: { userId: userId } });
    if (count === 1) {
        const badge = await prisma.badge.findUnique({ where: { code: 'FIRST_BOOK' } });
        if (badge) {
             await prisma.userBadge.create({
                 data: { userId: userId, badgeId: badge.id }
             }).catch(() => {}); // Ignore if already exists
        }
    }

    return successResponse({ message: "Book added", userBook });

  } catch (error) {
    console.error(error);
    return errorResponse("Failed to add book", 500);
  }
}
