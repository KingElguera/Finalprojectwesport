# WeSport - Social Network for Athletes

Application de réseau social pour les athlètes, construite avec Next.js 14+ et Supabase.

## 🚀 Technologies

- **Frontend**: Next.js 14+ (App Router), React 19, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage, Realtime)
- **PWA**: next-pwa pour le support Progressive Web App

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase

## 🛠️ Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd WeSport
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**

Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

4. **Configurer Supabase**

   a. Créez un nouveau projet sur [Supabase](https://supabase.com)
   
   b. Dans l'éditeur SQL de Supabase, exécutez les migrations dans l'ordre :
      - `supabase/migrations/001_initial_schema.sql`
      - `supabase/migrations/002_rls_policies.sql`
      - `supabase/migrations/003_storage_policies.sql`
   
   c. Créez les buckets Storage dans Supabase Dashboard :
      - `avatars` (public)
      - `posts` (public)

5. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
wesport/
├── app/
│   ├── (auth)/          # Routes d'authentification
│   │   ├── login/
│   │   └── signup/
│   ├── components/      # Composants React
│   ├── layout.tsx       # Layout racine
│   └── page.tsx         # Page d'accueil
├── lib/
│   ├── supabase/        # Configuration Supabase
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── services/         # Services Supabase
│   │   ├── auth.service.ts
│   │   ├── profile.service.ts
│   │   ├── posts.service.ts
│   │   └── notifications.service.ts
│   ├── types.ts         # Types TypeScript
│   └── utils.ts         # Utilitaires
├── supabase/
│   └── migrations/      # Migrations SQL
└── public/              # Fichiers statiques
```

## 🔐 Authentification

L'authentification est gérée par Supabase Auth. Les utilisateurs peuvent :
- S'inscrire avec email/password
- Se connecter
- Réinitialiser leur mot de passe

## 📊 Base de données

Le schéma de base de données inclut :
- `profiles` - Profils utilisateurs
- `posts` - Posts des utilisateurs
- `post_likes` - Likes sur les posts
- `post_comments` - Commentaires
- `saved_posts` - Posts sauvegardés
- `follows` - Relations followers/following
- `notifications` - Notifications en temps réel

## 🔒 Sécurité

- Row Level Security (RLS) activé sur toutes les tables
- Policies configurées pour contrôler l'accès aux données
- Validation côté serveur avec Supabase

## 📱 PWA

L'application est configurée comme PWA avec :
- Manifest.json
- Service Worker
- Support offline
- Installation sur mobile/desktop

## 🧪 Développement

### Commandes disponibles

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # Linter
```

## 📝 Notes

- Les fichiers `profileStorage.ts` et `notificationsStorage.ts` sont temporaires et utilisent localStorage. Ils seront remplacés par les services Supabase lors de l'intégration complète.
- Les données mockées dans `lib/constants.ts` seront remplacées par les vraies données Supabase.

## 🚧 Prochaines étapes

- [ ] Intégration complète des services Supabase dans les composants
- [ ] Remplacement du localStorage par Supabase
- [ ] Implémentation de la pagination infinie
- [ ] Optimisation des images avec compression
- [ ] Tests unitaires et d'intégration

## 📄 Licence

MIT
