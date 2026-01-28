# Scripts de seed

## seed-places.ts

Script pour remplir la base de données avec des terrains de foot à 5 depuis OpenStreetMap.

### Prérequis

1. **Variables d'environnement** : Assurez-vous d'avoir un fichier `.env.local` à la racine du projet avec :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
   ```

2. **Migration SQL** : Exécutez la migration `006_seed_functions.sql` dans Supabase pour créer les fonctions helper nécessaires :
   - `check_location_exists` : Vérifie si un terrain existe déjà dans un rayon donné
   - `insert_location_with_coords` : Insère un terrain avec coordonnées PostGIS

### Utilisation

```bash
npm run seed:places
```

### Configuration

Le script utilise par défaut Paris comme zone de recherche. Vous pouvez personnaliser la zone en ajoutant ces variables dans `.env.local` :

```env
SEED_LAT=48.8566        # Latitude du centre (défaut: Paris)
SEED_LNG=2.3522         # Longitude du centre (défaut: Paris)
SEED_RADIUS_KM=10       # Rayon de recherche en km (défaut: 10)
```

### Fonctionnement

1. **Requête Overpass** : Le script interroge l'API Overpass d'OpenStreetMap pour trouver tous les terrains avec les tags :
   - `sport=five-a-side`
   - `sport=futsal`

2. **Transformation** : Les données sont transformées pour correspondre au schéma de la table `locations` :
   - Nom extrait du tag `name` ou généré automatiquement
   - Type fixé à `'five-a-side'`
   - Coordonnées converties au format PostGIS `geography(Point, 4326)`
   - Adresse extraite des tags `addr:*`

3. **Insertion** : Chaque terrain est inséré dans Supabase avec :
   - Vérification des doublons par distance spatiale (50m par défaut)
   - Gestion automatique des conflits via `ON CONFLICT DO NOTHING`

### Résultat

Le script affiche :
- Le nombre de terrains trouvés dans OpenStreetMap
- Le nombre de terrains insérés avec succès
- Le nombre de doublons ignorés
- Le nombre d'erreurs éventuelles

