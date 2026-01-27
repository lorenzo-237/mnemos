# Mnemos - Gestion de Parc Informatique

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
- ✅ Vue d'ensemble avec nombre de machines

### Gestion des Machines

- ✅ Créer, modifier, supprimer des machines
- ✅ Types : Serveur / Client
- ✅ Stockage sécurisé des accès TeamViewer (chiffrement AES-256-GCM)
- ✅ Copie en un clic des identifiants

### Gestion des Installations

- ✅ Ajouter des logiciels avec autocomplétion
- ✅ Mettre à jour les versions
- ✅ Retirer des logiciels (historisé)
- ✅ Timeline complète de l'historique

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

## 📁 Structure du Projet

```
mnemos-next/
├── app/
│   ├── (dashboard)/          # Routes avec sidebar
│   │   ├── sites/            # Gestion des sites
│   │   ├── logiciels/        # Liste des logiciels
│   │   └── layout.tsx        # Layout avec sidebar
│   ├── layout.tsx            # Layout racine
│   └── page.tsx              # Redirection vers /sites
├── components/
│   ├── layout/               # Sidebar, navigation
│   ├── sites/                # Composants sites
│   ├── machines/             # Composants machines
│   ├── installations/        # Composants installations
│   ├── shared/               # Composants réutilisables
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── actions/              # Server Actions
│   ├── crypto.ts             # Chiffrement
│   ├── validators.ts         # Schémas Zod
│   ├── types.ts              # Types partagés
│   └── prisma.ts             # Client Prisma
└── prisma/
    ├── schema.prisma         # Schéma de base
    └── migrations/           # Migrations
```

## 🗄️ Modèle de Données

### Site

Centre informatique logique contenant des machines.

### Machine

- Nom unique par site
- Type (SERVER/CLIENT)
- Identifiants TeamViewer chiffrés
- Liste d'installations

### Software

Référentiel de logiciels installables.

### Installation

- Lien Machine ↔ Software
- Version spécifique
- Dates d'installation et de retrait
- Historisation complète (pas de suppression)

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
