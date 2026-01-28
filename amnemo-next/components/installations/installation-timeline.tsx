import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle01Icon, CancelCircleIcon } from '@hugeicons/core-free-icons';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Installation, Software } from '@/generated/prisma/client';

type InstallationWithSoftware = Installation & {
  software: Software;
};

export function InstallationTimeline({
  installations
}: {
  installations: InstallationWithSoftware[];
}) {
  if (installations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun historique d'installation
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {installations.map((installation, index) => (
        <div key={installation.id} className="flex gap-4">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div className={cn(
              "rounded-full p-1",
              installation.removedAt
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary"
            )}>
              <HugeiconsIcon
                icon={installation.removedAt ? CancelCircleIcon : CheckmarkCircle01Icon}
                strokeWidth={2}
                className="size-4"
              />
            </div>
            {index < installations.length - 1 && (
              <div className="w-0.5 h-full min-h-[40px] bg-border mt-2" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-4">
            <div className="flex items-baseline gap-2">
              <h4 className="font-medium text-sm">{installation.software.name}</h4>
              <Badge variant="secondary" className="text-xs">
                v{installation.version}
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground mt-1">
              {installation.removedAt ? (
                <>
                  Installé le {format(installation.installedAt, 'PPP', { locale: fr })}
                  <br />
                  Retiré le {format(installation.removedAt, 'PPP', { locale: fr })}
                </>
              ) : (
                <>Installé le {format(installation.installedAt, 'PPP', { locale: fr })}</>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
