import { requireSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { AdminNav } from '@/components/admin/admin-nav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  // Vérifier que l'utilisateur est ADMIN
  if (session.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-8 px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
