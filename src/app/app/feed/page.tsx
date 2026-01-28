"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

// Posts de démonstration
const DEMO_POSTS = [
  {
    id: "1",
    username: "Alex_Runner",
    userAvatar: "🏃",
    sport: "Running",
    sportEmoji: "🏃",
    description: "10km ce matin sous le soleil ! Nouveau record personnel 💪 #running #motivation",
    likes: 234,
    comments: 18,
    timeAgo: "2h",
    image: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800",
  },
  {
    id: "2", 
    username: "Sarah_Fitness",
    userAvatar: "💪",
    sport: "Musculation",
    sportEmoji: "🏋️",
    description: "Leg day done! Les résultats arrivent avec la constance 🔥",
    likes: 456,
    comments: 32,
    timeAgo: "4h",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
  },
  {
    id: "3",
    username: "Kevin_Basket",
    userAvatar: "🏀",
    sport: "Basketball",
    sportEmoji: "🏀",
    description: "Match de folie hier soir ! Qui veut jouer ce weekend ? 🏀",
    likes: 189,
    comments: 45,
    timeAgo: "6h",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
  },
  {
    id: "4",
    username: "Marie_Yoga",
    userAvatar: "🧘",
    sport: "Yoga",
    sportEmoji: "🧘",
    description: "Séance sunrise yoga sur la plage 🌅 Commencer la journée en paix",
    likes: 567,
    comments: 28,
    timeAgo: "8h",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
  },
];

export default function FeedPage() {
  const [likedPosts, setLikedPosts] = useState<string[]>([]);

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

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
            <Image 
              src="/logo_WeSport.jpg" 
              alt="WeSport Logo" 
              width={36} 
              height={36} 
              className="rounded-xl"
            />
            <span className="text-lg font-bold text-ws-white">WeSport</span>
          </Link>
          
          <nav className="flex items-center gap-1">
            <Link href="/app/feed" className="px-4 py-2 rounded-full bg-ws-green/20 text-ws-green font-medium text-sm">
              Feed
            </Link>
            <Link href="/app/search" className="px-4 py-2 rounded-full text-ws-white-dim hover:text-ws-white hover:bg-ws-gray transition-all text-sm">
              Recherche
            </Link>
            <Link href="/app/profile" className="px-4 py-2 rounded-full text-ws-white-dim hover:text-ws-white hover:bg-ws-gray transition-all text-sm">
              Profil
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Feed */}
      <main className="relative z-10 max-w-lg mx-auto pb-20">
        {/* Create Post Button */}
        <div className="p-4 border-b border-ws-gray">
          <button className="w-full p-4 rounded-2xl bg-ws-gray border border-ws-gray-light text-left text-ws-white-dim hover:border-ws-green/50 transition-colors">
            <span className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ws-green to-ws-emerald flex items-center justify-center text-ws-dark font-bold">
                +
              </div>
              <span>Partage ton exploit...</span>
            </span>
          </button>
        </div>

        {/* Posts */}
        <div className="divide-y divide-ws-gray">
          {DEMO_POSTS.map((post) => (
            <article key={post.id} className="p-4">
              {/* Post Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-ws-gray flex items-center justify-center text-2xl">
                  {post.userAvatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ws-white">{post.username}</span>
                    <span className="px-2 py-0.5 rounded-full bg-ws-green/20 text-ws-green text-xs">
                      {post.sportEmoji} {post.sport}
                    </span>
                  </div>
                  <span className="text-sm text-ws-white-dim">{post.timeAgo}</span>
                </div>
                <button className="p-2 text-ws-white-dim hover:text-ws-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>

              {/* Post Content */}
              <p className="text-ws-white mb-3">{post.description}</p>

              {/* Post Image */}
              <div className="relative rounded-2xl overflow-hidden mb-3">
                <img 
                  src={post.image} 
                  alt={post.description}
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>

              {/* Post Actions */}
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-2 transition-colors ${
                    likedPosts.includes(post.id) ? 'text-red-500' : 'text-ws-white-dim hover:text-red-500'
                  }`}
                >
                  <svg className="w-6 h-6" fill={likedPosts.includes(post.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="font-medium">{post.likes + (likedPosts.includes(post.id) ? 1 : 0)}</span>
                </button>

                <button className="flex items-center gap-2 text-ws-white-dim hover:text-ws-green transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="font-medium">{post.comments}</span>
                </button>

                <button className="flex items-center gap-2 text-ws-white-dim hover:text-ws-lime transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="font-medium">Partager</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Load More */}
        <div className="p-6 text-center">
          <button className="px-6 py-3 rounded-full bg-ws-gray border border-ws-gray-light text-ws-white-dim hover:border-ws-green hover:text-ws-green transition-all">
            Charger plus de posts
          </button>
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-ws-dark/95 backdrop-blur-xl border-t border-ws-gray md:hidden">
        <div className="flex items-center justify-around py-2">
          <Link href="/app/feed" className="flex flex-col items-center gap-1 p-2 text-ws-green">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">Feed</span>
          </Link>
          <Link href="/app/map" className="flex flex-col items-center gap-1 p-2 text-ws-white-dim">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs">Carte</span>
          </Link>
          <button className="flex flex-col items-center gap-1 p-2 -mt-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-ws-green to-ws-emerald flex items-center justify-center shadow-lg shadow-ws-green/30">
              <svg className="w-7 h-7 text-ws-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </button>
          <Link href="/app/messages" className="flex flex-col items-center gap-1 p-2 text-ws-white-dim">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs">Chat</span>
          </Link>
          <Link href="/app/profile" className="flex flex-col items-center gap-1 p-2 text-ws-white-dim">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
