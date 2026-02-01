# Système de Gestion des Erreurs

## Vue d'ensemble

Le système de gestion des erreurs d'Amnemo utilise un **ErrorProvider** global qui affiche automatiquement les erreurs des server actions dans une **modal bloquante**.

## Architecture

```
app/layout.tsx
└── ErrorProvider (contexte global)
    └── ErrorModal (Dialog shadcn/ui)
```

## Installation (déjà fait)

Le ErrorProvider est déjà intégré dans `app/layout.tsx` :

```tsx
<ThemeProvider>
  <ErrorProvider>
    {children}
    <Toaster />
  </ErrorProvider>
</ThemeProvider>
```

---

## Utilisation

### 1. Dans un Client Component

#### Méthode A : Avec le hook `useError`

```tsx
'use client';

import { useError } from '@/components/error-provider';
import { deleteSite } from '@/lib/actions/sites';

export function MyComponent() {
  const { showError } = useError();

  const handleDelete = async () => {
    try {
      await deleteSite(siteId);
      toast.success('Site supprimé');
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Une erreur est survenue';
      showError(message);
    }
  };

  return <button onClick={handleDelete}>Supprimer</button>;
}
```

#### Méthode B : Avec `useTransition`

```tsx
'use client';

import { useError } from '@/components/error-provider';
import { useTransition } from 'react';

export function MyForm() {
  const [isPending, startTransition] = useTransition();
  const { showError } = useError();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await createSite(formData);
      } catch (error) {
        showError(error instanceof Error ? error.message : 'Erreur');
      }
    });
  };

  return (
    <form action={handleSubmit}>
      {/* ... */}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Création...' : 'Créer'}
      </button>
    </form>
  );
}
```

### 2. Composant existant : DeleteConfirmation

Le composant `DeleteConfirmation` intègre **déjà** le système d'erreur :

```tsx
import { DeleteConfirmation } from '@/components/shared/delete-confirmation';

<DeleteConfirmation
  title="Supprimer ce site ?"
  description="Cette action est irréversible."
  onConfirm={async () => {
    'use server';
    await deleteSite(siteId);
  }}
  trigger={<Button>Supprimer</Button>}
/>
```

**Aucun code supplémentaire nécessaire** — les erreurs sont automatiquement capturées et affichées.

---

## Dans les Server Actions

### Lancer une erreur

Les server actions doivent simplement **throw** une erreur :

```tsx
'use server';

export async function deleteSite(id: number) {
  const session = await requireSession();

  // ❌ Permission insuffisante
  if (session.role === 'UTILISATEUR') {
    throw new Error('Permission insuffisante');
  }

  // ❌ Ressource non trouvée
  const site = await prisma.site.findUnique({ where: { id } });
  if (!site) {
    throw new Error('Site non trouvé');
  }

  // ❌ Validation échouée
  if (site.machines.length > 0) {
    throw new Error('Impossible de supprimer un site avec des machines');
  }

  await prisma.site.delete({ where: { id } });
  revalidatePath('/sites');
  redirect('/sites');
}
```

### Avec Zod

```tsx
import { z } from 'zod';

const siteSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
});

export async function createSite(formData: FormData) {
  const rawData = Object.fromEntries(formData);

  // ❌ Erreur de validation Zod
  const validated = siteSchema.parse(rawData); // Lance ZodError

  await prisma.site.create({ data: validated });
}
```

---

## Apparence de la Modal

La modal d'erreur affiche :
- **Icône** : AlertCircle (rouge destructive)
- **Titre** : "Erreur"
- **Message** : Le texte de l'erreur
- **Bouton** : "Fermer"

```
┌─────────────────────────────────┐
│  🔴 Erreur                      │
│                                 │
│  Permission insuffisante        │
│                                 │
│              [Fermer]           │
└─────────────────────────────────┘
```

---

## Bonnes Pratiques

### ✅ DO

```tsx
// Messages clairs et explicites
throw new Error('Le dossier "Marketing" est déjà utilisé');

// Vérifier les permissions
if (session.role === 'UTILISATEUR') {
  throw new Error('Seuls les gestionnaires peuvent supprimer');
}

// Valider les données
if (!name.trim()) {
  throw new Error('Le nom ne peut pas être vide');
}
```

### ❌ DON'T

```tsx
// Message générique
throw new Error('Error'); // ❌ Trop vague

// Utiliser console.error
catch (error) {
  console.error(error); // ❌ L'utilisateur ne voit rien
}

// Ignorer les erreurs
catch (error) {
  // ❌ Erreur silencieuse
}
```

---

## Messages d'Erreur Recommandés

| Contexte | Message Exemple |
|----------|-----------------|
| **Permission** | `Permission insuffisante` |
| **Ressource introuvable** | `Site non trouvé` |
| **Contrainte métier** | `Impossible de supprimer un dossier contenant des sites` |
| **Validation** | `Le nom doit contenir au moins 3 caractères` |
| **Conflit** | `Un site avec ce nom existe déjà` |
| **Erreur générique** | `Une erreur est survenue` |

---

## Différence avec les Toasts

| Type | Usage | Durée | Bloquant |
|------|-------|-------|----------|
| **ErrorModal** | Erreurs server actions | Jusqu'à fermeture | ✅ Oui |
| **Toast** | Succès, infos | 3-5 secondes | ❌ Non |

**Exemple combiné :**

```tsx
try {
  await deleteSite(siteId);
  toast.success('Site supprimé avec succès'); // ✅ Toast
} catch (error) {
  showError(error.message); // ❌ Modal bloquante
}
```

---

## API Complète

### `ErrorProvider`

Enveloppe l'application (déjà fait dans `layout.tsx`).

### `useError()`

```tsx
const { showError } = useError();

showError(message: string): void
```

### `useServerAction()` (optionnel)

Hook utilitaire pour envelopper automatiquement les server actions :

```tsx
import { useServerAction } from '@/lib/hooks/use-server-action';

const handleDelete = useServerAction(async () => {
  await deleteSite(siteId);
});

<button onClick={handleDelete}>Supprimer</button>
```

**Note :** Peu utilisé en pratique car `DeleteConfirmation` gère déjà le pattern.

---

## Résumé

1. **Server actions** : `throw new Error('Message clair')`
2. **Client components** : `const { showError } = useError()`
3. **DeleteConfirmation** : Gère automatiquement les erreurs
4. **Messages** : Courts, explicites, en français
5. **Succès** : Utiliser `toast.success()` (Sonner)
