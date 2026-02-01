"use client";

import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Organization {
  id: number;
  name: string;
}

interface OrgSwitcherProps {
  organizations: Organization[];
  currentOrgId: number;
}

export function OrgSwitcher({ organizations, currentOrgId }: OrgSwitcherProps) {
  const router = useRouter();

  const handleSwitchOrg = async (orgId: string) => {
    try {
      const response = await fetch("/api/auth/switch-org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Erreur lors du changement d'organisation", error);
    }
  };

  if (organizations.length <= 1) {
    return null;
  }

  return (
    <div className="px-4 py-2">
      <Select value={currentOrgId.toString()} onValueChange={handleSwitchOrg}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Organisation" />
        </SelectTrigger>
        <SelectContent>
          {organizations.map((org) => (
            <SelectItem key={org.id} value={org.id.toString()}>
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
