'use client';

import { useQuery } from '@tanstack/react-query';
import { Trophy, BookOpen, Flame, Award, Star, Users } from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';

export default function ChallengesClient() {
  const { data: gamificationData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['gamification'],
    queryFn: async () => {
      const res = await fetch('/api/gamification');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    }
  });

  const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      return res.json();
    }
  });

  const { data: recommendations, isLoading: isLoadingRecs } = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: async () => {
      const res = await fetch('/api/ai/recommend');
      if (!res.ok) throw new Error('Failed to fetch recs');
      return res.json();
    }
  });

  if (isLoadingStats) return <div className="text-center py-10">Chargement des challenges...</div>;

  const { badges, stats } = gamificationData || { badges: [], stats: { booksRead: 0, totalPagesRead: 0 } };

  const allBadges = [
      { code: 'FIRST_BOOK', name: 'Premier Livre', description: 'Ajouter un livre', icon: BookOpen },
      { code: '100_PAGES', name: '100 Pages Lues', description: 'Lire 100 pages', icon: Flame },
      { code: 'BOOKWORM', name: 'Rat de Bibliothèque', description: 'Lire 5 livres', icon: Trophy },
  ];

  return (
    <div>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500 rounded-full"><BookOpen className="w-6 h-6" /></div>
                    <div>
                        <p className="text-indigo-100 text-sm">Livres Lus</p>
                        <p className="text-3xl font-bold">{stats.booksRead}</p>
                    </div>
                </div>
            </div>
            <div className="bg-purple-600 text-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500 rounded-full"><Flame className="w-6 h-6" /></div>
                    <div>
                        <p className="text-purple-100 text-sm">Pages Lues</p>
                        <p className="text-3xl font-bold">{stats.totalPagesRead}</p>
                    </div>
                </div>
            </div>
             <div className="bg-orange-500 text-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-400 rounded-full"><Award className="w-6 h-6" /></div>
                    <div>
                        <p className="text-orange-100 text-sm">Badges Débloqués</p>
                        <p className="text-3xl font-bold">{badges.length}</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Badges Section */}
            <div className="lg:col-span-2">
                <h2 className="text-xl font-bold mb-6">Vos Trophées</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {allBadges.map((badgeDef) => {
                        const earned = badges.find((b: any) => b.badge.code === badgeDef.code);
                        const Icon = badgeDef.icon;

                        return (
                            <div
                                key={badgeDef.code}
                                className={clsx(
                                    "p-6 rounded-xl border flex flex-col items-center text-center transition-all",
                                    earned
                                    ? "bg-white border-yellow-200 shadow-md ring-1 ring-yellow-100"
                                    : "bg-gray-50 border-gray-200 grayscale opacity-70"
                                )}
                            >
                                <div className={clsx(
                                    "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                                    earned ? "bg-yellow-100 text-yellow-600" : "bg-gray-200 text-gray-400"
                                )}>
                                    <Icon size={32} />
                                </div>
                                <h3 className="font-bold text-lg text-gray-900">{badgeDef.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">{badgeDef.description}</p>
                                {earned && (
                                    <span className="mt-4 inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                        Débloqué
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Leaderboard Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                 <div className="flex items-center gap-2 mb-6">
                    <Users className="text-indigo-600" />
                    <h2 className="text-xl font-bold">Classement</h2>
                 </div>

                 {isLoadingLeaderboard ? (
                    <p className="text-gray-500">Chargement...</p>
                 ) : (
                    <div className="space-y-4">
                        {leaderboardData?.map((user: any, index: number) => (
                            <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <span className={clsx(
                                        "w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold",
                                        index === 0 ? "bg-yellow-100 text-yellow-700" :
                                        index === 1 ? "bg-gray-100 text-gray-700" :
                                        index === 2 ? "bg-orange-100 text-orange-700" : "text-gray-500"
                                    )}>
                                        {index + 1}
                                    </span>
                                    <div>
                                        <p className="font-medium text-sm text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.booksRead} livres</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-indigo-600 font-bold text-sm">
                                    {user.score} pts
                                </div>
                            </div>
                        ))}
                    </div>
                 )}
            </div>
        </div>

        {/* AI Recommendations */}
        <div className="mt-12">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Star className="text-yellow-500 fill-yellow-500" /> Recommandations IA
            </h2>
            {isLoadingRecs ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-pulse">
                            <div className="h-40 bg-gray-200 rounded mb-4 w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recommendations?.map((book: any) => (
                        <div key={book.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                             <div className="relative h-48 w-full mb-4 bg-gray-100 rounded-lg overflow-hidden">
                                <Image
                                    src={book.thumbnail}
                                    alt={book.title}
                                    fill
                                    className="object-cover"
                                />
                             </div>
                             <h3 className="font-bold text-gray-900 line-clamp-1">{book.title}</h3>
                             <p className="text-sm text-gray-600 mb-2">{book.authors}</p>
                             <p className="text-xs text-gray-500 line-clamp-2">{book.description}</p>
                        </div>
                    ))}
                </div>
            )}
            <p className="text-center text-sm text-gray-500 mt-6 italic">
                Basé sur l&apos;analyse de vos lectures récentes via OpenAI (Simulé)
            </p>
        </div>
    </div>
  );
}
