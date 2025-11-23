import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <h1 className="text-5xl font-extrabold text-indigo-900 mb-6 tracking-tight">
        Votre bibliothèque,<br/> <span className="text-indigo-600">réinventée.</span>
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mb-10">
        Gérez vos livres, suivez votre progression hors ligne, et débloquez des succès en lisant.
        L'application moderne pour les amoureux de la lecture.
      </p>

      <div className="flex gap-4">
        <a href="/api/auth/signin" className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-indigo-700 transition-transform hover:scale-105">
          Commencer maintenant
        </a>
        <a href="#" className="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
          En savoir plus
        </a>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
           <div className="text-indigo-500 text-2xl mb-2">📚</div>
           <h3 className="font-bold text-lg mb-2">Gestion Complète</h3>
           <p className="text-gray-600">Organisez votre collection, notez vos lectures et suivez vos pages lues au quotidien.</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
           <div className="text-indigo-500 text-2xl mb-2">🏆</div>
           <h3 className="font-bold text-lg mb-2">Gamification</h3>
           <p className="text-gray-600">Gagnez des badges et grimpez dans le classement en lisant régulièrement.</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
           <div className="text-indigo-500 text-2xl mb-2">⚡</div>
           <h3 className="font-bold text-lg mb-2">Toujours Disponible</h3>
           <p className="text-gray-600">Technologie PWA : continuez à utiliser l'application même sans connexion internet.</p>
        </div>
      </div>
    </div>
  );
}
