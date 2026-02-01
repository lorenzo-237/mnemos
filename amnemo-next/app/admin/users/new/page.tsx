import Link from 'next/link';
import { createUser } from '@/lib/actions/admin/users';
import { UserForm } from '@/components/admin/user-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewUserPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/users">← Retour</Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nouvel utilisateur</h1>
          <p className="text-muted-foreground mt-2">
            Créer un nouveau compte utilisateur
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
          <CardDescription>
            Renseignez les informations du nouvel utilisateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm action={createUser} />
          <p className="text-sm text-muted-foreground mt-4">
            Note: Après création, vous devrez assigner l'utilisateur à une organisation depuis la page de détails.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
