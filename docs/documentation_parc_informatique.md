# Documentation – Application de gestion de parc informatique

Stack technique

Nextjs
Prisma
Shadcn

## 1. Objectif du projet

Cette application a pour but de fournir un outil interne de **gestion de parc informatique orienté inventaire**, destiné principalement à un usage personnel, avec une possible ouverture future à d’autres techniciens.

Les objectifs principaux sont :

- Disposer d’une **vue d’inventaire claire** des sites, machines et logiciels
- **Suivre les versions logicielles dans le temps**
- Tracer l’**historique des changements** (versions et logiciels)
- Mettre à jour les informations **manuellement via une interface**
- Centraliser les informations d’accès distant (TeamViewer)

L’application est un outil de **documentation**, sans criticité opérationnelle.

---

## 2. Concepts métiers clés

### 2.1 Site (Centre informatique)

Un site représente un **datacenter logique**, identifié par un nom unique.

Caractéristiques :

- Nom unique
- Peut contenir plusieurs machines

---

### 2.2 Machine

Une machine représente un équipement appartenant à un site.

Types :

- Serveur
- Poste client

Caractéristiques :

- Nom (unique dans un site)
- Type (serveur / client)
- Appartenance à un site
- Informations d’accès distant (TeamViewer)

---

### 2.3 Logiciel

Un logiciel représente un produit installable, indépendamment de sa version.

Caractéristiques :

- Nom unique
- Peut être installé sur plusieurs machines

---

### 2.4 Installation (concept central)

Une installation représente le fait qu’un **logiciel à une version donnée** est installé sur une machine pendant une période donnée.

Caractéristiques :

- Machine
- Logiciel
- Version
- Date d’installation
- Date de fin (si remplacé)

Une installation est considérée comme **active** si la date de fin est nulle.

---

## 3. Règles métier

- Une machine ne peut avoir **qu’une seule version active d’un logiciel**
- Un logiciel peut être installé sur plusieurs machines
- Un site peut contenir plusieurs machines
- Aucun enregistrement n’est supprimé : tout changement est historisé
- Les mises à jour sont manuelles

---

## 4. Accès distant – TeamViewer

### Besoin fonctionnel

Pour chaque machine, il doit être possible de :

- Stocker un identifiant TeamViewer
- Stocker un mot de passe TeamViewer
- Récupérer ces informations à la demande pour une connexion manuelle

### Contraintes de sécurité

- Le mot de passe doit être **chiffré** (et non hashé) afin d’être récupérable
- Le chiffrement doit être réversible
- La clé de chiffrement ne doit jamais être stockée en base de données

---

## 5. Modèle de données (Prisma – PostgreSQL)

```prisma
enum MachineType {
  SERVER
  CLIENT
}

model Site {
  id        Int       @id @default(autoincrement())
  name      String    @unique
  createdAt DateTime  @default(now())

  machines  Machine[]
}

model Machine {
  id              Int       @id @default(autoincrement())
  name            String
  type            MachineType
  siteId          Int
  site            Site      @relation(fields: [siteId], references: [id])

  teamviewerId    String?
  teamviewerPwd   String?

  createdAt       DateTime  @default(now())

  installations   Installation[]

  @@unique([name, siteId])
}

model Software {
  id        Int       @id @default(autoincrement())
  name      String    @unique
  createdAt DateTime  @default(now())

  installations Installation[]
}

model Installation {
  id           Int       @id @default(autoincrement())

  machineId    Int
  softwareId   Int
  version      String

  installedAt DateTime  @default(now())
  removedAt   DateTime?

  machine     Machine   @relation(fields: [machineId], references: [id])
  software    Software  @relation(fields: [softwareId], references: [id])

  @@index([machineId, softwareId])
}
```

---

## 6. Écrans minimum requis (MVP)

### 6.1 Liste des sites

- Affichage de tous les sites
- Nombre de machines par site
- Accès au détail d’un site

---

### 6.2 Détail d’un site

- Liste des machines du site
- Nom, type de machine
- Accès au détail d’une machine
- Ajout de machine

---

### 6.3 Détail d’une machine

- Informations générales (nom, type, site)
- Informations TeamViewer
- Liste des logiciels installés (versions actives)
- Action de mise à jour d’un logiciel

---

### 6.4 Mise à jour d’un logiciel

- Sélection du logiciel
- Saisie de la nouvelle version
- Validation

Effet :

- Clôture de l’installation active
- Création d’une nouvelle installation

---

### 6.5 Historique d’une machine

- Historique chronologique des installations
- Logiciel, version, date de début, date de fin

---

## 7. Flux de mise à jour d’un logiciel

1. L’utilisateur initie une mise à jour depuis la machine
2. Le système identifie l’installation active du logiciel
3. L’installation active est clôturée (date de fin)
4. Une nouvelle installation est créée avec la nouvelle version
5. L’interface reflète immédiatement l’état actuel

Aucune donnée n’est supprimée.

---

## 8. Hors périmètre volontaire (MVP)

- Authentification et gestion des rôles
- API publique
- Gestion avancée des droits
