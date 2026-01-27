'use client';

import { useState } from 'react';
import { MachineTypeBadge } from '@/components/machines/machine-type-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { Copy01Icon, FolderIcon } from '@hugeicons/core-free-icons';
import Link from 'next/link';

interface Machine {
  id: number;
  name: string;
  type: 'SERVER' | 'CLIENT';
  teamviewerId: string | null;
  site: {
    id: number;
    name: string;
    folder?: {
      id: number;
      name: string;
    } | null;
  };
  _count: { installations: number };
}

interface RemoteAccessTableProps {
  machines: Machine[];
}

export function RemoteAccessTable({ machines }: RemoteAccessTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyTeamViewerId = async (teamviewerId: string) => {
    try {
      await navigator.clipboard.writeText(teamviewerId);
      setCopiedId(teamviewerId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (machines.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Aucune machine trouvée avec les filtres sélectionnés
      </div>
    );
  }

  // Grouper par site
  const machinesBySite = machines.reduce((acc, machine) => {
    const siteKey = machine.site.id.toString();
    if (!acc[siteKey]) {
      acc[siteKey] = {
        site: machine.site,
        machines: []
      };
    }
    acc[siteKey].machines.push(machine);
    return acc;
  }, {} as Record<string, { site: Machine['site']; machines: Machine[] }>);

  return (
    <div className="space-y-6">
      {Object.values(machinesBySite).map(({ site, machines: siteMachines }) => (
        <div key={site.id} className="border rounded-lg overflow-hidden">
          <div className="bg-muted px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href={`/sites/${site.id}`} className="font-semibold hover:text-primary transition-colors">
                {site.name}
              </Link>
              {site.folder && (
                <Badge variant="outline" className="text-xs">
                  <HugeiconsIcon icon={FolderIcon} strokeWidth={2} className="w-3 h-3 mr-1" />
                  {site.folder.name}
                </Badge>
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              {siteMachines.length} machine{siteMachines.length > 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="divide-y">
            {siteMachines.map((machine) => (
              <div key={machine.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <MachineTypeBadge type={machine.type} />

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/sites/${site.id}/machines/${machine.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {machine.name}
                      </Link>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {machine._count.installations} logiciel{machine._count.installations > 1 ? 's' : ''}
                      </div>
                    </div>

                    {machine.teamviewerId ? (
                      <div className="flex items-center gap-2">
                        <div className="font-mono text-sm bg-muted px-3 py-1.5 rounded border">
                          {machine.teamviewerId}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyTeamViewerId(machine.teamviewerId!)}
                        >
                          <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} data-icon="inline-start" />
                          {copiedId === machine.teamviewerId ? 'Copié !' : 'Copier'}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Pas de TeamViewer
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
