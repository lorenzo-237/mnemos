import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { MachineTypeBadge } from './machine-type-badge';
import type { Machine } from '@/generated/prisma/client';

type MachineWithCount = Machine & {
  _count: { installations: number };
};

export function MachineCard({
  machine,
  siteId
}: {
  machine: MachineWithCount;
  siteId: number;
}) {
  return (
    <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{machine.name}</CardTitle>
          <MachineTypeBadge type={machine.type} />
        </div>
        <CardDescription>
          {machine._count.installations} logiciel{machine._count.installations > 1 ? 's' : ''} installé{machine._count.installations > 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>

      {machine.teamviewerId && (
        <CardContent>
          <div className="text-xs text-muted-foreground">
            TeamViewer ID: <span className="font-mono">{machine.teamviewerId}</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
