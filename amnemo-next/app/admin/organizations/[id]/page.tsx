import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
} from '@/lib/actions/admin/organizations';
import { OrganizationForm } from '@/components/admin/organization-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organization = await getOrganizationById(Number(id));

  if (!organization) {
    notFound();
  }

  const handleUpdate = async (formData: FormData) => {
    'use server';
    await updateOrganization(organization.id, formData);
  };

  const handleDelete = async () => {
    'use server';
    await deleteOrganization(organization.id);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/organizations">← Retour</Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{organization.name}</h1>
          <p className="text-muted-foreground mt-2">
            Gestion de l'organisation
          </p>
        </div>
        <form action={handleDelete}>
          <Button type="submit" variant="destructive" size="sm">
            Supprimer
          </Button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
            <CardDescription>
              Modifier les informations de l'organisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrganizationForm
              action={handleUpdate}
              defaultValues={{ name: organization.name }}
              isEdit
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
            <CardDescription>
              Données de l'organisation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Utilisateurs</p>
              <p className="text-2xl font-bold">{organization.users.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Sites</p>
              <p className="text-2xl font-bold">{organization._count.sites}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Logiciels</p>
              <p className="text-2xl font-bold">{organization._count.softwares}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Tâches</p>
              <p className="text-2xl font-bold">{organization._count.tasks}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs</CardTitle>
          <CardDescription>
            Membres de cette organisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {organization.users.map((userOrg) => (
              <div key={userOrg.userId} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <p className="font-medium">{userOrg.user.username}</p>
                  <p className="text-sm text-muted-foreground">Rôle: {userOrg.role}</p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/users/${userOrg.userId}`}>Voir</Link>
                </Button>
              </div>
            ))}
            {organization.users.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                Aucun utilisateur
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
