# Amnemo - Gestion de Parc Informatique

Application Next.js 15 pour la gestion d'infrastructure IT: sites, machines, logiciels, sessions de mise à jour.

## 🚀 Déploiement Docker (Production)

### Prérequis

- Docker installé
- PostgreSQL externe (Azure, AWS RDS, serveur dédié, etc.)
- OpenSSL pour générer les secrets

### 1. Préparer la Base de Données

Créez une base de données PostgreSQL:

```sql
CREATE DATABASE amnemo;
```

Récupérez l'URL de connexion:
```
postgresql://user:password@host:port/amnemo?schema=public
```

### 2. Configuration

Copiez le fichier d'exemple et configurez les variables:

```bash
cp .env.example .env
```

Éditez `.env` et remplissez les valeurs requises:

```bash
# Générer ENCRYPTION_KEY (CRITIQUE - ne jamais changer après!)
echo "ENCRYPTION_KEY=\"$(openssl rand -hex 32)\"" >> .env

# Générer JWT_SECRET
echo "JWT_SECRET=\"$(openssl rand -base64 32)\"" >> .env

# Configurer DATABASE_URL
nano .env  # Ou votre éditeur préféré
```

**Variables requises:**

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | Connexion PostgreSQL | `postgresql://user:pass@host:5432/amnemo?schema=public` |
| `ENCRYPTION_KEY` | Clé AES-256-GCM (32 bytes hex) | Généré par `openssl rand -hex 32` |
| `JWT_SECRET` | Secret JWT (base64) | Généré par `openssl rand -base64 32` |

⚠️ **IMPORTANT**: Ne changez JAMAIS `ENCRYPTION_KEY` après avoir chiffré des données!

### 3. Construire l'Image Docker

```bash
docker build -t amnemo:latest .
```

### 4. Exécuter les Migrations

**Avant le premier démarrage**, appliquez les migrations Prisma:

```bash
docker run --rm \
  --env-file .env \
  amnemo:latest \
  npx prisma migrate deploy
```

### 5. Démarrer l'Application

Avec Docker Compose:

```bash
docker-compose up -d
```

Ou avec Docker directement:

```bash
docker run -d \
  --name amnemo \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  amnemo:latest
```

### 6. Configuration Initiale (Premier Démarrage)

1. Accédez à `http://localhost:3000`
2. Vous serez automatiquement redirigé vers `/setup`
3. Remplissez le formulaire:
   - **Organisation**: Nom de votre société/département
   - **Admin**: Nom d'utilisateur et mot de passe
4. Cliquez sur "Démarrer Amnemo"
5. Connectez-vous avec les identifiants créés

L'application est maintenant prête! 🎉

### 7. Vérifier le Déploiement

```bash
# Health check
curl http://localhost:3000/api/health

# Logs
docker logs -f amnemo

# Statut
docker ps | grep amnemo
```

---

## 🛠️ Développement Local

### Prérequis

- Node.js 20+
- PostgreSQL 14+
- npm ou pnpm

### Installation

```bash
# Cloner le repo
git clone <url>
cd amnemo-next

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres locaux

# Générer le client Prisma
npm run generate

# Exécuter les migrations
npx prisma migrate dev

# Démarrer le serveur de développement
npm run dev
```

Accédez à `http://localhost:3000`

### Scripts Disponibles

```bash
npm run dev          # Développement (port 3000)
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # Linter
npm run generate     # Générer client Prisma
npm run migrate      # Migrations Prisma
npm run create-admin # Créer admin via CLI (tests uniquement)
```

---

## 📊 Architecture

### Stack Technique

- **Framework**: Next.js 15 (App Router, React Server Components)
- **Base de données**: PostgreSQL
- **ORM**: Prisma
- **UI**: shadcn/ui (radix-lyra), Tailwind CSS 4
- **Authentification**: JWT (httpOnly cookies)
- **Cryptographie**:
  - bcrypt (passwords)
  - AES-256-GCM (mots de passe TeamViewer)

### Structure

```
amnemo-next/
├── app/                    # Routes Next.js
│   ├── (dashboard)/       # App principale (protégée)
│   ├── admin/             # Interface admin (ADMIN only)
│   ├── login/             # Authentification
│   ├── setup/             # Configuration initiale
│   └── api/               # API routes
├── components/            # Composants React
│   ├── ui/               # shadcn/ui
│   ├── admin/            # Composants admin
│   ├── auth/             # Auth components
│   └── setup/            # Setup wizard
├── lib/                   # Business logic
│   ├── actions/          # Server Actions
│   ├── auth/             # Authentification
│   └── crypto.ts         # Chiffrement
├── prisma/
│   ├── schema.prisma     # Schéma DB
│   └── migrations/       # Migrations
└── scripts/              # Scripts utilitaires
```

---

## 🔒 Sécurité

### Authentification

- JWT stockés en **httpOnly cookies** (protection XSS)
- **Vérification DB** à chaque requête (révocations instantanées)
- Sessions de 7 jours

### Permissions (par Organisation)

| Rôle | Droits |
|------|--------|
| **UTILISATEUR** | Lecture/écriture, pas de suppression |
| **GESTIONNAIRE** | Tout + suppression + mots de passe TeamViewer |
| **ADMIN** | Tout + interface admin |

### Données Sensibles

- **Mots de passe**: bcrypt (12 rounds)
- **TeamViewer**: AES-256-GCM
- **JWT**: HS256

Voir [SECURITY.md](./SECURITY.md) pour plus de détails.

---

## 🔄 Mises à Jour

### Mettre à Jour l'Application

```bash
# 1. Pull nouvelle version
git pull origin main

# 2. Rebuild l'image
docker build -t amnemo:latest .

# 3. Appliquer les migrations
docker run --rm --env-file .env amnemo:latest npx prisma migrate deploy

# 4. Redémarrer le container
docker-compose down && docker-compose up -d
```

### Backup Base de Données

```bash
# Créer un backup
pg_dump <DATABASE_URL> > backup_$(date +%Y%m%d).sql

# Restaurer un backup
psql <DATABASE_URL> < backup_20260201.sql
```

---

## 📝 Multi-Organisation

Amnemo supporte **plusieurs organisations** dans une même instance:

- Chaque organisation a ses propres données (sites, machines, logiciels)
- Un utilisateur peut appartenir à **plusieurs organisations**
- Les rôles sont **par organisation** (ADMIN dans org A, UTILISATEUR dans org B)
- Isolation complète des données

---

## ❓ FAQ

### Comment réinitialiser le mot de passe admin?

Via script CLI (container doit être accessible):

```bash
docker exec -it amnemo npm run create-admin
```

### Le wizard /setup ne s'affiche plus?

Normal! Après le premier setup, le flag `setup_completed` est à `true`.
Pour accéder à nouveau au wizard (⚠️ dangereux):

```sql
UPDATE settings SET setup_completed = false WHERE id = 1;
-- Puis supprimer tous les users si vous voulez recommencer à zéro
DELETE FROM user_organizations;
DELETE FROM users;
```

### Comment ajouter un utilisateur?

Via l'interface admin (connecté en tant qu'ADMIN):
1. Aller dans `/admin/users`
2. "Nouvel utilisateur"
3. Assigner à une organisation avec un rôle

### L'application ne démarre pas?

Vérifiez:

```bash
# Logs Docker
docker logs amnemo

# Health check
curl http://localhost:3000/api/health

# Variables d'environnement
docker exec amnemo env | grep -E 'DATABASE_URL|JWT_SECRET|ENCRYPTION_KEY'

# Connexion DB
docker exec amnemo npx prisma db pull
```

---

## 📄 Licence

Projet personnel - Tous droits réservés

---

## 🤝 Support

Pour toute question ou problème, contactez l'administrateur système.
