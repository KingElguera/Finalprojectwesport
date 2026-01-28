"use client";

import Link from "next/link";
import Image from "next/image";

const CONVERSATIONS = [
  { id: "1", name: "Alex Runner", avatar: "🏃", lastMessage: "On se fait un run demain ?", time: "2 min", unread: 2 },
  { id: "2", name: "Sarah Fitness", avatar: "💪", lastMessage: "Super ton entraînement !", time: "1h", unread: 0 },
  { id: "3", name: "Kevin Basket", avatar: "🏀", lastMessage: "Match ce weekend ?", time: "3h", unread: 1 },
  { id: "4", name: "Marie Yoga", avatar: "🧘", lastMessage: "Merci pour les conseils 🙏", time: "Hier", unread: 0 },
  { id: "5", name: "Lucas Tennis", avatar: "🎾", lastMessage: "J'ai réservé le court", time: "Hier", unread: 0 },
];

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-ws-dark">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-ws-green/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] bg-ws-emerald/15 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-ws-dark/80 border-b border-ws-gray">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo_WeSport.jpg" alt="WeSport" width={36} height={36} className="rounded-xl" />
            <span className="text-lg font-bold text-ws-white">Messages</span>
          </Link>
          <button className="p-2 rounded-full bg-ws-green/20 text-ws-green">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-lg mx-auto pb-24">
        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ws-white-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              className="w-full pl-12 pr-4 py-3 bg-ws-gray border border-ws-gray-light rounded-xl text-ws-white placeholder:text-ws-white-dim/50 focus:outline-none focus:border-ws-green"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="divide-y divide-ws-gray">
          {CONVERSATIONS.map((conv) => (
            <Link
              key={conv.id}
              href={`/app/messages/${conv.id}`}
              className="flex items-center gap-4 p-4 hover:bg-ws-gray/50 transition-colors"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-ws-gray flex items-center justify-center text-2xl">
                  {conv.avatar}
                </div>
                {conv.unread > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-ws-green rounded-full flex items-center justify-center text-xs text-ws-dark font-bold">
                    {conv.unread}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${conv.unread > 0 ? "text-ws-white" : "text-ws-white-dim"}`}>
                    {conv.name}
                  </span>
                  <span className="text-xs text-ws-white-dim">{conv.time}</span>
                </div>
                <p className={`text-sm truncate ${conv.unread > 0 ? "text-ws-white" : "text-ws-white-dim"}`}>
                  {conv.lastMessage}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {CONVERSATIONS.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-xl font-bold text-ws-white mb-2">Pas encore de messages</h2>
            <p className="text-ws-white-dim">Commence une conversation avec un sportif !</p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-ws-dark/95 backdrop-blur-xl border-t border-ws-gray md:hidden">
        <div className="flex items-center justify-around py-2">
          <Link href="/app/feed" className="flex flex-col items-center gap-1 p-2 text-ws-white-dim">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="text-xs">Feed</span>
          </Link>
          <Link href="/app/map" className="flex flex-col items-center gap-1 p-2 text-ws-white-dim">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="text-xs">Carte</span>
          </Link>
          <button className="flex flex-col items-center gap-1 p-2 -mt-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-ws-green to-ws-emerald flex items-center justify-center shadow-lg shadow-ws-green/30">
              <svg className="w-7 h-7 text-ws-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            </div>
          </button>
          <Link href="/app/messages" className="flex flex-col items-center gap-1 p-2 text-ws-green">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <span className="text-xs">Chat</span>
          </Link>
          <Link href="/app/profile" className="flex flex-col items-center gap-1 p-2 text-ws-white-dim">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="text-xs">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
