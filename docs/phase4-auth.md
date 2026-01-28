# Phase 4 — Authentification & Multi-Organisation

## Objectif

Ajouter une couche d'authentification username/password avec JWT cookie, un système multi-organisations où chaque organisation possède ses données, et un modèle de rôles simple (3 niveaux).

---

## Analyse du scope

### Ce qui change dans le schéma

Chaque entité "possédée" par une organisation nécessite un `organizationId` direct. Les entités dérivées (Machine → Site, Installation → Machine, UpdateTask → UpdateSession) sont scopées implicitement via leur parent.

| Modèle          | organizationId direct | Raison                    |
| --------------- | --------------------- | ------------------------- |
| `Site`          | oui                   | entité racine             |
| `Folder`        | oui                   | entité racine             |
| `Tag`           | oui                   | entité racine             |
| `Task`          | oui                   | entité racine             |
| `Software`      | oui                   | entité racine             |
| `UpdateSession` | oui                   | entité racine             |
| `Machine`       | non                   | scopé via `Site`          |
| `Installation`  | non                   | scopé via `Machine`       |
| `UpdateTask`    | non                   | scopé via `UpdateSession` |

### Contrainte unique par organisation

Les contraintes `@unique` actuellement globales doivent devenir **uniques par organisation** :

| Modèle     | Contrainte actuelle | Nouvelle contrainte                |
| ---------- | ------------------- | ---------------------------------- |
| `Folder`   | `name @unique`      | `@@unique([name, organizationId])` |
| `Tag`      | `name @unique`      | `@@unique([name, organizationId])` |
| `Site`     | `name @unique`      | `@@unique([name, organizationId])` |
| `Software` | `name @unique`      | `@@unique([name, organizationId])` |

> Deux organisations peuvent donc avoir un site "Paris" chacune sans conflit.

### Champs de traçabilité

Ajoutés sur les entités directement CRUD'd par l'utilisateur. Non affichés en UI mais présents en base pour audit.

```
createdById  Int?  // FK → users
updatedById  Int?  // FK → users
```

Modèles concernés : `Site`, `Folder`, `Tag`, `Task`, `Software`, `UpdateSession`, `Machine`

---

## Schéma — nouveaux modèles

```prisma
enum UserRole {
  UTILISATEUR
  GESTIONNAIRE
  ADMIN
}

model Organization {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  createdAt DateTime @default(now())
  users     UserOrganization[]
  // Relations vers les données possédées
  folders        Folder[]
  tags           Tag[]
  sites          Site[]
  tasks          Task[]
  softwares      Software[]
  updateSessions UpdateSession[]

  @@map("organizations")
}

model User {
  id           Int      @id @default(autoincrement())
  username     String   @unique
  passwordHash String
  role         UserRole @default(UTILISATEUR)
  createdAt    DateTime @default(now())
  organizations UserOrganization[]

  @@map("users")
}

model UserOrganization {
  userId        Int
  organizationId Int
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@id([userId, organizationId])
  @@map("user_organizations")
}
```

---

## Modèles existants — modifications

### Exemple : Folder (pattern à répéter)

```prisma
model Folder {
  id             Int             @id @default(autoincrement())
  name           String
  organizationId Int
  organization   Organization    @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  createdById    Int?
  updatedById    Int?
  createdAt      DateTime        @default(now())
  sites          Site[]
  updateSessions UpdateSession[]

  @@unique([name, organizationId])
  @@index([organizationId])
  @@map("folders")
}
```

Même pattern pour `Tag`, `Site`, `Task`, `Software`, `UpdateSession` : ajouter `organizationId` (required, FK avec Cascade), `createdById`/`updatedById` (nullable), remplacer `@unique` sur `name` par `@@unique([name, organizationId])`.

---

## Infrastructure d'authentification

### Dépendances à installer

```bash
cd amnemo-next
npm install bcryptjs jose
npm install -D @types/bcryptjs
```

- **bcryptjs** : hashing des mots de passe (pur JS, pas besoin de compilation native)
- **jose** : signer/vérifier les JWT (ESM-compatible, pas de problème avec Next.js)

### Structure des fichiers

```
lib/
├── auth/
│   ├── config.ts       # Constantes : SECRET, cookie name, expiration
│   ├── jwt.ts          # signToken() / verifyToken()
│   ├── password.ts     # hashPassword() / comparePassword()
│   └── session.ts      # getSession() — lit le cookie, vérifie le JWT, retourne { userId, organizationId, role }
middleware.ts           # Vérifie l'auth sur chaque requête, redirige vers /login si absent
app/
├── login/
│   └── page.tsx        # Page de connexion
├── api/
│   ├── auth/
│   │   ├── login/
│   │   │   └── route.ts   # POST — valide credentials, set cookie JWT
│   │   └── logout/
│   │       └── route.ts   # POST — efface le cookie
scripts/
└── create-admin.ts     # Bootstrap : crée org + user admin
```

### `lib/auth/config.ts`

```typescript
export const AUTH_CONFIG = {
  cookieName: "amnemo_session",
  secret: process.env.JWT_SECRET!, // 32+ bytes, dans .env
  expiresIn: "7d", // durée du JWT
} as const;
```

### `lib/auth/jwt.ts`

```typescript
import { SignJWT, jwtVerify } from "jose";
import { AUTH_CONFIG } from "./config";

const secret = new TextEncoder().encode(AUTH_CONFIG.secret);

export interface JwtPayload {
  userId: number;
  organizationId: number;
  role: "UTILISATEUR" | "GESTIONNAIRE" | "ADMIN";
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(AUTH_CONFIG.expiresIn)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as JwtPayload;
  } catch {
    return null;
  }
}
```

### `lib/auth/password.ts`

```typescript
import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### `lib/auth/session.ts`

Fonction utilisée dans chaque server action ou page server pour obtenir le contexte de l'utilisateur courant.

```typescript
import { cookies } from "next/headers";
import { verifyToken, JwtPayload } from "./jwt";
import { AUTH_CONFIG } from "./config";

export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// Version stricte — throw si pas de session (pour les actions)
export async function requireSession(): Promise<JwtPayload> {
  const session = await getSession();
  if (!session) throw new Error("Non authentifié");
  return session;
}
```

### `middleware.ts` (racine du projet)

```typescript
import { NextResponse, NextRequest } from "next/server";
import { verifyToken } from "./lib/auth/jwt";
import { AUTH_CONFIG } from "./lib/auth/config";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_CONFIG.cookieName)?.value;

  // Chemins publics — pas d'auth nécessaire
  if (request.nextUrl.pathname === "/login") {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### API routes

**`app/api/auth/login/route.ts`** — POST

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { AUTH_CONFIG } from "@/lib/auth/config";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    return NextResponse.json(
      { error: "Identifiants invalides" },
      { status: 401 },
    );
  }

  // Première organisation de l'utilisateur comme organisation par défaut
  const firstOrg = await prisma.userOrganization.findFirst({
    where: { userId: user.id },
  });
  if (!firstOrg) {
    return NextResponse.json(
      { error: "Aucune organisation associée" },
      { status: 403 },
    );
  }

  const token = await signToken({
    userId: user.id,
    organizationId: firstOrg.organizationId,
    role: user.role,
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_CONFIG.cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  });
  return response;
}
```

**`app/api/auth/logout/route.ts`** — POST

```typescript
import { NextResponse } from "next/server";
import { AUTH_CONFIG } from "@/lib/auth/config";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(AUTH_CONFIG.cookieName);
  return response;
}
```

**`app/api/auth/switch-org/route.ts`** — POST

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { signToken } from "@/lib/auth/jwt";
import { AUTH_CONFIG } from "@/lib/auth/config";

export async function POST(request: Request) {
  const session = await requireSession();
  const { organizationId } = await request.json();

  // Vérifier que l'utilisateur appartient à cette org
  const membership = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: { userId: session.userId, organizationId },
    },
  });
  if (!membership) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const token = await signToken({
    userId: session.userId,
    organizationId,
    role: session.role,
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_CONFIG.cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
```

---

## Script bootstrap admin

**`scripts/create-admin.ts`**

Exécuté une seule fois pour initialiser le système. Crée une organisation par défaut et un utilisateur admin.

```typescript
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth/password";

async function main() {
  const orgName = process.env.ADMIN_ORG_NAME || "Ma Organisation";
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "changeme";

  // Créer l'organisation si elle n'existe pas
  const org = await prisma.organization.upsert({
    where: { name: orgName },
    create: { name: orgName },
    update: {},
  });

  // Créer l'utilisateur admin
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.upsert({
    where: { username },
    create: { username, passwordHash, role: "ADMIN" },
    update: { passwordHash, role: "ADMIN" },
  });

  // Associer l'utilisateur à l'organisation
  await prisma.userOrganization.upsert({
    where: {
      userId_organizationId: { userId: user.id, organizationId: org.id },
    },
    create: { userId: user.id, organizationId: org.id },
    update: {},
  });

  console.log(`Organisation "${orgName}" (id: ${org.id})`);
  console.log(`Utilisateur "${username}" (id: ${user.id}, rôle: ADMIN)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Ajout dans `package.json` :

```json
"scripts": {
  "create-admin": "tsx scripts/create-admin.ts"
}
```

---

## Modèle de permissions

### Matrice

| Action                                | UTILISATEUR | GESTIONNAIRE | ADMIN |
| ------------------------------------- | ----------- | ------------ | ----- |
| Lire (toutes les données de l'org)    | ✓           | ✓            | ✓     |
| Créer (site, tâche, machine, etc.)    | ✓           | ✓            | ✓     |
| Modifier                              | ✓           | ✓            | ✓     |
| Supprimer                             | ✗           | ✓            | ✓     |
| Lire/copier mot de passe TeamViewer   | ✗           | ✓            | ✓     |
| Gérer les utilisateurs                | ✗           | ✗            | ✓     |
| Créer des organisations               | ✗           | ✗            | ✓     |
| Associer utilisateurs ↔ organisations | ✗           | ✗            | ✓     |

### Implémentation dans les actions

La permission se vérifie **dans chaque server action** concernée, après `requireSession()`.

```typescript
// Exemple : deleteFolder
export async function deleteFolder(id: number) {
  const session = await requireSession();

  if (session.role === "UTILISATEUR") {
    throw new Error("Permission insuffisante");
  }

  // Vérifier que le dossier appartient à l'org de la session
  const folder = await prisma.folder.findUnique({
    where: { id, organizationId: session.organizationId },
  });
  if (!folder) throw new Error("Non trouvé");

  await prisma.folder.delete({ where: { id } });
  revalidatePath("/sites");
  redirect("/sites");
}
```

### Pattern pour les actions de lecture

Toutes les requêtes de lecture ajoutent `organizationId: session.organizationId` dans le `where` :

```typescript
export async function getFolders() {
  const session = await requireSession();

  return prisma.folder.findMany({
    where: { organizationId: session.organizationId },
    include: { _count: { select: { sites: true } } },
    orderBy: { name: "asc" },
  });
}
```

### Pattern pour les actions de création

```typescript
export async function createFolder(formData: FormData) {
  const session = await requireSession();
  const validated = folderSchema.parse({ name: formData.get("name") });

  await prisma.folder.create({
    data: {
      ...validated,
      organizationId: session.organizationId,
      createdById: session.userId,
    },
  });

  revalidatePath("/sites");
  redirect("/sites");
}
```

### Pattern pour les actions de modification

```typescript
export async function updateFolder(id: number, formData: FormData) {
  const session = await requireSession();
  const validated = folderSchema.parse({ name: formData.get("name") });

  // Scope check : le dossier doit appartenir à l'org
  await prisma.folder.update({
    where: { id, organizationId: session.organizationId },
    data: { ...validated, updatedById: session.userId },
  });

  revalidatePath("/sites");
}
```

### Accès au mot de passe TeamViewer

Dans `getMachineById` (ou partout où le mot de passe est décrypté) :

```typescript
const session = await requireSession();

if (session.role === "UTILISATEUR") {
  // Retourner la machine sans décryption
  return { ...machine, teamviewerPwdDecrypted: null };
}

return {
  ...machine,
  teamviewerPwdDecrypted: machine.teamviewerPwd
    ? decryptTeamViewerPassword(machine.teamviewerPwd)
    : null,
};
```

---

## UI — changements nécessaires

### Page de login (`app/login/page.tsx`)

- Formulaire simple : username + password + bouton "Connexion"
- POST vers `/api/auth/login`
- En cas d'erreur : affiche un message sous le formulaire
- Si déjà authentifié : redirige vers `/`
- Pas de sidebar, layout minimal

### Sidebar — switcher d'organisation

Dans `app-sidebar.tsx`, en bas avant le toggle thème :

- Affiche le nom de l'organisation courante
- Dropdown avec les organisations de l'utilisateur
- Clic → POST vers `/api/auth/switch-org` → refresh de la page

```typescript
// Exemple de structure dans la sidebar
<div className="p-3 border-t">
  <OrgSwitcher /> {/* client component */}
</div>
```

Le `OrgSwitcher` récupère les organisations via une action server passée comme prop (même pattern que `onDeleteTask` dans `TasksTable`).

### Sidebar — bouton logout

Petit bouton ou lien dans le footer de la sidebar → POST vers `/api/auth/logout` → redirect vers `/login`.

### Masquage conditionnel

Les boutons de suppression sont cachés pour le rôle `UTILISATEUR`. Le contexte utilisateur peut être passé depuis le layout server component vers les composants client via props.

---

## Migration des données existantes

Étapes pour la migration vers le schéma multi-org :

1. **Créer les nouveaux modèles** (`Organization`, `User`, `UserOrganization`) + les nouveaux champs sur les modèles existants (`organizationId`, `createdById`, `updatedById`). Les nouveaux champs sont **nullable** d'abord.

2. **Migrer les données** : un script de migration crée une organisation "par défaut" et associe toutes les entités existantes à cette organisation.

```sql
-- Dans la migration Prisma ou un script ponctuel
INSERT INTO organizations (name) VALUES ('Organisation par défaut');
UPDATE sites SET organization_id = 1;
UPDATE folders SET organization_id = 1;
UPDATE tags SET organization_id = 1;
UPDATE tasks SET organization_id = 1;
UPDATE softwares SET organization_id = 1;
UPDATE update_sessions SET organization_id = 1;
```

3. **Rendre `organizationId` required** : une seconde migration après validation.

4. **Supprimer les anciennes contraintes `@unique`** sur `name` et les remplacer par `@@unique([name, organizationId])`.

---

## Ordre d'implémentation

| #   | Étape                                                                            | Fichiers principalement concernés    |
| --- | -------------------------------------------------------------------------------- | ------------------------------------ |
| 1   | Installer dépendances (`bcryptjs`, `jose`)                                       | `package.json`                       |
| 2   | Nouveaux modèles Prisma + migration nullable                                     | `prisma/schema.prisma`               |
| 3   | Script de migration des données existantes                                       | script SQL dans la migration         |
| 4   | Rendre `organizationId` required + contraintes unique                            | migration Prisma                     |
| 5   | `lib/auth/` — config, jwt, password, session                                     | nouveaux fichiers                    |
| 6   | API routes (login, logout, switch-org)                                           | `app/api/auth/`                      |
| 7   | `middleware.ts`                                                                  | nouvelle, racine du projet           |
| 8   | Page login                                                                       | `app/login/page.tsx`                 |
| 9   | Script `create-admin`                                                            | `scripts/create-admin.ts`            |
| 10  | Mettre à jour **chaque** action avec `requireSession()` + scope `organizationId` | `lib/actions/*.ts`                   |
| 11  | OrgSwitcher dans la sidebar                                                      | `components/layout/org-switcher.tsx` |
| 12  | Bouton logout dans la sidebar                                                    | `components/layout/app-sidebar.tsx`  |
| 13  | Masquage conditionnel des actions de suppression (rôle)                          | composants concernés                 |
| 14  | `.env` : ajouter `JWT_SECRET`                                                    | `.env`                               |
| 15  | Tests manuels de chaque scénario                                                 | —                                    |

---

## Variables d'environnement à ajouter

```bash
# .env
JWT_SECRET=<chaîne aléatoire 32+ caractères>

# Variables optionnelles pour le script create-admin
ADMIN_ORG_NAME=Ma Organisation
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme
```

---

## Points d'attention

- **`organizationId` dans les queries relationnelles** : quand on récupère une session avec ses machines via un folder, le scope org est déjà garanti par le folder. Inutile de filtrer aussi sur les machines. Le scope se fait toujours à l'entité racine.
- **Validation Zod unique par org** : les schemas Zod actuels ne vérifient pas l'unicité. La contrainte `@@unique` au niveau Prisma suffit — elle retournera une erreur 409 à gérer dans les actions.
- **`createdById` / `updatedById` nullable** : les données migrées n'auront pas ces valeurs. C'est acceptable pour un MVP — on ne les affiche pas.
- **Pas de middleware-level role check** : les rôles sont vérifiés dans les actions individuelles. Le middleware ne vérifie que l'existence d'une session valide.
