'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSync } from '@/lib/hooks/useSync';
import { useState } from 'react';
import { Loader2, Book as BookIcon, CheckCircle2, Clock } from 'lucide-react';

export default function DashboardClient() {
  const { isOnline, addToQueue } = useSync();
  const [filter, setFilter] = useState<string>('ALL');
  const queryClient = useQueryClient();

  const { data: books, isLoading } = useQuery({
    queryKey: ['userBooks', filter],
    queryFn: async () => {
      const res = await fetch(`/api/user/books${filter !== 'ALL' ? `?status=${filter}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    // If offline, we rely on React Query cache if available,
    // but real PWA would sync Dexie to State here.
    // For MVP we assume online first or cache.
    staleTime: 60000,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (payload: any) => {
        if (isOnline) {
            const res = await fetch('/api/user/books', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed update');
            return res.json();
        } else {
            await addToQueue('UPDATE_PROGRESS', payload);
            return { ...payload, offline: true };
        }
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['userBooks'] });
    }
  });

  const handleUpdateStatus = (id: string, status: string) => {
      updateProgressMutation.mutate({ userBookId: id, status });
  };

  const handleUpdatePage = (id: string, currentPage: number) => {
      updateProgressMutation.mutate({ userBookId: id, currentPage });
  };

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>;

  return (
    <div>
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['ALL', 'TO_READ', 'READING', 'COMPLETED'].map(status => (
                <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                        filter === status
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    {status === 'ALL' ? 'Tous' : status === 'TO_READ' ? 'À lire' : status === 'READING' ? 'En cours' : 'Terminé'}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {books?.map((userBook: any) => (
                <div key={userBook.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-5">
                    <div className="flex-shrink-0">
                         {userBook.book.thumbnail ? (
                            <img src={userBook.book.thumbnail} alt={userBook.book.title} className="w-28 h-40 object-cover rounded shadow-md" />
                        ) : (
                            <div className="w-28 h-40 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">No Cover</div>
                        )}
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{userBook.book.title}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    userBook.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                    userBook.status === 'READING' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {userBook.status === 'COMPLETED' ? 'Terminé' : userBook.status === 'READING' ? 'En cours' : 'À lire'}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{JSON.parse(userBook.book.authors || '[]').join(', ')}</p>

                            {/* Progress Bar */}
                            {userBook.book.pageCount > 0 && (
                                <div className="mb-2">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>{userBook.currentPage} / {userBook.book.pageCount} pages</span>
                                        <span>{Math.round((userBook.currentPage / userBook.book.pageCount) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-indigo-600 h-2 rounded-full transition-all"
                                            style={{ width: `${(userBook.currentPage / userBook.book.pageCount) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 mt-4">
                            {userBook.status !== 'READING' && (
                                <button
                                    onClick={() => handleUpdateStatus(userBook.id, 'READING')}
                                    className="flex-1 bg-indigo-50 text-indigo-700 py-2 rounded-md text-sm font-medium hover:bg-indigo-100 flex justify-center items-center gap-2"
                                >
                                    <BookIcon size={16} /> Lire
                                </button>
                            )}
                             {userBook.status === 'READING' && (
                                <button
                                    onClick={() => {
                                        const pages = prompt("Nouvelle page actuelle :", userBook.currentPage);
                                        if (pages) handleUpdatePage(userBook.id, parseInt(pages));
                                    }}
                                    className="flex-1 bg-indigo-50 text-indigo-700 py-2 rounded-md text-sm font-medium hover:bg-indigo-100 flex justify-center items-center gap-2"
                                >
                                    <Clock size={16} /> Mettre à jour
                                </button>
                            )}
                            {userBook.status !== 'COMPLETED' && (
                                <button
                                    onClick={() => handleUpdateStatus(userBook.id, 'COMPLETED')}
                                    className="flex-1 bg-green-50 text-green-700 py-2 rounded-md text-sm font-medium hover:bg-green-100 flex justify-center items-center gap-2"
                                >
                                    <CheckCircle2 size={16} /> Terminer
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {books?.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                    <p>Aucun livre trouvé dans cette catégorie.</p>
                </div>
            )}
        </div>
    </div>
  );
}
