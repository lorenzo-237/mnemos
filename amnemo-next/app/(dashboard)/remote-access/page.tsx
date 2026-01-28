import { getSites } from "@/lib/actions/sites";
import { getFolders } from "@/lib/actions/folders";
import { getTags } from "@/lib/actions/tags";
import { RemoteAccessFilter } from "@/components/remote-access/remote-access-filter";
import { RemoteAccessTable } from "@/components/remote-access/remote-access-table";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

export default async function RemoteAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ folderIds?: string | string[]; tagIds?: string | string[] }>;
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

  const [sites, folders, tags] = await Promise.all([
    getSites(folderIds, tagIds),
    getFolders(),
    getTags(),
  ]);

  // Extraire toutes les machines de tous les sites
  const machines = sites.flatMap(site =>
    site.machines.map(machine => ({
      ...machine,
      site: {
        id: site.id,
        name: site.name,
        folder: site.folder,
      }
    }))
  );

  return (
    <div>
      <Link
        href="/updates"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <HugeiconsIcon
          icon={ArrowLeft01Icon}
          strokeWidth={2}
          className="mr-1"
        />
        Retour aux sessions
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Vue prise en main à distance</h1>
        <p className="text-muted-foreground mt-1">
          Accédez rapidement à toutes vos machines
        </p>
      </div>

      <RemoteAccessFilter
        folders={folders}
        tags={tags}
        selectedFolderIds={folderIds}
        selectedTagIds={tagIds}
      />

      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {machines.length} machine{machines.length > 1 ? 's' : ''} trouvée{machines.length > 1 ? 's' : ''}
        </div>
      </div>

      <RemoteAccessTable machines={machines} />
    </div>
  );
}
