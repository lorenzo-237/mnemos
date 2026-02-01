import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getMachineById, deleteMachine } from '@/lib/actions/machines';
import { removeInstallation } from '@/lib/actions/installations';
import { requireSession } from '@/lib/auth/session';
import { MachineFormDialog } from '@/components/machines/machine-form-dialog';
import { MachineTypeBadge } from '@/components/machines/machine-type-badge';
import { TeamViewerSection } from '@/components/machines/teamviewer-section';
import { AddInstallationDialog } from '@/components/installations/add-installation-dialog';
import { UpdateSoftwareDialog } from '@/components/installations/update-software-dialog';
import { DeleteConfirmation } from '@/components/shared/delete-confirmation';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon, Edit02Icon, Delete02Icon, ArrowLeft01Icon, TimeQuarterPassIcon } from '@hugeicons/core-free-icons';

export default async function MachineDetailPage({
  params
}: {
  params: Promise<{ siteId: string; machineId: string }>;
}) {
  const { siteId: siteIdParam, machineId: machineIdParam } = await params;
  const machineId = parseInt(machineIdParam);
  const siteId = parseInt(siteIdParam);
  const [machine, session] = await Promise.all([
    getMachineById(machineId),
    requireSession(),
  ]);

  if (!machine) {
    notFound();
  }

  const canDelete = session.role !== 'UTILISATEUR';

  return (
    <div>
      <Link
        href={`/sites/${siteId}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="mr-1" />
        Retour au site
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{machine.name}</h1>
            <MachineTypeBadge type={machine.type} />
          </div>
          <p className="text-muted-foreground">
            Site: <Link href={`/sites/${siteId}`} className="hover:underline">{machine.site.name}</Link>
          </p>
        </div>

        <div className="flex gap-2">
          <MachineFormDialog
            siteId={siteId}
            machine={machine}
            trigger={
              <Button variant="outline">
                <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} data-icon="inline-start" />
                Modifier
              </Button>
            }
          />

          {canDelete && (
            <DeleteConfirmation
              title="Supprimer cette machine ?"
              description="Cette action supprimera la machine et tout son historique d'installations. Cette action est irréversible."
              onConfirm={async () => {
                'use server';
                await deleteMachine(machineId);
              }}
              trigger={
                <Button variant="outline">
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} data-icon="inline-start" />
                  Supprimer
                </Button>
              }
            />
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Section TeamViewer */}
        <TeamViewerSection
          teamviewerId={machine.teamviewerId}
          teamviewerPwd={machine.teamviewerPwdDecrypted}
        />

        {/* Section Logiciels installés */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Logiciels installés</CardTitle>
              <AddInstallationDialog
                machineId={machineId}
                trigger={
                  <Button>
                    <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
                    Ajouter un logiciel
                  </Button>
                }
              />
            </div>
          </CardHeader>
        </Card>

        {machine.installations.length === 0 ? (
          <EmptyState
            title="Aucun logiciel installé"
            description="Commencez par ajouter les logiciels installés sur cette machine."
            action={
              <AddInstallationDialog
                machineId={machineId}
                trigger={
                  <Button>
                    <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
                    Ajouter un logiciel
                  </Button>
                }
              />
            }
          />
        ) : (
          <div className="space-y-2">
            {machine.installations.map((installation) => (
              <div key={installation.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{installation.software.name}</p>
                      <Badge variant="secondary">v{installation.version}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Installé le {new Date(installation.installedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <UpdateSoftwareDialog
                      machineId={machineId}
                      installationId={installation.id}
                      softwareId={installation.softwareId}
                      softwareName={installation.software.name}
                      currentVersion={installation.version}
                      trigger={
                        <Button variant="outline" size="sm">
                          Mettre à jour
                        </Button>
                      }
                    />
                    {canDelete && (
                      <DeleteConfirmation
                        title="Retirer ce logiciel ?"
                        description="Cette action marquera le logiciel comme retiré dans l'historique."
                        onConfirm={async () => {
                          'use server';
                          await removeInstallation(installation.id, machineId);
                        }}
                        trigger={
                          <Button variant="outline" size="sm">
                            Retirer
                          </Button>
                        }
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lien vers l'historique */}
        <Link href={`/sites/${siteId}/machines/${machineId}/historique`}>
          <Button variant="outline" className="w-full">
            <HugeiconsIcon icon={TimeQuarterPassIcon} strokeWidth={2} data-icon="inline-start" />
            Voir l'historique complet
          </Button>
        </Link>
      </div>
    </div>
  );
}
