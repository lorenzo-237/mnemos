# Sécurité - Amnemo

## Authentification & Autorisations

### Architecture à 2 Niveaux

#### 1. Middleware (Première Barrière)
**Fichier:** `middleware.ts`

**Rôle:** Vérification rapide de la validité technique du JWT
- ✅ Signature valide
- ✅ Token non expiré
- ✅ Redirection vers `/login` si invalide

**Ne vérifie PAS:**
- ❌ Si l'utilisateur existe toujours
- ❌ Si l'utilisateur a toujours accès à l'organisation
- ❌ Si le rôle a changé

#### 2. requireSession() (Vérification Complète)
**Fichier:** `lib/auth/session.ts`

**Rôle:** Vérification complète en base de données
- ✅ Token valide (via middleware)
- ✅ **Utilisateur existe toujours**
- ✅ **Association user-org existe toujours**
- ✅ **Rôle à jour depuis la base**

**Protège contre:**
- ✅ Utilisateur supprimé → "Accès révoqué"
- ✅ Utilisateur retiré de l'organisation → "Accès révoqué"
- ✅ Organisation supprimée → "Accès révoqué"
- ✅ Rôle modifié → Utilise le nouveau rôle **immédiatement**

### Flux de Sécurité

```
Requête → Middleware → Server Action → requireSession() → DB Check → Autorisation
                          ↓                    ↓               ↓
                    JWT valide?        User-Org existe?   Rôle à jour?
```

### Avantages de Cette Architecture

1. **Changements instantanés**
   - Admin rétrograde un user → Perd ses droits immédiatement
   - Admin retire un user d'une org → Perd l'accès immédiatement

2. **Sécurité maximale**
   - Impossible de garder l'accès après révocation
   - Le JWT est juste un "ticket d'entrée", pas la source de vérité

3. **Performance acceptable**
   - 1 query DB légère par server action
   - Négligeable pour une app interne

4. **Pas de cache à invalider**
   - Pas besoin de Redis
   - Pas de complexité de synchronisation

## Permissions par Rôle

### UTILISATEUR
- ✅ Lecture/écriture (sites, machines, logiciels, etc.)
- ❌ Suppression
- ❌ Voir mots de passe TeamViewer
- ❌ Accès admin

### GESTIONNAIRE
- ✅ Tout ce que UTILISATEUR peut faire
- ✅ Suppression (sites, machines, etc.)
- ✅ Voir mots de passe TeamViewer
- ❌ Accès admin

### ADMIN
- ✅ Tout ce que GESTIONNAIRE peut faire
- ✅ Accès interface admin
- ✅ Gestion des organisations
- ✅ Gestion des utilisateurs
- ✅ Gestion des associations user-org

## Protections Implémentées

### Dans les Server Actions
Toutes les actions utilisent `requireSession()`:
```typescript
export async function deleteFolder(id: number) {
  const session = await requireSession(); // ← Vérification DB

  if (session.role === "UTILISATEUR") {
    throw new Error("Permission insuffisante");
  }
  // ...
}
```

### Dans l'Interface Admin
Protection au niveau layout:
```typescript
export async function requireAdmin() {
  const session = await requireSession(); // ← Vérification DB
  if (session.role !== 'ADMIN') {
    throw new Error('Accès réservé aux administrateurs');
  }
  return session;
}
```

### Protections Métier
- ❌ Supprimer la dernière organisation
- ❌ Supprimer son propre compte
- ❌ Se retirer de son organisation courante
- ❌ Utilisateur sans organisation (minimum 1 requis)

## JWT

### Contenu
```typescript
{
  userId: number;
  organizationId: number;
  role: "UTILISATEUR" | "GESTIONNAIRE" | "ADMIN"; // ⚠️ Indicatif seulement
}
```

### ⚠️ Important
Le rôle dans le JWT est **indicatif** pour l'affichage UI.
La **source de vérité** est la base de données via `requireSession()`.

### Expiration
- **Durée:** 7 jours
- **Impact:** Même après expiration, la DB est vérifiée à chaque requête
- **Révocation:** Les changements sont instantanés malgré l'expiration longue

## Cryptographie

### Mots de Passe
- **Algorithme:** bcrypt
- **Rounds:** 12
- **Stockage:** Hash uniquement (jamais en clair)

### TeamViewer
- **Algorithme:** AES-256-GCM
- **Clé:** Variable d'environnement `ENCRYPTION_KEY`
- **Visibilité:** GESTIONNAIRE et ADMIN uniquement

### JWT
- **Algorithme:** HS256
- **Secret:** Variable d'environnement `JWT_SECRET`
- **Stockage:** Cookie httpOnly, secure (production), sameSite=lax

## Recommandations

### Production
1. ✅ Utiliser HTTPS (secure cookies)
2. ✅ Générer des secrets forts (JWT_SECRET, ENCRYPTION_KEY)
3. ✅ Limiter les tentatives de login (rate limiting)
4. ✅ Logger les actions admin (audit trail)
5. ✅ Rotation régulière des secrets

### Développement
1. ✅ Ne jamais commit les secrets (.env dans .gitignore)
2. ✅ Utiliser des secrets différents par environnement
3. ✅ Tester les révocations de permissions

## Audit

### Actions à Logger (Recommandé)
- Création/suppression d'organisation
- Création/suppression d'utilisateur
- Changement de rôle
- Ajout/retrait d'une organisation
- Changements de mots de passe

### Métriques à Surveiller
- Échecs de connexion répétés
- Erreurs "Accès révoqué" (potentiel attaquant)
- Changements fréquents de rôle/org
