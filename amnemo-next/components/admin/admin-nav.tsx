"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardCircleIcon,
  Building02Icon,
  UserMultiple02Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";

const navigation = [
  { name: "Vue d'ensemble", href: "/admin", icon: DashboardCircleIcon },
  { name: "Organisations", href: "/admin/organizations", icon: Building02Icon },
  { name: "Utilisateurs", href: "/admin/users", icon: UserMultiple02Icon },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold">Administration</h1>
        <p className="text-xs text-muted-foreground mt-1">Gestion système</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <HugeiconsIcon
                icon={item.icon}
                strokeWidth={2}
                className="size-5"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            strokeWidth={2}
            className="size-5"
          />
          Retour à l'application
        </Link>
      </div>

      <div className="p-4 border-t text-xs text-muted-foreground">
        Panel Administration
      </div>
    </aside>
  );
}
