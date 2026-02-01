import { redirect } from 'next/navigation';
import { checkSetupConsistency } from '@/lib/settings';
import { SetupWizard } from '@/components/setup/setup-wizard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function SetupPage() {
  const { isConsistent, setupCompleted, userCount } = await checkSetupConsistency();

  // Si setup déjà complété, rediriger vers login
  if (setupCompleted) {
    redirect('/login');
  }

  // OPTION C: Si flag=false MAIS users existent → incohérence
  if (!isConsistent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Erreur de Configuration</CardTitle>
            <CardDescription>
              Incohérence détectée dans le système
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-2">
              <p>
                Le système détecte que le setup n'est pas complété, mais {userCount} utilisateur(s)
                {userCount > 1 ? ' existent' : ' existe'} déjà en base de données.
              </p>
              <p className="font-medium text-destructive">
                Contactez l'administrateur système pour résoudre cette incohérence.
              </p>
            </div>

            <div className="bg-muted p-3 rounded-md text-xs space-y-1">
              <p className="font-medium">Actions possibles pour l'administrateur:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Mettre `setup_completed = true` dans la table settings</li>
                <li>Ou réinitialiser complètement la base de données</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Setup pas encore fait et cohérent → afficher le wizard
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Bienvenue sur Amnemo</h1>
          <p className="text-muted-foreground">
            Configuration initiale de votre système de gestion IT
          </p>
        </div>

        <SetupWizard />
      </div>
    </div>
  );
}
