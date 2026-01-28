import { notFound } from 'next/navigation';
import { getSoftwareById, getSoftwareUsage } from '@/lib/actions/softwares';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DynamicIcon, DEFAULT_ICON_NAME } from '@/components/shared/dynamic-icon';
import { MetadataDisplay } from '@/components/shared/metadata-display';
import { MachineTypeBadge } from '@/components/machines/machine-type-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import Link from 'next/link';

export default async function SoftwareUsagePage({
  params,
}: {
  params: Promise<{ softwareId: string }>;
}) {
  const { softwareId: softwareIdParam } = await params;
  const softwareId = parseInt(softwareIdParam);

  const [software, installations] = await Promise.all([
    getSoftwareById(softwareId),
    getSoftwareUsage(softwareId),
  ]);

  if (!software) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/logiciels"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="mr-1" />
        Retour aux logiciels
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <DynamicIcon iconName={software.iconName || DEFAULT_ICON_NAME} className="size-8 text-primary" />
          <h1 className="text-3xl font-bold">{software.name}</h1>
        </div>
        {software.description && (
          <p className="text-muted-foreground mt-2">{software.description}</p>
        )}
      </div>

      {/* Métadonnées */}
      {software.metadata && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Métadonnées</CardTitle>
          </CardHeader>
          <CardContent>
            <MetadataDisplay metadata={software.metadata as any} />
          </CardContent>
        </Card>
      )}

      {/* Tableau d'utilisation */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisation dans le parc</CardTitle>
          <p className="text-sm text-muted-foreground">
            {installations.length} installation{installations.length !== 1 ? 's' : ''} active{installations.length !== 1 ? 's' : ''}
          </p>
        </CardHeader>
        <CardContent>
          {installations.length === 0 ? (
            <EmptyState
              title="Aucune installation active"
              description="Ce logiciel n'est pas installé sur aucune machine en cours d'utilisation."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Site</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Machine</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Version</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Installé le</th>
                  </tr>
                </thead>
                <tbody>
                  {installations.map((installation) => (
                    <tr key={installation.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4">{installation.machine.site.name}</td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/sites/${installation.machine.siteId}/machines/${installation.machine.id}`}
                          className="hover:underline text-primary"
                        >
                          {installation.machine.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <MachineTypeBadge type={installation.machine.type} />
                      </td>
                      <td className="py-3 px-4 font-mono">{installation.version}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(installation.installedAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
