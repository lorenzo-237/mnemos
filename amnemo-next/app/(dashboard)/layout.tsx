import { AppSidebar } from '@/components/layout/app-sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-8 px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
