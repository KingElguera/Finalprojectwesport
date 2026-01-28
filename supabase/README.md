# Migrations Supabase

Ce dossier contient les migrations SQL pour configurer la base de données Supabase.

## 📋 Ordre d'exécution

Exécutez les migrations dans l'ordre suivant dans l'éditeur SQL de Supabase :

1. **001_initial_schema.sql** - Crée toutes les tables, index et triggers
2. **002_rls_policies.sql** - Configure les Row Level Security policies
3. **003_storage_policies.sql** - Configure les policies pour Storage

## 🚀 Instructions

### Étape 1 : Créer le projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL du projet et la clé anonyme (Anon Key)

### Étape 2 : Exécuter les migrations SQL

1. Dans le dashboard Supabase, allez dans **SQL Editor**
2. Créez une nouvelle requête
3. Copiez-collez le contenu de `001_initial_schema.sql`
4. Exécutez la requête
5. Répétez pour `002_rls_policies.sql` et `003_storage_policies.sql`

### Étape 3 : Créer les buckets Storage

1. Dans le dashboard Supabase, allez dans **Storage**
2. Créez deux buckets :
   - **avatars** (public)
   - **posts** (public)

### Étape 4 : Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

## 📊 Structure de la base de données

### Tables principales

- **profiles** - Profils utilisateurs (étend auth.users)
- **posts** - Posts des utilisateurs
- **post_likes** - Likes sur les posts
- **post_comments** - Commentaires
- **saved_posts** - Posts sauvegardés
- **follows** - Relations followers/following
- **notifications** - Notifications en temps réel

### Triggers automatiques

- Création automatique du profil lors de l'inscription
- Mise à jour automatique des compteurs (likes, commentaires, followers)
- Création automatique des notifications

## 🔒 Sécurité

Toutes les tables ont Row Level Security (RLS) activé avec des policies appropriées :
- Lecture publique pour les données publiques
- Modification uniquement par le propriétaire
- Contrôle d'accès basé sur l'utilisateur connecté

## ⚠️ Notes importantes

- Les migrations utilisent `CREATE TABLE IF NOT EXISTS` pour éviter les erreurs si exécutées plusieurs fois
- Les triggers sont supprimés et recréés pour éviter les doublons
- Assurez-vous que les buckets Storage sont créés avant d'exécuter `003_storage_policies.sql`

