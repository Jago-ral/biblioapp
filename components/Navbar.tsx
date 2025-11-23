'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { BookOpen, Trophy, Search, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
                <BookOpen className="h-6 w-6" />
                <span>BiblioApp</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Ma Bibliothèque
              </Link>
              <Link href="/search" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <Search className="w-4 h-4 mr-1"/> Explorer
              </Link>
              <Link href="/challenges" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <Trophy className="w-4 h-4 mr-1"/> Challenges
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {session ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">{session.user?.name}</span>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Connexion
              </button>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <div className={clsx("sm:hidden", isOpen ? "block" : "hidden")}>
        <div className="pt-2 pb-3 space-y-1">
          <Link href="/dashboard" className="bg-indigo-50 border-indigo-500 text-indigo-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            Ma Bibliothèque
          </Link>
          <Link href="/search" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            Explorer
          </Link>
           <Link href="/challenges" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            Challenges
          </Link>
        </div>
         <div className="pt-4 pb-4 border-t border-gray-200">
             {session ? (
                 <div className="flex items-center px-4">
                     <div className="ml-3">
                         <div className="text-base font-medium text-gray-800">{session.user?.name}</div>
                         <div className="text-sm font-medium text-gray-500">{session.user?.email}</div>
                     </div>
                     <button onClick={() => signOut()} className="ml-auto bg-white p-1 rounded-full text-gray-400 hover:text-gray-500">
                         <LogOut className="h-6 w-6" />
                     </button>
                 </div>
             ) : (
                 <div className="px-4">
                    <button onClick={() => signIn()} className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-base font-medium">Connexion</button>
                 </div>
             )}
         </div>
      </div>
    </nav>
  );
}
