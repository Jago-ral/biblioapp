import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, errorResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { jsPDF } from 'jspdf';

// Since jsPDF runs in Node, we might need a polyfill for window if it relies on it,
// but modern jsPDF works reasonably well in Node for basic text.
// If it fails, we'd fallback to a client-side generation approach.
// However, the requirement is "server-side generation".

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || !session.user?.email) return errorResponse("Unauthorized", 401);

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { userBooks: { include: { book: true } } }
  });

  if (!user) return errorResponse("User not found", 404);

  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text(`Bibliothèque de ${user.name || 'Utilisateur'}`, 10, 20);

  doc.setFontSize(12);
  let y = 40;

  user.userBooks.forEach((ub, i) => {
      if (y > 280) {
          doc.addPage();
          y = 20;
      }
      const title = `${i + 1}. ${ub.book.title}`;
      const status = `Status: ${ub.status} | Note: ${ub.rating || '-'}/5`;

      doc.text(title, 10, y);
      doc.setFontSize(10);
      doc.text(status, 10, y + 5);
      doc.setFontSize(12);

      y += 15;
  });

  const pdfOutput = doc.output('arraybuffer');

  return new NextResponse(pdfOutput, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="library-export-${user.name}.pdf"`,
    },
  });
}
