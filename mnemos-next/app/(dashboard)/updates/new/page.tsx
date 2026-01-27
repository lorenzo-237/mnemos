import { getFolders } from "@/lib/actions/folders";
import { getTags } from "@/lib/actions/tags";
import { UpdateSessionForm } from "@/components/updates/update-session-form";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

export default async function NewUpdateSessionPage() {
  const [folders, tags] = await Promise.all([
    getFolders(),
    getTags(),
  ]);

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

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Nouvelle session de mise à jour</h1>
        <p className="text-muted-foreground mt-1">
          Créez une nouvelle session pour organiser vos tâches de maintenance
        </p>
      </div>

      <UpdateSessionForm folders={folders} tags={tags} />
    </div>
  );
}
