"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const COUNTRY_CODES = [
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+1", country: "USA/Canada", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+49", country: "Allemagne", flag: "🇩🇪" },
  { code: "+34", country: "Espagne", flag: "🇪🇸" },
  { code: "+39", country: "Italie", flag: "🇮🇹" },
  { code: "+32", country: "Belgique", flag: "🇧🇪" },
  { code: "+41", country: "Suisse", flag: "🇨🇭" },
  { code: "+212", country: "Maroc", flag: "🇲🇦" },
  { code: "+213", country: "Algérie", flag: "🇩🇿" },
  { code: "+216", country: "Tunisie", flag: "🇹🇳" },
  { code: "+221", country: "Sénégal", flag: "🇸🇳" },
  { code: "+225", country: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "+91", country: "Inde", flag: "🇮🇳" },
  { code: "+86", country: "Chine", flag: "🇨🇳" },
  { code: "+81", country: "Japon", flag: "🇯🇵" },
];

const SPORTS = [
  { id: "football", name: "Football", emoji: "⚽" },
  { id: "basketball", name: "Basketball", emoji: "🏀" },
  { id: "tennis", name: "Tennis", emoji: "🎾" },
  { id: "musculation", name: "Musculation", emoji: "🏋️" },
  { id: "running", name: "Running", emoji: "🏃" },
  { id: "cyclisme", name: "Cyclisme", emoji: "🚴" },
  { id: "boxe", name: "Boxe", emoji: "🥊" },
  { id: "natation", name: "Natation", emoji: "🏊" },
  { id: "handball", name: "Handball", emoji: "⛹️" },
  { id: "yoga", name: "Yoga", emoji: "🧘" },
  { id: "padel", name: "Padel", emoji: "🎾" },
  { id: "volleyball", name: "Volleyball", emoji: "🏐" },
  { id: "rugby", name: "Rugby", emoji: "🏉" },
  { id: "golf", name: "Golf", emoji: "⛳" },
  { id: "escalade", name: "Escalade", emoji: "🧗" },
  { id: "danse", name: "Danse", emoji: "💃" },
];

const FEED_PREFERENCES = [
  { id: "exploits", name: "Exploits & Records", desc: "Les accomplissements de la communauté" },
  { id: "motivation", name: "Motivation", desc: "Posts motivants et inspirants" },
  { id: "tips", name: "Conseils & Astuces", desc: "Tips d'entraînement et nutrition" },
  { id: "challenges", name: "Challenges", desc: "Défis sportifs à relever" },
  { id: "meetups", name: "Rencontres", desc: "Sessions et événements près de toi" },
  { id: "progress", name: "Transformations", desc: "Avant/après et progressions" },
];

// Get today's date for max date validation
const today = new Date().toISOString().split('T')[0];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    email: "",
    countryCode: "+33",
    phone: "",
    password: "",
    sports: [] as string[],
    feedPreferences: [] as string[],
  });

  const toggleSport = (sportId: string) => {
    setFormData(prev => ({
      ...prev,
      sports: prev.sports.includes(sportId)
        ? prev.sports.filter(s => s !== sportId)
        : [...prev.sports, sportId]
    }));
  };

  const toggleFeed = (feedId: string) => {
    setFormData(prev => ({
      ...prev,
      feedPreferences: prev.feedPreferences.includes(feedId)
        ? prev.feedPreferences.filter(f => f !== feedId)
        : [...prev.feedPreferences, feedId]
    }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  // Fonction pour créer le compte
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Créer le compte utilisateur (email + mot de passe)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          // Désactiver la confirmation email pour le dev
          emailRedirectTo: `${window.location.origin}/app`,
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("Erreur lors de la création du compte");
      }

      // 2. Essayer de créer le profil (peut échouer si la table n'existe pas)
      try {
        await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            birth_date: formData.birthDate,
            email: formData.email,
            phone: formData.phone,
            country_code: formData.countryCode,
            sports: formData.sports,
            feed_preferences: formData.feedPreferences,
          });
      } catch (profileErr) {
        console.log('Profile creation skipped (table may not exist)');
      }

      // 3. Se connecter immédiatement après l'inscription
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        // Si email confirmation requise, informer l'utilisateur
        if (signInError.message.includes('Email not confirmed')) {
          throw new Error("Un email de confirmation a été envoyé. Veuillez confirmer votre email puis vous connecter.");
        }
        throw new Error(signInError.message);
      }

      // 4. Attendre un peu que l'AuthProvider se mette à jour
      await new Promise(resolve => setTimeout(resolve, 500));

      // 5. Redirection vers l'app principale
      router.push('/app');

    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ws-dark">
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
          href="/login" 
          className="text-ws-white-dim hover:text-ws-white transition-colors"
        >
          Déjà un compte ? <span className="text-ws-green font-semibold">Connexion</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-6 md:px-12 py-8 max-w-2xl mx-auto">

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-ws-white mb-2">
                Crée ton profil
              </h1>
              <p className="text-ws-white-dim">
                Quelques infos pour commencer
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-ws-white-dim text-sm mb-2">Prénom</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  placeholder="Kylian"
                  className="w-full px-4 py-3 bg-ws-gray border border-ws-gray-light rounded-xl text-ws-white placeholder:text-ws-white-dim/50 focus:outline-none focus:border-ws-green transition-colors"
                />
              </div>
              <div>
                <label className="block text-ws-white-dim text-sm mb-2">Nom</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  placeholder="Mbappé"
                  className="w-full px-4 py-3 bg-ws-gray border border-ws-gray-light rounded-xl text-ws-white placeholder:text-ws-white-dim/50 focus:outline-none focus:border-ws-green transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-ws-white-dim text-sm mb-2">Date de naissance</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                max={today}
                className="w-full px-4 py-3 bg-ws-gray border border-ws-gray-light rounded-xl text-ws-white focus:outline-none focus:border-ws-green transition-colors"
              />
            </div>

            <div>
              <label className="block text-ws-white-dim text-sm mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="ton@email.com"
                className="w-full px-4 py-3 bg-ws-gray border border-ws-gray-light rounded-xl text-ws-white placeholder:text-ws-white-dim/50 focus:outline-none focus:border-ws-green transition-colors"
              />
            </div>

            <div>
              <label className="block text-ws-white-dim text-sm mb-2">Téléphone</label>
              <div className="flex gap-2">
                <select
                  value={formData.countryCode}
                  onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                  className="px-3 py-3 bg-ws-gray border border-ws-gray-light rounded-xl text-ws-white focus:outline-none focus:border-ws-green transition-colors"
                >
                  {COUNTRY_CODES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="6 12 34 56 78"
                  className="flex-1 px-4 py-3 bg-ws-gray border border-ws-gray-light rounded-xl text-ws-white placeholder:text-ws-white-dim/50 focus:outline-none focus:border-ws-green transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-ws-white-dim text-sm mb-2">Mot de passe</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-ws-gray border border-ws-gray-light rounded-xl text-ws-white placeholder:text-ws-white-dim/50 focus:outline-none focus:border-ws-green transition-colors"
              />
            </div>

            <button
              onClick={nextStep}
              className="w-full py-4 bg-gradient-to-r from-ws-green to-ws-emerald text-ws-dark font-bold text-lg rounded-xl hover:scale-[1.02] transition-transform"
            >
              Continuer
            </button>
          </div>
        )}

        {/* Step 2: Sports Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-ws-white mb-2">
                Tes sports
              </h1>
              <p className="text-ws-white-dim">
                Sélectionne ceux que tu pratiques
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SPORTS.map((sport) => (
                <button
                  key={sport.id}
                  onClick={() => toggleSport(sport.id)}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                    formData.sports.includes(sport.id)
                      ? "bg-ws-green/20 border-ws-green text-ws-white scale-105"
                      : "bg-ws-gray border-ws-gray-light text-ws-white-dim hover:border-ws-green/50"
                  }`}
                >
                  <div className="text-2xl mb-1">{sport.emoji}</div>
                  <div className="text-sm font-medium">{sport.name}</div>
                </button>
              ))}
            </div>

            {formData.sports.length > 0 && (
              <p className="text-center text-ws-white-dim text-sm">
                {formData.sports.length} sélectionné{formData.sports.length > 1 ? "s" : ""}
              </p>
            )}

            <div className="flex gap-4">
              <button
                onClick={prevStep}
                className="flex-1 py-4 bg-ws-gray text-ws-white font-semibold rounded-xl hover:bg-ws-gray-light transition-colors"
              >
                Retour
              </button>
              <button
                onClick={nextStep}
                className="flex-1 py-4 bg-gradient-to-r from-ws-green to-ws-emerald text-ws-dark font-bold rounded-xl hover:scale-[1.02] transition-transform"
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Feed Preferences */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-ws-white mb-2">
                Pilote ton feed
              </h1>
              <p className="text-ws-white-dim">
                Choisis ce qui t&apos;intéresse
              </p>
            </div>

            <div className="space-y-3">
              {FEED_PREFERENCES.map((pref) => (
                <button
                  key={pref.id}
                  onClick={() => toggleFeed(pref.id)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left flex items-center gap-4 ${
                    formData.feedPreferences.includes(pref.id)
                      ? "bg-ws-green/20 border-ws-green"
                      : "bg-ws-gray border-ws-gray-light hover:border-ws-green/50"
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-semibold text-ws-white">{pref.name}</div>
                    <div className="text-sm text-ws-white-dim">{pref.desc}</div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    formData.feedPreferences.includes(pref.id)
                      ? "bg-ws-green border-ws-green"
                      : "border-ws-gray-light"
                  }`}>
                    {formData.feedPreferences.includes(pref.id) && (
                      <svg className="w-4 h-4 text-ws-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={prevStep}
                disabled={loading}
                className="flex-1 py-4 bg-ws-gray text-ws-white font-semibold rounded-xl hover:bg-ws-gray-light transition-colors disabled:opacity-50"
              >
                Retour
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-ws-green to-ws-emerald text-ws-dark font-bold rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? "Création..." : "Valider"}
              </button>
            </div>
          </div>
        )}

        {/* Terms */}
        <p className="text-center text-ws-white-dim text-xs mt-8">
          En t&apos;inscrivant, tu acceptes nos{" "}
          <a href="#" className="text-ws-green hover:underline">Conditions</a>
          {" "}et notre{" "}
          <a href="#" className="text-ws-green hover:underline">Politique de confidentialité</a>
        </p>
      </main>
    </div>
  );
}
