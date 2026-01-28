"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const NEARBY_SPOTS = [
  { id: "1", name: "Parc des Sports", type: "Football", distance: "500m", rating: 4.8, users: 12, emoji: "⚽" },
  { id: "2", name: "Salle FitZone", type: "Musculation", distance: "800m", rating: 4.6, users: 8, emoji: "🏋️" },
  { id: "3", name: "Tennis Club Paris", type: "Tennis", distance: "1.2km", rating: 4.9, users: 5, emoji: "🎾" },
  { id: "4", name: "Piste d'athlétisme", type: "Running", distance: "1.5km", rating: 4.5, users: 15, emoji: "🏃" },
  { id: "5", name: "Gymnase Municipal", type: "Basketball", distance: "2km", rating: 4.3, users: 6, emoji: "🏀" },
];

const ACTIVE_USERS = [
  { id: "1", name: "Alex", sport: "Running", avatar: "🏃", distance: "200m" },
  { id: "2", name: "Sarah", sport: "Yoga", avatar: "🧘", distance: "350m" },
  { id: "3", name: "Kevin", sport: "Basketball", avatar: "🏀", distance: "800m" },
];

export default function MapPage() {
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-ws-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-ws-dark/80 border-b border-ws-gray">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo_WeSport.jpg" alt="WeSport" width={36} height={36} className="rounded-xl" />
            <span className="text-lg font-bold text-ws-white">Carte</span>
          </Link>
          <button className="p-2 rounded-full bg-ws-green/20 text-ws-green">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="relative z-10 pb-24">
        {/* Map Placeholder */}
        <div className="relative h-[300px] bg-ws-gray overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-ws-green/10 to-ws-emerald/5">
            {/* Grid pattern for map feel */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }} />
            
            {/* User location marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-ws-green/30 animate-ping absolute" />
                <div className="w-16 h-16 rounded-full bg-ws-green/20 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-ws-green flex items-center justify-center text-ws-dark font-bold">
                    📍
                  </div>
                </div>
              </div>
            </div>

            {/* Nearby markers */}
            <div className="absolute top-1/4 left-1/3 w-10 h-10 rounded-full bg-ws-dark/80 flex items-center justify-center text-lg cursor-pointer hover:scale-110 transition-transform">⚽</div>
            <div className="absolute top-1/3 right-1/4 w-10 h-10 rounded-full bg-ws-dark/80 flex items-center justify-center text-lg cursor-pointer hover:scale-110 transition-transform">🏋️</div>
            <div className="absolute bottom-1/3 left-1/4 w-10 h-10 rounded-full bg-ws-dark/80 flex items-center justify-center text-lg cursor-pointer hover:scale-110 transition-transform">🎾</div>
            <div className="absolute bottom-1/4 right-1/3 w-10 h-10 rounded-full bg-ws-dark/80 flex items-center justify-center text-lg cursor-pointer hover:scale-110 transition-transform">🏃</div>
          </div>
          
          {/* Map overlay text */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="px-4 py-2 rounded-full bg-ws-dark/80 backdrop-blur-sm text-ws-white text-sm inline-flex items-center gap-2">
              <span className="w-2 h-2 bg-ws-green rounded-full animate-pulse" />
              {ACTIVE_USERS.length} sportifs actifs autour de toi
            </div>
          </div>
        </div>

        {/* Active Users Nearby */}
        <div className="p-4">
          <h2 className="text-lg font-bold text-ws-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-ws-green rounded-full animate-pulse" />
            Sportifs à proximité
          </h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {ACTIVE_USERS.map((user) => (
              <div key={user.id} className="flex-shrink-0 p-3 bg-ws-gray rounded-2xl border border-ws-gray-light min-w-[140px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-ws-dark flex items-center justify-center text-xl">
                    {user.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-ws-white text-sm">{user.name}</div>
                    <div className="text-xs text-ws-white-dim">{user.distance}</div>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-ws-green/20 text-ws-green">{user.sport}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby Spots */}
        <div className="p-4">
          <h2 className="text-lg font-bold text-ws-white mb-3">📍 Spots autour de toi</h2>
          <div className="space-y-3">
            {NEARBY_SPOTS.map((spot) => (
              <div 
                key={spot.id} 
                onClick={() => setSelectedSpot(spot.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedSpot === spot.id 
                    ? "bg-ws-green/20 border-ws-green" 
                    : "bg-ws-gray border-ws-gray-light hover:border-ws-green/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-ws-dark flex items-center justify-center text-2xl">
                    {spot.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-ws-white">{spot.name}</span>
                      <span className="text-sm text-ws-white-dim">{spot.distance}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span className="text-ws-white-dim">{spot.type}</span>
                      <span className="text-ws-green">⭐ {spot.rating}</span>
                      <span className="text-ws-white-dim">👥 {spot.users}</span>
                    </div>
                  </div>
                </div>
                {selectedSpot === spot.id && (
                  <div className="mt-3 pt-3 border-t border-ws-gray-light flex gap-2">
                    <button className="flex-1 py-2 rounded-xl bg-ws-green text-ws-dark font-medium text-sm">
                      Y aller
                    </button>
                    <button className="flex-1 py-2 rounded-xl bg-ws-gray-light text-ws-white font-medium text-sm">
                      Check-in
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-ws-dark/95 backdrop-blur-xl border-t border-ws-gray">
        <div className="flex items-center justify-around py-2">
          <Link href="/app/feed" className="flex flex-col items-center gap-1 p-2 text-ws-white-dim">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="text-xs">Feed</span>
          </Link>
          <Link href="/app/map" className="flex flex-col items-center gap-1 p-2 text-ws-green">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="text-xs">Carte</span>
          </Link>
          <button className="flex flex-col items-center gap-1 p-2 -mt-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-ws-green to-ws-emerald flex items-center justify-center shadow-lg shadow-ws-green/30">
              <svg className="w-7 h-7 text-ws-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            </div>
          </button>
          <Link href="/app/messages" className="flex flex-col items-center gap-1 p-2 text-ws-white-dim">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <span className="text-xs">Messages</span>
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
