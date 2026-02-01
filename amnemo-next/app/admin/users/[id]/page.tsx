import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUserById, updateUserPassword, deleteUser } from '@/lib/actions/admin/users';
import {
  addUserToOrganization,
  updateUserOrganizationRole,
  removeUserFromOrganization,
} from '@/lib/actions/admin/user-organizations';
import { getAllOrganizations } from '@/lib/actions/admin/organizations';
import { UserForm } from '@/components/admin/user-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserById(Number(id));

  if (!user) {
    notFound();
  }

  const allOrganizations = await getAllOrganizations();
  const availableOrganizations = allOrganizations.filter(
    org => !user.organizations.some(uo => uo.organizationId === org.id)
  );

  const handlePasswordUpdate = async (formData: FormData) => {
    'use server';
    await updateUserPassword(user.id, formData);
  };

  const handleDelete = async () => {
    'use server';
    await deleteUser(user.id);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/users">← Retour</Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{user.username}</h1>
          <p className="text-muted-foreground mt-2">
            Gestion du compte utilisateur
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
            <CardTitle>Mot de passe</CardTitle>
            <CardDescription>
              Modifier le mot de passe de l'utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserForm
              action={handlePasswordUpdate}
              defaultValues={{ username: user.username }}
              isEdit
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
            <CardDescription>
              Détails du compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Nom d'utilisateur</p>
              <p className="text-lg">{user.username}</p>
            </div>
            <div>
              <p className="text-sm font-medium">ID</p>
              <p className="text-lg">{user.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Créé le</p>
              <p className="text-lg">
                {new Date(user.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Organisations</CardTitle>
              <CardDescription>
                Organisations et rôles de l'utilisateur
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.organizations.map((userOrg) => (
            <div key={userOrg.organizationId} className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex-1">
                <p className="font-medium">{userOrg.organization.name}</p>
                <Badge variant="secondary" className="mt-1">{userOrg.role}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <form action={async (formData: FormData) => {
                  'use server';
                  await updateUserOrganizationRole(user.id, userOrg.organizationId, formData);
                }}>
                  <Select name="role" defaultValue={userOrg.role}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTILISATEUR">UTILISATEUR</SelectItem>
                      <SelectItem value="GESTIONNAIRE">GESTIONNAIRE</SelectItem>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit" size="sm" variant="outline" className="ml-2">
                    Modifier
                  </Button>
                </form>
                <form action={async () => {
                  'use server';
                  await removeUserFromOrganization(user.id, userOrg.organizationId);
                }}>
                  <Button type="submit" size="sm" variant="destructive">
                    Retirer
                  </Button>
                </form>
              </div>
            </div>
          ))}

          {user.organizations.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Aucune organisation
            </p>
          )}

          {availableOrganizations.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-3">Ajouter à une organisation</p>
              <form action={addUserToOrganization} className="flex gap-2">
                <input type="hidden" name="userId" value={user.id} />
                <Select name="organizationId" required>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sélectionner une organisation" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOrganizations.map((org) => (
                      <SelectItem key={org.id} value={org.id.toString()}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select name="role" defaultValue="UTILISATEUR" required>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTILISATEUR">UTILISATEUR</SelectItem>
                    <SelectItem value="GESTIONNAIRE">GESTIONNAIRE</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit">Ajouter</Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
