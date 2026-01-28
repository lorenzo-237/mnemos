# Amnemo - Gestion de Parc Informatique

Application Next.js 16 de gestion de parc informatique avec historisation des versions logicielles.

## 🚀 Démarrage rapide

### Prérequis

- Node.js 20+
- PostgreSQL
- npm ou pnpm

### Installation

1. **Cloner le projet et installer les dépendances**

```bash
cd mnemos-next
npm install
```

2. **Configurer la base de données**

Créer un fichier `.env` avec votre connexion PostgreSQL :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/db_mnemos?schema=public"
ENCRYPTION_KEY="votre_cle_generee_avec_openssl"
```

exemple

```
DATABASE_URL="postgresql://postgres:lorenzo@localhost:5432/db_mnemos?schema=public"
ENCRYPTION_KEY="64025e1b5d1e327fc491651b206e5e9a285e2f63e33f6e4b28155d88933cf22e"
```

Générer une clé de chiffrement :

```bash
openssl rand -hex 32
```

3. **Initialiser la base de données**

```bash
npx prisma migrate dev
npx prisma generate
```

4. **Lancer l'application**

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 📋 Fonctionnalités

### Gestion des Sites

- ✅ Créer, modifier, supprimer des sites
- ✅ Organisation par dossiers
- ✅ Système de tags multi-sélectionnables
- ✅ Filtrage combiné par dossiers et tags (multi-sélection)
- ✅ Métadonnées personnalisables (icône, clé-valeur)
- ✅ Gestion des sites obsolètes avec raison

### Gestion des Machines

- ✅ Créer, modifier, supprimer des machines
- ✅ Types : Serveur / Client
- ✅ Stockage sécurisé des accès TeamViewer (chiffrement AES-256-GCM)
- ✅ Copie en un clic des identifiants

### Gestion des Installations

- ✅ Ajouter des logiciels avec autocomplétion
- ✅ Métadonnées personnalisables sur les logiciels (icône, clé-valeur)
- ✅ Mettre à jour les versions
- ✅ Retirer des logiciels (historisé)
- ✅ Timeline complète de l'historique

### Gestion des Tâches

- ✅ Créer, modifier, supprimer des tâches de maintenance
- ✅ Types de tâches : Standard / Remplacement de logiciel
- ✅ Tâches ciblées par type de machine (Serveur/Client)
- ✅ Organisation par type de machine
- ✅ Configuration du logiciel cible et version pour les remplacements
- ✅ Mise à jour automatique des installations lors de la validation

### Sessions de Mise à Jour

- ✅ Créer des sessions de mise à jour par dossier ou tag
- ✅ Préparation : assigner des tâches aux machines
- ✅ Configuration des remplacements de logiciels lors de la préparation
- ✅ Suivi en temps réel avec statistiques de progression
- ✅ Affichage du logiciel cible et version pour les remplacements
- ✅ États des tâches : En attente / En cours / Terminée / Ignorée
- ✅ Annuler le démarrage d'une session
- ✅ Réouvrir une session terminée
- ✅ Vue tableau pour une meilleure lisibilité

### Prise en Main à Distance

- ✅ Vue optimisée pour la prise en main TeamViewer
- ✅ Affichage de toutes les machines par sites
- ✅ Filtrage combiné par dossiers et tags
- ✅ Copie rapide des identifiants TeamViewer

### Interface

- ✅ Mode sombre / clair / système
- ✅ Système de notifications toast (Sonner)
- ✅ Interface responsive et moderne

### Sécurité

- 🔒 Chiffrement AES-256-GCM pour mots de passe TeamViewer
- 🔒 Validation Zod côté serveur
- 🔒 Server Actions avec protection CSRF

## 🛠️ Stack Technique

- **Framework** : Next.js 16 (App Router)
- **UI** : React 19, shadcn/ui (radix-lyra), Tailwind CSS 4
- **Base de données** : PostgreSQL + Prisma ORM
- **Validation** : Zod
- **Chiffrement** : Node.js crypto (AES-256-GCM)
- **Icônes** : Hugeicons
- **Notifications** : Sonner (toast)
- **Thèmes** : next-themes (dark/light/system)

## 📁 Structure du Projet

```
mnemos-next/
├── app/
│   ├── (dashboard)/          # Routes avec sidebar
│   │   ├── sites/            # Gestion des sites
│   │   ├── logiciels/        # Liste des logiciels
│   │   ├── tasks/            # Gestion des tâches
│   │   ├── updates/          # Sessions de mise à jour
│   │   ├── remote-access/    # Vue prise en main
│   │   └── layout.tsx        # Layout avec sidebar
│   ├── layout.tsx            # Layout racine avec ThemeProvider
│   └── page.tsx              # Redirection vers /sites
├── components/
│   ├── layout/               # Sidebar, navigation
│   ├── sites/                # Composants sites
│   ├── machines/             # Composants machines
│   ├── installations/        # Composants installations
│   ├── tasks/                # Composants tâches
│   ├── updates/              # Composants sessions
│   ├── folders/              # Composants dossiers
│   ├── tags/                 # Composants tags
│   ├── remote-access/        # Composants prise en main
│   ├── shared/               # Composants réutilisables
│   ├── ui/                   # shadcn/ui components
│   ├── theme-provider.tsx    # Provider de thème
│   └── theme-toggle.tsx      # Bouton de changement de thème
├── lib/
│   ├── actions/              # Server Actions
│   │   ├── sites.ts          # Actions sites
│   │   ├── machines.ts       # Actions machines
│   │   ├── installations.ts  # Actions installations
│   │   ├── tasks.ts          # Actions tâches
│   │   ├── update-sessions.ts # Actions sessions
│   │   ├── folders.ts        # Actions dossiers
│   │   └── tags.ts           # Actions tags
│   ├── crypto.ts             # Chiffrement
│   ├── validators.ts         # Schémas Zod
│   ├── types.ts              # Types partagés
│   └── prisma.ts             # Client Prisma
└── prisma/
    ├── schema.prisma         # Schéma de base
    └── migrations/           # Migrations
```

## 🗄️ Modèle de Données

### Folder (Dossier)

Organisation logique des sites (ex: "Clients 2024", "Serveurs Production").

### Tag

Étiquettes transversales pour catégoriser les sites (ex: "Urgent", "À migrer").

### Site

Centre informatique logique contenant des machines.
- Appartient optionnellement à un dossier
- Peut avoir plusieurs tags
- Métadonnées personnalisables (JSON)
- Gestion de l'obsolescence

### Machine

- Nom unique par site
- Type (SERVER/CLIENT)
- Identifiants TeamViewer chiffrés
- Liste d'installations

### Software

Référentiel de logiciels installables.
- Métadonnées personnalisables (JSON)
- Description et icône

### Installation

- Lien Machine ↔ Software
- Version spécifique
- Dates d'installation et de retrait
- Historisation complète (pas de suppression)

### Task (Tâche)

Tâche de maintenance réutilisable.
- Type : DEFAULT ou SOFTWARE_REPLACEMENT
- Ciblée par type de machine (SERVER/CLIENT)
- Description et icône

### UpdateSession (Session de mise à jour)

Session de travail pour organiser des mises à jour.
- Filtrée par dossier ou tag
- États : À préparer / En cours / Terminée
- Contient plusieurs UpdateTask

### UpdateTask

Tâche assignée à une machine dans une session.
- Statut : PENDING / IN_PROGRESS / COMPLETED / SKIPPED
- Notes optionnelles
- Pour les tâches de remplacement : référence au logiciel cible et version

## 📝 Commandes Utiles

```bash
# Développement
npm run dev

# Build production
npm run build
npm run start

# Linter
npm run lint

# Prisma
npx prisma studio              # Interface graphique DB
npx prisma migrate dev         # Créer une migration
npx prisma generate            # Générer le client
npx prisma migrate reset       # Reset DB (⚠️ supprime données)
```

## 📄 Licence

Usage interne - Projet personnel

## 👨‍💻 Développé avec Claude Code

Application générée avec [Claude Code](https://claude.com/claude-code) - CLI officiel d'Anthropic.
