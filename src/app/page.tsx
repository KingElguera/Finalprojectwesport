import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-ws-dark overflow-hidden">
      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-ws-green/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-ws-emerald/15 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-ws-lime/10 rounded-full blur-[80px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-2">
          <Image 
            src="/logo_WeSport.jpg" 
            alt="WeSport Logo" 
            width={44} 
            height={44} 
            className="rounded-xl"
          />
          <span className="text-xl font-bold text-ws-white">WeSport</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-ws-white-dim hover:text-ws-green transition-colors">Fonctionnalités</a>
          <a href="#sports" className="text-ws-white-dim hover:text-ws-green transition-colors">Sports</a>
          <a href="#about" className="text-ws-white-dim hover:text-ws-green transition-colors">À propos</a>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/login" 
            className="px-5 py-2.5 text-ws-white-dim hover:text-ws-white transition-colors"
          >
            Connexion
          </Link>
          <Link 
            href="/register" 
            className="px-5 py-2.5 bg-gradient-to-r from-ws-green to-ws-emerald hover:from-ws-green-light hover:to-ws-green text-ws-dark font-semibold rounded-full transition-all hover:scale-105 glow-green"
          >
            S&apos;inscrire
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 px-6 md:px-12 pt-12 md:pt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="opacity-0 animate-slide-up inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-ws-white-dim">
              <span className="w-2 h-2 bg-ws-green rounded-full animate-pulse" />
              Nouveau réseau social 100% sport
            </div>
            
            {/* Main headline */}
            <h1 className="opacity-0 animate-slide-up stagger-1 text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight">
              <span className="text-ws-white">Trouve ton</span>
              <br />
              <span className="gradient-text">partenaire</span>
              <br />
              <span className="text-ws-white">de sport</span>
            </h1>

            {/* Subtitle */}
            <p className="opacity-0 animate-slide-up stagger-2 text-lg md:text-xl text-ws-white-dim max-w-2xl mx-auto leading-relaxed">
              Fini les séances solo. Connecte-toi avec des sportifs motivés autour de toi, 
              partage tes exploits et trouve le partenaire idéal pour ta prochaine session.
            </p>

            {/* CTA Buttons */}
            <div className="opacity-0 animate-slide-up stagger-3 flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link 
                href="/register"
                className="group px-8 py-4 bg-gradient-to-r from-ws-green via-ws-emerald to-ws-green-dark text-ws-dark font-bold text-lg rounded-full transition-all hover:scale-105 animate-pulse-glow"
              >
                Commencer gratuitement
                <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link 
                href="#features"
                className="px-8 py-4 glass text-ws-white font-semibold rounded-full hover:bg-ws-green/10 transition-all border border-ws-green/30"
              >
                Découvrir les fonctionnalités
              </Link>
            </div>

            {/* Stats */}
            <div className="opacity-0 animate-slide-up stagger-4 flex flex-wrap items-center justify-center gap-8 md:gap-16 pt-12 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-ws-green">500+</div>
                <div className="text-sm text-ws-white-dim">Sportifs actifs</div>
              </div>
              <div className="w-px h-12 bg-ws-gray hidden md:block" />
              <div>
                <div className="text-3xl md:text-4xl font-bold text-ws-lime">15+</div>
                <div className="text-sm text-ws-white-dim">Sports disponibles</div>
              </div>
              <div className="w-px h-12 bg-ws-gray hidden md:block" />
              <div>
                <div className="text-3xl md:text-4xl font-bold text-ws-emerald">1000+</div>
                <div className="text-sm text-ws-white-dim">Sessions organisées</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="max-w-6xl mx-auto pt-32 pb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-ws-white mb-4">
              Tout ce qu&apos;il te faut pour
              <span className="gradient-text"> performer</span>
            </h2>
            <p className="text-ws-white-dim text-lg max-w-xl mx-auto">
              Des fonctionnalités pensées pour les sportifs, par des sportifs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group p-8 rounded-3xl glass hover:bg-ws-green/10 transition-all duration-300 hover:-translate-y-2 hover:border-ws-green/40">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ws-green/30 to-ws-emerald/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-ws-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-ws-white mb-3">Trouve autour de toi</h3>
              <p className="text-ws-white-dim leading-relaxed">
                Découvre les sportifs près de chez toi qui pratiquent les mêmes sports. 
                Filtre par niveau, disponibilité et distance.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-3xl glass hover:bg-ws-green/10 transition-all duration-300 hover:-translate-y-2 hover:border-ws-green/40">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ws-lime/30 to-ws-green/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-ws-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-ws-white mb-3">Partage tes exploits</h3>
              <p className="text-ws-white-dim leading-relaxed">
                Poste tes vidéos et photos d&apos;entraînement. Montre tes progrès 
                et inspire la communauté avec tes accomplissements.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-3xl glass hover:bg-ws-green/10 transition-all duration-300 hover:-translate-y-2 hover:border-ws-green/40">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ws-emerald/30 to-ws-lime/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-ws-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-ws-white mb-3">Motivation collective</h3>
              <p className="text-ws-white-dim leading-relaxed">
                Likes, commentaires, encouragements. La communauté te pousse 
                à te dépasser et à rester constant dans tes efforts.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 rounded-3xl glass hover:bg-ws-green/10 transition-all duration-300 hover:-translate-y-2 hover:border-ws-green/40">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ws-green/30 to-ws-lime/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-ws-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-ws-white mb-3">Match de partenaires</h3>
              <p className="text-ws-white-dim leading-relaxed">
                Notre algorithme te propose des partenaires compatibles 
                selon tes préférences, niveau et objectifs sportifs.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 rounded-3xl glass hover:bg-ws-green/10 transition-all duration-300 hover:-translate-y-2 hover:border-ws-green/40">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ws-lime/30 to-ws-emerald/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-ws-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-ws-white mb-3">Organise des sessions</h3>
              <p className="text-ws-white-dim leading-relaxed">
                Crée des événements sportifs, invite des membres et 
                organise facilement tes prochaines séances de groupe.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 rounded-3xl glass hover:bg-ws-green/10 transition-all duration-300 hover:-translate-y-2 hover:border-ws-green/40">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ws-emerald/30 to-ws-green/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-ws-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-ws-white mb-3">Suis tes progrès</h3>
              <p className="text-ws-white-dim leading-relaxed">
                Visualise ton évolution, tes séances effectuées et 
                tes statistiques personnelles au fil du temps.
              </p>
            </div>
          </div>
        </section>

        {/* Sports Section */}
        <section id="sports" className="max-w-6xl mx-auto py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-ws-white mb-4">
              Tous les sports,
              <span className="gradient-text"> une seule app</span>
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              "⚽ Football", "🏀 Basketball", "🎾 Tennis", "🏋️ Musculation",
              "🏃 Running", "🚴 Cyclisme", "🥊 Boxe", "🏊 Natation",
              "⛹️ Handball", "🧘 Yoga", "🎯 Padel", "🏐 Volleyball"
            ].map((sport) => (
              <span
                key={sport}
                className="px-6 py-3 rounded-full glass text-ws-white hover:bg-ws-green/20 hover:border-ws-green/40 transition-colors cursor-default"
              >
                {sport}
              </span>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto py-20 text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-ws-green/20 via-ws-dark-lighter to-ws-emerald/10 border border-ws-green/30 glow-green">
            <h2 className="text-3xl md:text-4xl font-bold text-ws-white mb-4">
              Prêt à rejoindre la communauté ?
            </h2>
            <p className="text-ws-white-dim text-lg mb-8 max-w-xl mx-auto">
              Inscris-toi gratuitement et trouve ton premier partenaire de sport dès aujourd&apos;hui.
            </p>
            <Link 
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-ws-green to-ws-emerald hover:from-ws-green-light hover:to-ws-green text-ws-dark font-bold text-lg rounded-full transition-all hover:scale-105"
            >
              Créer mon compte
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-ws-gray py-12">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Image 
                src="/logo_WeSport.jpg" 
                alt="WeSport Logo" 
                width={32} 
                height={32} 
                className="rounded-lg"
              />
              <span className="font-bold text-ws-white">WeSport</span>
            </div>
            <p className="text-ws-white-dim text-sm">
              © 2024 WeSport. Projet académique.
            </p>
            <div className="flex items-center gap-6 text-sm text-ws-white-dim">
              <a href="#" className="hover:text-ws-green transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-ws-green transition-colors">Conditions</a>
              <a href="#" className="hover:text-ws-green transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
