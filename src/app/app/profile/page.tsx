"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"posts" | "stats" | "badges">("posts");

  const userProfile = {
    name: "Ishimwe King",
    username: "@king_sport",
    bio: "Passionné de sport 🏃‍♂️ | Football & Running | Paris 📍",
    followers: 1234,
    following: 567,
    posts: 42,
    sports: ["Football", "Running", "Musculation"],
    stats: {
      totalWorkouts: 156,
      thisMonth: 18,
      streak: 12,
      calories: "45.2k",
    },
    badges: [
      { id: "1", name: "Early Adopter", emoji: "🌟", desc: "Membre depuis le début" },
      { id: "2", name: "10K Runner", emoji: "🏃", desc: "10km courus" },
      { id: "3", name: "Social Star", emoji: "⭐", desc: "100+ likes" },
      { id: "4", name: "Consistent", emoji: "🔥", desc: "7 jours de streak" },
    ],
  };

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
            <span className="text-lg font-bold text-ws-white">WeSport</span>
          </Link>
          <button className="p-2 text-ws-white-dim hover:text-ws-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-lg mx-auto pb-24">
        {/* Profile Header */}
        <div className="p-6 text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-ws-green to-ws-emerald flex items-center justify-center text-4xl mb-4">
            👑
          </div>
          <h1 className="text-2xl font-bold text-ws-white">{userProfile.name}</h1>
          <p className="text-ws-white-dim">{userProfile.username}</p>
          <p className="text-ws-white mt-2 text-sm">{userProfile.bio}</p>
          
          {/* Sports Tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {userProfile.sports.map((sport) => (
              <span key={sport} className="px-3 py-1 rounded-full bg-ws-green/20 text-ws-green text-sm">
                {sport}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <div className="text-xl font-bold text-ws-white">{userProfile.posts}</div>
              <div className="text-xs text-ws-white-dim">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-ws-white">{userProfile.followers}</div>
              <div className="text-xs text-ws-white-dim">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-ws-white">{userProfile.following}</div>
              <div className="text-xs text-ws-white-dim">Following</div>
            </div>
          </div>

          {/* Edit Button */}
          <button className="mt-6 px-8 py-3 rounded-full border border-ws-green text-ws-green font-medium hover:bg-ws-green hover:text-ws-dark transition-all">
            Modifier le profil
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-ws-gray">
          {[
            { id: "posts", label: "Posts", icon: "📷" },
            { id: "stats", label: "Stats", icon: "📊" },
            { id: "badges", label: "Badges", icon: "🏆" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-4 text-center transition-colors ${
                activeTab === tab.id
                  ? "text-ws-green border-b-2 border-ws-green"
                  : "text-ws-white-dim hover:text-ws-white"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === "posts" && (
            <div className="grid grid-cols-3 gap-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-ws-gray rounded-lg flex items-center justify-center text-ws-white-dim">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              ))}
            </div>
          )}

          {activeTab === "stats" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-ws-gray rounded-2xl text-center">
                <div className="text-3xl font-bold text-ws-green">{userProfile.stats.totalWorkouts}</div>
                <div className="text-sm text-ws-white-dim">Entraînements</div>
              </div>
              <div className="p-4 bg-ws-gray rounded-2xl text-center">
                <div className="text-3xl font-bold text-ws-lime">{userProfile.stats.thisMonth}</div>
                <div className="text-sm text-ws-white-dim">Ce mois</div>
              </div>
              <div className="p-4 bg-ws-gray rounded-2xl text-center">
                <div className="text-3xl font-bold text-ws-emerald">{userProfile.stats.streak} 🔥</div>
                <div className="text-sm text-ws-white-dim">Jours de streak</div>
              </div>
              <div className="p-4 bg-ws-gray rounded-2xl text-center">
                <div className="text-3xl font-bold text-ws-green">{userProfile.stats.calories}</div>
                <div className="text-sm text-ws-white-dim">Calories brûlées</div>
              </div>
            </div>
          )}

          {activeTab === "badges" && (
            <div className="grid grid-cols-2 gap-4">
              {userProfile.badges.map((badge) => (
                <div key={badge.id} className="p-4 bg-ws-gray rounded-2xl text-center">
                  <div className="text-4xl mb-2">{badge.emoji}</div>
                  <div className="font-semibold text-ws-white">{badge.name}</div>
                  <div className="text-xs text-ws-white-dim">{badge.desc}</div>
                </div>
              ))}
            </div>
          )}
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
          <Link href="/app/profile" className="flex flex-col items-center gap-1 p-2 text-ws-green">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="text-xs">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
