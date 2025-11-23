'use client';

import { useState } from 'react';
import { useSync } from '@/lib/hooks/useSync';
import { Search, Loader2, Plus, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToQueue, isOnline } = useSync();
  const router = useRouter();
  const [addedBooks, setAddedBooks] = useState<Set<string>>(new Set());

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (!isOnline) {
        alert("Vous êtes hors ligne. La recherche nécessite une connexion internet.");
        return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (book: any) => {
    const bookData = {
        googleId: book.id,
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors,
        description: book.volumeInfo.description,
        pageCount: book.volumeInfo.pageCount,
        categories: book.volumeInfo.categories,
        thumbnail: book.volumeInfo.imageLinks?.thumbnail,
        language: book.volumeInfo.language,
        publishedDate: book.volumeInfo.publishedDate
    };

    if (isOnline) {
        try {
            const res = await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookData)
            });
            if (res.ok) {
                setAddedBooks(prev => new Set(prev).add(book.id));
            }
        } catch (err) {
            console.error(err);
        }
    } else {
        // Offline Logic
        await addToQueue('ADD_BOOK', bookData);
        setAddedBooks(prev => new Set(prev).add(book.id));
        alert("Livre ajouté à la file d'attente (Hors ligne)");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Ajouter un livre</h1>

      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Titre, auteur, ISBN..."
          className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search />}
          Rechercher
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {results.map((book: any) => {
            const info = book.volumeInfo;
            const isAdded = addedBooks.has(book.id);
            return (
                <div key={book.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                    {info.imageLinks?.thumbnail ? (
                        <img src={info.imageLinks.thumbnail} alt={info.title} className="w-24 h-36 object-cover rounded shadow-sm" />
                    ) : (
                        <div className="w-24 h-36 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs text-center">No Cover</div>
                    )}
                    <div className="flex-grow">
                        <h3 className="font-semibold text-lg line-clamp-2">{info.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{info.authors?.join(', ')}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                           <span>{info.pageCount ? `${info.pageCount} pages` : 'N/A'}</span>
                           <span>•</span>
                           <span>{info.publishedDate || 'N/A'}</span>
                        </div>
                        <button
                            onClick={() => handleAddBook(book)}
                            disabled={isAdded}
                            className={`w-full py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 ${
                                isAdded
                                ? 'bg-green-100 text-green-700 cursor-default'
                                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                            }`}
                        >
                            {isAdded ? <><Check size={16}/> Ajouté</> : <><Plus size={16}/> Ajouter à ma liste</>}
                        </button>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
}
