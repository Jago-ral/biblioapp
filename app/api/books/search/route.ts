import { NextRequest } from 'next/server';
import { getAuthSession, errorResponse, successResponse } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) return errorResponse("Query parameter 'q' is required");

  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
    // Fallback if no API key is provided (mock or error)
    if (!apiKey) {
        console.warn("Google Books API Key missing");
        // Return dummy data for dev if no key
        return successResponse({ items: [] });
    }

    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=20`);
    const data = await res.json();

    return successResponse(data);
  } catch (error) {
    return errorResponse("Failed to fetch books", 500);
  }
}
