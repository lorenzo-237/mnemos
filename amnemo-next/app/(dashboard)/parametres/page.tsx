import { requireSession } from '@/lib/auth/session';
import { SettingsTabs } from '@/components/parametres/settings-tabs';

export default async function ParametresPage() {
  const session = await requireSession();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground mt-1">
          Gérez vos préférences et paramètres de l'application
        </p>
      </div>

      <SettingsTabs userRole={session.role} />
    </div>
  );
}
