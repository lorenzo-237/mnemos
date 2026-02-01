import Link from 'next/link';
import { createOrganization } from '@/lib/actions/admin/organizations';
import { OrganizationForm } from '@/components/admin/organization-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewOrganizationPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/organizations">← Retour</Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nouvelle organisation</h1>
          <p className="text-muted-foreground mt-2">
            Créer une nouvelle organisation
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
          <CardDescription>
            Renseignez les informations de la nouvelle organisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationForm action={createOrganization} />
        </CardContent>
      </Card>
    </div>
  );
}
