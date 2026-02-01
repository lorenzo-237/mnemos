'use client';

import { useFormStatus } from 'react-dom';
import { performInitialSetup } from '@/lib/actions/setup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? 'Configuration en cours...' : 'Démarrer Amnemo'}
    </Button>
  );
}

export function SetupWizard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration Initiale</CardTitle>
        <CardDescription>
          Créez le premier compte administrateur et l'organisation principale
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={performInitialSetup} className="space-y-6">
          {/* Organisation */}
          <div className="space-y-4">
            <div className="pb-2 border-b">
              <h3 className="font-semibold">Organisation</h3>
              <p className="text-sm text-muted-foreground">
                Informations sur votre organisation principale
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationName">
                Nom de l'organisation <span className="text-destructive">*</span>
              </Label>
              <Input
                id="organizationName"
                name="organizationName"
                type="text"
                required
                placeholder="Ma Société"
                autoComplete="organization"
              />
              <p className="text-xs text-muted-foreground">
                Exemple: "IT Services ACME", "Support Technique", etc.
              </p>
            </div>
          </div>

          {/* Compte Administrateur */}
          <div className="space-y-4">
            <div className="pb-2 border-b">
              <h3 className="font-semibold">Compte Administrateur</h3>
              <p className="text-sm text-muted-foreground">
                Créez le premier compte avec tous les privilèges
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">
                Nom d'utilisateur <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                minLength={3}
                maxLength={50}
                placeholder="admin"
                autoComplete="username"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 3 caractères
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Mot de passe <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 8 caractères - Utilisez un mot de passe fort
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="bg-muted p-4 rounded-md text-sm space-y-2">
            <p className="font-medium">Après la configuration:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Vous serez redirigé vers la page de connexion</li>
              <li>Connectez-vous avec les identifiants créés</li>
              <li>Vous aurez accès complet à l'interface d'administration</li>
            </ul>
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
