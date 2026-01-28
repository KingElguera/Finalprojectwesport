"use client";

import Link from "next/link";
import Image from "next/image";

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-ws-dark">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-ws-green/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] bg-ws-emerald/15 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-ws-gray">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo_WeSport.jpg" 
            alt="WeSport Logo" 
            width={36} 
            height={36} 
            className="rounded-xl"
          />
          <span className="text-lg font-bold text-ws-white">WeSport</span>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link href="/app/feed" className="text-ws-green font-medium">Feed</Link>
          <Link href="/app/search" className="text-ws-white-dim hover:text-ws-white transition-colors">Recherche</Link>
          <Link href="/app/profile" className="text-ws-white-dim hover:text-ws-white transition-colors">Profil</Link>
        </nav>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-6 py-8 max-w-2xl mx-auto">
        <div className="text-center py-20">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-ws-white mb-4">
            Bienvenue sur WeSport !
          </h1>
          <p className="text-ws-white-dim mb-8">
            Ton compte a été créé avec succès. Le feed arrive bientôt...
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ws-green/20 border border-ws-green text-ws-green text-sm">
            <span className="w-2 h-2 bg-ws-green rounded-full animate-pulse" />
            Feed en construction
          </div>
        </div>
      </main>
    </div>
  );
}


