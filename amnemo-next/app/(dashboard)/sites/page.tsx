import { getSites } from "@/lib/actions/sites";
import { getFolders } from "@/lib/actions/folders";
import { getTags } from "@/lib/actions/tags";
import { SiteCard } from "@/components/sites/site-card";
import { SiteFormDialog } from "@/components/sites/site-form-dialog";
import { FolderFormDialog } from "@/components/folders/folder-form-dialog";
import { TagFormDialog } from "@/components/tags/tag-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { SitesFilter } from "@/components/sites/sites-filter";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";

export default async function SitesPage({
  searchParams,
}: {
  searchParams: Promise<{ folderIds?: string | string[]; tagIds?: string | string[]; name?: string }>;
}) {
  const params = await searchParams;

  // Handle multiple folder IDs
  const folderIds = params.folderIds
    ? (Array.isArray(params.folderIds)
        ? params.folderIds.map(id => parseInt(id))
        : [parseInt(params.folderIds)])
    : [];

  // Handle multiple tag IDs
  const tagIds = params.tagIds
    ? (Array.isArray(params.tagIds)
        ? params.tagIds.map(id => parseInt(id))
        : [parseInt(params.tagIds)])
    : [];

  const searchName = params.name || '';

  const [sites, folders, tags] = await Promise.all([
    getSites(folderIds, tagIds, searchName),
    getFolders(),
    getTags(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Sites</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos sites informatiques
          </p>
        </div>

        <div className="flex gap-2">
          <FolderFormDialog
            trigger={
              <Button variant="outline" size="sm">
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                Dossier
              </Button>
            }
          />
          <TagFormDialog
            trigger={
              <Button variant="outline" size="sm">
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                Tag
              </Button>
            }
          />
          <SiteFormDialog
            trigger={
              <Button>
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                Nouveau site
              </Button>
            }
          />
        </div>
      </div>

      <SitesFilter
        folders={folders}
        tags={tags}
        selectedFolderIds={folderIds}
        selectedTagIds={tagIds}
        searchName={searchName}
      />

      {sites.length === 0 ? (
        <EmptyState
          title="Aucun site"
          description={
            folderIds.length > 0 || tagIds.length > 0
              ? "Aucun site ne correspond aux filtres sélectionnés."
              : "Commencez par créer votre premier site pour organiser vos machines."
          }
          action={
            folderIds.length === 0 && tagIds.length === 0 ? (
              <SiteFormDialog
                trigger={
                  <Button>
                    <HugeiconsIcon
                      icon={PlusSignIcon}
                      strokeWidth={2}
                      data-icon="inline-start"
                    />
                    Créer un site
                  </Button>
                }
              />
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  );
}
