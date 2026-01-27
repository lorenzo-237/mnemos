import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getMachineById } from '@/lib/actions/machines';
import { getInstallationHistory } from '@/lib/actions/installations';
import { InstallationTimeline } from '@/components/installations/installation-timeline';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';

export default async function HistoriquePage({
  params
}: {
  params: Promise<{ siteId: string; machineId: string }>;
}) {
  const { siteId: siteIdParam, machineId: machineIdParam } = await params;
  const machineId = parseInt(machineIdParam);
  const siteId = parseInt(siteIdParam);

  const [machine, installations] = await Promise.all([
    getMachineById(machineId),
    getInstallationHistory(machineId)
  ]);

  if (!machine) {
    notFound();
  }

  return (
    <div>
      <Link
        href={`/sites/${siteId}/machines/${machineId}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="mr-1" />
        Retour à la machine
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Historique des installations</h1>
        <p className="text-muted-foreground mt-1">
          Machine: <Link href={`/sites/${siteId}/machines/${machineId}`} className="hover:underline">{machine.name}</Link>
          {' '} · Site: <Link href={`/sites/${siteId}`} className="hover:underline">{machine.site.name}</Link>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline complète</CardTitle>
        </CardHeader>
        <CardContent>
          <InstallationTimeline installations={installations} />
        </CardContent>
      </Card>
    </div>
  );
}
