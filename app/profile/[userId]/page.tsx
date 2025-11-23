import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Image from "next/image";
import { BookOpen } from "lucide-react";

export default async function PublicProfilePage({ params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);

  // Optional: Check if user is logged in to view profiles?
  // Requirement doesn't specify, assuming public but safer to be logged in.
  if (!session) {
    redirect("/api/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: {
        userBooks: {
            where: { status: 'COMPLETED' },
            include: { book: true }
        },
        userBadges: {
            include: { badge: true }
        }
    }
  });

  if (!user) {
    return <div className="text-center py-20">Utilisateur non trouvé.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 flex items-center gap-6">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-600">
                {user.image ? <Image src={user.image} alt={user.name || ''} width={96} height={96} className="rounded-full" /> : (user.name?.[0] || 'U')}
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500">Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR')}</p>
                <div className="flex gap-4 mt-4">
                    <div className="bg-gray-50 px-4 py-2 rounded-lg">
                        <span className="block text-xl font-bold text-gray-900">{user.userBooks.length}</span>
                        <span className="text-xs text-gray-500">Livres Lus</span>
                    </div>
                     <div className="bg-gray-50 px-4 py-2 rounded-lg">
                        <span className="block text-xl font-bold text-gray-900">{user.userBadges.length}</span>
                        <span className="text-xs text-gray-500">Badges</span>
                    </div>
                </div>
            </div>
        </div>

        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" /> Bibliothèque (Lus)
        </h2>

        {user.userBooks.length === 0 ? (
            <p className="text-gray-500 italic">Aucun livre terminé pour le moment.</p>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {user.userBooks.map((ub) => (
                    <div key={ub.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                         <div className="relative h-40 w-full mb-3 bg-gray-100 rounded-lg overflow-hidden">
                             {ub.book.thumbnail ? (
                                 <Image src={ub.book.thumbnail} alt={ub.book.title} fill className="object-cover" />
                             ) : (
                                 <div className="flex items-center justify-center h-full text-gray-400">No Cover</div>
                             )}
                         </div>
                         <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{ub.book.title}</h3>
                         <p className="text-xs text-gray-500 mt-1">{ub.book.authors}</p>
                         <div className="mt-2 text-xs text-yellow-600 font-bold">
                            {ub.rating ? '★'.repeat(ub.rating) : 'Pas de note'}
                         </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}
