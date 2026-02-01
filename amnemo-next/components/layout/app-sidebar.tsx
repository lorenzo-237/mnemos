'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  BuildingIcon,
  ComputerIcon,
  SettingsIcon,
  TaskIcon,
  RefreshIcon,
  RemoteControlIcon,
  UserSettings02Icon,
} from '@hugeicons/core-free-icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { OrgSwitcher } from '@/components/layout/org-switcher';
import { LogoutButton } from '@/components/layout/logout-button';

const navigation = [
  { name: 'Sites', href: '/sites', icon: BuildingIcon },
  { name: 'Prise en main', href: '/remote-access', icon: RemoteControlIcon },
  { name: 'Tâches', href: '/tasks', icon: TaskIcon },
  { name: 'Mises à jour', href: '/updates', icon: RefreshIcon },
  { name: 'Logiciels', href: '/logiciels', icon: ComputerIcon },
  { name: 'Paramètres', href: '/parametres', icon: SettingsIcon },
];

interface AppSidebarProps {
  organizations: Array<{ id: number; name: string }>;
  currentOrgId: number;
  userRole: 'UTILISATEUR' | 'GESTIONNAIRE' | 'ADMIN';
  username: string;
}

export function AppSidebar({ organizations, currentOrgId, userRole, username }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold">Amnemo</h1>
        <p className="text-xs text-muted-foreground mt-1">Gestion de parc</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <HugeiconsIcon icon={item.icon} strokeWidth={2} className="size-5" />
              {item.name}
            </Link>
          );
        })}

        {userRole === 'ADMIN' && (
          <>
            <div className="my-2 border-t" />
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname.startsWith('/admin')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <HugeiconsIcon icon={UserSettings02Icon} strokeWidth={2} className="size-5" />
              Administration
            </Link>
          </>
        )}
      </nav>

      <div className="mt-auto">
        <OrgSwitcher organizations={organizations} currentOrgId={currentOrgId} />

        <div className="p-3 border-t space-y-2">
          <ThemeToggle />
          <LogoutButton />
        </div>

        <div className="p-3 border-t">
          <p className="text-sm font-medium truncate">{username}</p>
          <p className="text-xs text-muted-foreground">
            {userRole === 'ADMIN' ? 'Administrateur' : userRole === 'GESTIONNAIRE' ? 'Gestionnaire' : 'Utilisateur'}
          </p>
        </div>

        <div className="p-4 border-t text-xs text-muted-foreground">
          v0.1.0 MVP - Phase 6
        </div>
      </div>
    </aside>
  );
}
