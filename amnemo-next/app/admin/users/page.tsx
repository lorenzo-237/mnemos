import Link from 'next/link';
import { getAllUsers } from '@/lib/actions/admin/users';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function UsersPage() {
  const users = await getAllUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Utilisateurs</h1>
          <p className="text-muted-foreground mt-2">
            Gérer les utilisateurs du système
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">Nouvel utilisateur</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {users.map((user) => (
          <Link key={user.id} href={`/admin/users/${user.id}`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{user.username}</CardTitle>
                    <CardDescription>ID: {user.id}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {user.organizations.map((org) => (
                      <Badge key={org.organizationId} variant="secondary">
                        {org.organization.name} ({org.role})
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {user.organizations.length} organisation(s)
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {users.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun utilisateur
          </CardContent>
        </Card>
      )}
    </div>
  );
}
