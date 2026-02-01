import Link from 'next/link';
import { getAllOrganizations } from '@/lib/actions/admin/organizations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function OrganizationsPage() {
  const organizations = await getAllOrganizations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organisations</h1>
          <p className="text-muted-foreground mt-2">
            Gérer les organisations du système
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/organizations/new">Nouvelle organisation</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((org) => (
          <Link key={org.id} href={`/admin/organizations/${org.id}`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle>{org.name}</CardTitle>
                <CardDescription>ID: {org.id}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    {org._count.users} utilisateur(s)
                  </p>
                  <p className="text-muted-foreground">
                    {org._count.sites} site(s)
                  </p>
                  <p className="text-muted-foreground">
                    {org._count.softwares} logiciel(s)
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {organizations.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucune organisation
          </CardContent>
        </Card>
      )}
    </div>
  );
}
