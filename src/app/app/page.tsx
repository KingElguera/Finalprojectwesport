"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ViewType } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";

// Import dynamique pour éviter les erreurs SSR avec Leaflet
const MapView = dynamic(() => import("@/components/MapView"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-ws-dark">
      <div className="text-ws-white-dim">Chargement de la carte...</div>
    </div>
  )
});

const ChatView = dynamic(() => import("@/components/ChatView"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-ws-dark">
      <div className="text-ws-white-dim">Chargement...</div>
    </div>
  )
});

const ProfileView = dynamic(() => import("@/components/ProfileView"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-ws-dark">
      <div className="text-ws-white-dim">Chargement...</div>
    </div>
  )
});

const WeSportFeed = dynamic(() => import("@/components/WeSportFeed"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-ws-dark">
      <div className="text-ws-white-dim">Chargement du feed...</div>
    </div>
  )
});

export default function MainApp() {
  const [currentView, setCurrentView] = useState<ViewType>("feed");
  const { user, loading } = useAuth();

  const renderView = () => {
    switch (currentView) {
      case "feed":
        return <WeSportFeed />;
      case "map":
        return <MapView />;
      case "chat":
        return <ChatView />;
      case "profile":
        return <ProfileView onOpenSettings={() => setCurrentView("settings")} />;
      default:
        return <WeSportFeed />;
    }
  };

  return (
    <div className="h-screen w-full bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-black/90 backdrop-blur-md border-b border-white/10 z-50">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo_WeSport.jpg" 
            alt="WeSport" 
            width={32} 
            height={32} 
            className="rounded-lg"
          />
          <span className="text-lg font-bold text-white">WeSport</span>
        </Link>
        
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Connecté</span>
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-bold">
              {user.email?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        ) : (
          <Link 
            href="/login" 
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-full transition-colors"
          >
            Connexion
          </Link>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {renderView()}
      </main>

      {/* Bottom Navigation */}
      <nav className="flex-shrink-0 bg-black/95 backdrop-blur-md border-t border-white/10 z-50">
        <div className="flex justify-around items-center px-2 py-2">
          {/* Feed */}
          <button 
            onClick={() => setCurrentView("feed")}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${
              currentView === "feed" ? "text-green-500" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-medium">Feed</span>
          </button>

          {/* Map */}
          <button 
            onClick={() => setCurrentView("map")}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${
              currentView === "map" ? "text-green-500" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[10px] font-medium">Carte</span>
          </button>

          {/* Create Post Button */}
          <button className="relative -top-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-green-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-900/50 border-4 border-black">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </button>

          {/* Chat */}
          <button 
            onClick={() => setCurrentView("chat")}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${
              currentView === "chat" ? "text-green-500" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-[10px] font-medium">Chat</span>
          </button>

          {/* Profile */}
          <button 
            onClick={() => setCurrentView("profile")}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${
              currentView === "profile" ? "text-green-500" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[10px] font-medium">Profil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
