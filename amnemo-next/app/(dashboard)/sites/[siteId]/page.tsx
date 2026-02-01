import { notFound } from "next/navigation";
import { getSiteById, deleteSite } from "@/lib/actions/sites";
import { requireSession } from "@/lib/auth/session";
import { SiteFormDialog } from "@/components/sites/site-form-dialog";
import { MachineFormDialog } from "@/components/machines/machine-form-dialog";
import { MachineCard } from "@/components/machines/machine-card";
import { MachineQuickView } from "@/components/machines/machine-quick-view";
import { DeleteConfirmation } from "@/components/shared/delete-confirmation";
import { EmptyState } from "@/components/shared/empty-state";
import { MetadataDisplay } from "@/components/shared/metadata-display";
import { DynamicIcon } from "@/components/shared/dynamic-icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignIcon,
  Edit02Icon,
  Delete02Icon,
  ArrowLeft01Icon,
  FolderIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

export default async function SiteDetailPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId: siteIdParam } = await params;
  const siteId = parseInt(siteIdParam);
  const [site, session] = await Promise.all([
    getSiteById(siteId),
    requireSession(),
  ]);

  if (!site) {
    notFound();
  }

  const canDelete = session.role !== 'UTILISATEUR';

  return (
    <div>
      <Link
        href={`/sites`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <HugeiconsIcon
          icon={ArrowLeft01Icon}
          strokeWidth={2}
          className="mr-1"
        />
        Retour
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {site.iconName && (
              <DynamicIcon iconName={site.iconName} className="w-8 h-8" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{site.name}</h1>
                {site.isObsolete && (
                  <Badge variant="destructive">Obsolète</Badge>
                )}
              </div>
              {site.description && (
                <p className="text-muted-foreground mt-1">{site.description}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>
              {site.machines.length} machine
              {site.machines.length > 1 ? "s" : ""}
            </span>
            {site.folder && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <HugeiconsIcon
                    icon={FolderIcon}
                    strokeWidth={2}
                    className="w-4 h-4"
                  />
                  <span>{site.folder.name}</span>
                </div>
              </>
            )}
            {site.tags && site.tags.length > 0 && (
              <>
                <span>•</span>
                <div className="flex flex-wrap gap-1">
                  {site.tags.map((siteTag) => (
                    <Badge
                      key={siteTag.tag.id}
                      variant="secondary"
                      className="text-xs"
                    >
                      {siteTag.tag.name}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>

          {site.isObsolete && site.obsoleteReason && (
            <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">
                <span className="font-medium">Raison de l'obsolescence:</span>{" "}
                {site.obsoleteReason}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <SiteFormDialog
            site={site}
            trigger={
              <Button variant="outline">
                <HugeiconsIcon
                  icon={Edit02Icon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                Modifier
              </Button>
            }
          />

          {canDelete && (
            <DeleteConfirmation
              title="Supprimer ce site ?"
              description="Cette action supprimera le site et toutes ses machines. Cette action est irréversible."
              onConfirm={async () => {
                "use server";
                await deleteSite(siteId);
              }}
              trigger={
                <Button variant="outline">
                  <HugeiconsIcon
                    icon={Delete02Icon}
                    strokeWidth={2}
                    data-icon="inline-start"
                  />
                  Supprimer
                </Button>
              }
            />
          )}
        </div>
      </div>

      {site.metadata && Object.keys(site.metadata).length > 0 && (
        <div className="mb-8">
          <MetadataDisplay metadata={site.metadata} />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Machines</h2>
          <MachineFormDialog
            siteId={siteId}
            trigger={
              <Button>
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                Ajouter une machine
              </Button>
            }
          />
        </div>

        {site.machines.length === 0 ? (
          <EmptyState
            title="Aucune machine"
            description="Ajoutez votre première machine à ce site."
            action={
              <MachineFormDialog
                siteId={siteId}
                trigger={
                  <Button>
                    <HugeiconsIcon
                      icon={PlusSignIcon}
                      strokeWidth={2}
                      data-icon="inline-start"
                    />
                    Ajouter une machine
                  </Button>
                }
              />
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {site.machines.map((machine) => (
              <MachineQuickView
                key={machine.id}
                machine={{
                  ...machine,
                  installations: [],
                }}
                trigger={<MachineCard machine={machine} siteId={siteId} />}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
