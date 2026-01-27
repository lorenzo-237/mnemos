'use client';

import { useState, useEffect, ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MachineQuickView } from '@/components/machines/machine-quick-view';
import { MachineTypeBadge } from '@/components/machines/machine-type-badge';
import { getMachinesBySiteId } from '@/lib/actions/machines';
import { HugeiconsIcon } from '@hugeicons/react';
import { ComputerIcon } from '@hugeicons/core-free-icons';

interface SiteMachinesDialogProps {
  siteId: number;
  siteName: string;
  trigger: ReactNode;
}

type MachineWithDetails = Awaited<ReturnType<typeof getMachinesBySiteId>>[0] & {
  installations: Array<{
    id: number;
    version: string;
    software: {
      name: string;
    };
  }>;
};

export function SiteMachinesDialog({ siteId, siteName, trigger }: SiteMachinesDialogProps) {
  const [open, setOpen] = useState(false);
  const [machines, setMachines] = useState<MachineWithDetails[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getMachinesBySiteId(siteId).then((data) => {
        // Cast pour ajouter les installations (elles seront chargées dans la quick view)
        setMachines(data as MachineWithDetails[]);
        setLoading(false);
      });
    }
  }, [open, siteId]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">
            Machines de {siteName}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : machines.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <HugeiconsIcon icon={ComputerIcon} strokeWidth={2} className="size-12 mx-auto mb-3 opacity-50" />
              <p>Aucune machine dans ce site</p>
            </div>
          ) : (
            <div className="space-y-3">
              {machines.map((machine) => (
                <MachineQuickView
                  key={machine.id}
                  machine={{
                    ...machine,
                    installations: [] // Sera chargé dans la quick view si nécessaire
                  }}
                  trigger={
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                      <CardHeader className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-lg">{machine.name}</CardTitle>
                              <MachineTypeBadge type={machine.type} />
                            </div>
                            <CardDescription className="mt-1">
                              {machine._count.installations} logiciel{machine._count.installations > 1 ? 's' : ''} installé{machine._count.installations > 1 ? 's' : ''}
                              {machine.teamviewerId && (
                                <span className="ml-3">
                                  • TeamViewer: {machine.teamviewerId}
                                </span>
                              )}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="ml-4">
                            Voir détails
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
