import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function AdminDashboard() {
  const [organizationsCount, usersCount, sitesCount] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.site.count(),
  ]);

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      organizations: {
        include: {
          organization: true
        }
      }
    }
  });

  const stats = [
    {
      title: 'Organisations',
      value: organizationsCount,
      href: '/admin/organizations',
      description: 'Organisations actives',
    },
    {
      title: 'Utilisateurs',
      value: usersCount,
      href: '/admin/users',
      description: 'Comptes utilisateurs',
    },
    {
      title: 'Sites',
      value: sitesCount,
      href: '/sites',
      description: 'Sites gérés',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Administration</h1>
        <p className="text-muted-foreground mt-2">
          Vue d'ensemble du système
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-2xl">{stat.value}</CardTitle>
                <CardDescription>{stat.title}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Utilisateurs récents</CardTitle>
              <CardDescription>Derniers comptes créés</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/users">Voir tous</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-muted-foreground">
                    {user.organizations.length} organisation(s)
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/users/${user.id}`}>Voir</Link>
                </Button>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun utilisateur
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
