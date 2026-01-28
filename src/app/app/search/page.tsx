"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const SPORTS_FILTER = [
  { id: "all", name: "Tous", emoji: "🏆" },
  { id: "football", name: "Football", emoji: "⚽" },
  { id: "basketball", name: "Basketball", emoji: "🏀" },
  { id: "tennis", name: "Tennis", emoji: "🎾" },
  { id: "musculation", name: "Muscu", emoji: "🏋️" },
  { id: "running", name: "Running", emoji: "🏃" },
  { id: "yoga", name: "Yoga", emoji: "🧘" },
];

const USERS = [
  { id: "1", name: "Alex Runner", username: "@alex_runner", sport: "Running", avatar: "🏃", level: "Confirmé", distance: "2 km" },
  { id: "2", name: "Sarah Fitness", username: "@sarah_fit", sport: "Musculation", avatar: "💪", level: "Expert", distance: "500 m" },
  { id: "3", name: "Kevin Basket", username: "@kev_basket", sport: "Basketball", avatar: "🏀", level: "Intermédiaire", distance: "1.5 km" },
  { id: "4", name: "Marie Yoga", username: "@marie_zen", sport: "Yoga", avatar: "🧘", level: "Débutant", distance: "3 km" },
  { id: "5", name: "Lucas Tennis", username: "@lucas_ace", sport: "Tennis", avatar: "🎾", level: "Confirmé", distance: "800 m" },
  { id: "6", name: "Emma Football", username: "@emma_goal", sport: "Football", avatar: "⚽", level: "Expert", distance: "1 km" },
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");

  const filteredUsers = USERS.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === "all" || user.sport.toLowerCase() === selectedSport;
    return matchesSearch && matchesSport;
  });

  return (
    <div className="min-h-screen bg-ws-dark">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-ws-green/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] bg-ws-emerald/15 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-ws-dark/80 border-b border-ws-gray">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo_WeSport.jpg" alt="WeSport" width={36} height={36} className="rounded-xl" />
            <span className="text-lg font-bold text-ws-white">WeSport</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/app/feed" className="px-4 py-2 rounded-full text-ws-white-dim hover:bg-ws-gray text-sm">Feed</Link>
            <Link href="/app/search" className="px-4 py-2 rounded-full bg-ws-green/20 text-ws-green font-medium text-sm">Recherche</Link>
            <Link href="/app/profile" className="px-4 py-2 rounded-full text-ws-white-dim hover:bg-ws-gray text-sm">Profil</Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 max-w-lg mx-auto pb-24">
        {/* Search Bar */}
        <div className="p-4">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ws-white-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un sportif..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-ws-gray border border-ws-gray-light rounded-2xl text-ws-white placeholder:text-ws-white-dim/50 focus:outline-none focus:border-ws-green"
            />
          </div>
        </div>

        {/* Sport Filters */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {SPORTS_FILTER.map((sport) => (
              <button
                key={sport.id}
                onClick={() => setSelectedSport(sport.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedSport === sport.id
                    ? "bg-ws-green text-ws-dark font-medium"
                    : "bg-ws-gray text-ws-white-dim hover:bg-ws-gray-light"
                }`}
              >
                <span>{sport.emoji}</span>
                <span>{sport.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="px-4">
          <h2 className="text-ws-white-dim text-sm mb-3">
            {filteredUsers.length} sportif{filteredUsers.length > 1 ? "s" : ""} trouvé{filteredUsers.length > 1 ? "s" : ""}
          </h2>
          
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-4 bg-ws-gray rounded-2xl border border-ws-gray-light hover:border-ws-green/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-ws-dark flex items-center justify-center text-3xl">
                    {user.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ws-white">{user.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-ws-green/20 text-ws-green text-xs">{user.level}</span>
                    </div>
                    <span className="text-sm text-ws-white-dim">{user.username}</span>
                    <div className="flex items-center gap-3 mt-1 text-xs text-ws-white-dim">
                      <span>🏅 {user.sport}</span>
                      <span>📍 {user.distance}</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-ws-green text-ws-dark font-medium rounded-full text-sm hover:bg-ws-green-light transition-colors">
                    Suivre
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
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
          <Link href="/app/messages" className="flex flex-col items-center gap-1 p-2 text-ws-white-dim">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
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
