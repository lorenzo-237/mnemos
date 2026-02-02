import { AppSidebar } from '@/components/layout/app-sidebar';
import { requireSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import packageJson from '@/package.json';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { username: true },
  });

  const userOrganizations = await prisma.userOrganization.findMany({
    where: { userId: session.userId },
    include: { organization: true },
  });

  const organizations = userOrganizations.map(uo => ({
    id: uo.organization.id,
    name: uo.organization.name,
  }));

  return (
    <div className="flex min-h-screen">
      <AppSidebar
        organizations={organizations}
        currentOrgId={session.organizationId}
        userRole={session.role}
        username={user?.username || 'Utilisateur'}
        version={packageJson.version}
      />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-8 px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
