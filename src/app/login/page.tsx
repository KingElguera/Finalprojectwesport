"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      // Attendre que l'AuthProvider se mette à jour
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirection vers l'app principale
      router.push('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ws-dark flex flex-col">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-ws-green/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] bg-ws-emerald/15 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo_WeSport.jpg" 
            alt="WeSport Logo" 
            width={40} 
            height={40} 
            className="rounded-xl"
          />
          <span className="text-xl font-bold text-ws-white">WeSport</span>
        </Link>
        <Link 
          href="/register" 
          className="text-ws-white-dim hover:text-ws-white transition-colors"
        >
          Pas de compte ? <span className="text-ws-green font-semibold">S&apos;inscrire</span>
        </Link>
      </header>

      {/* Main content - centered */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 md:px-12 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-ws-white mb-2">
              Content de te revoir
            </h1>
            <p className="text-ws-white-dim">
              Connecte-toi pour continuer
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-ws-white-dim text-sm mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="ton@email.com"
                required
                className="w-full px-4 py-4 bg-ws-gray border border-ws-gray-light rounded-xl text-ws-white placeholder:text-ws-white-dim/50 focus:outline-none focus:border-ws-green transition-colors"
              />
            </div>

            <div>
              <label className="block text-ws-white-dim text-sm mb-2">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-4 bg-ws-gray border border-ws-gray-light rounded-xl text-ws-white placeholder:text-ws-white-dim/50 focus:outline-none focus:border-ws-green transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ws-white-dim hover:text-ws-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link 
                href="/forgot-password" 
                className="text-sm text-ws-white-dim hover:text-ws-green transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-ws-green to-ws-emerald text-ws-dark font-bold text-lg rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-ws-gray-light" />
            <span className="text-ws-white-dim text-sm">ou</span>
            <div className="flex-1 h-px bg-ws-gray-light" />
          </div>

          {/* Social login buttons */}
          <div className="space-y-3">
            <button
              type="button"
              className="w-full py-4 bg-ws-gray border border-ws-gray-light rounded-xl text-ws-white font-medium hover:bg-ws-gray-light transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuer avec Google
            </button>

            <button
              type="button"
              className="w-full py-4 bg-ws-gray border border-ws-gray-light rounded-xl text-ws-white font-medium hover:bg-ws-gray-light transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continuer avec Apple
            </button>
          </div>

          {/* Terms */}
          <p className="text-center text-ws-white-dim text-xs mt-8">
            En te connectant, tu acceptes nos{" "}
            <a href="#" className="text-ws-green hover:underline">Conditions</a>
            {" "}et notre{" "}
            <a href="#" className="text-ws-green hover:underline">Politique de confidentialité</a>
          </p>
        </div>
      </main>
    </div>
  );
}

