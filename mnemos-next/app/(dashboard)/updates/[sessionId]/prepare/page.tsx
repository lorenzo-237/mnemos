import { notFound } from "next/navigation";
import { getUpdateSessionById } from "@/lib/actions/update-sessions";
import { getTasks } from "@/lib/actions/tasks";
import { getSoftwares } from "@/lib/actions/softwares";
import { PrepareSessionView } from "@/components/updates/prepare-session-view";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

export default async function PrepareSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId: sessionIdParam } = await params;
  const sessionId = parseInt(sessionIdParam);

  const [session, tasks, softwares] = await Promise.all([
    getUpdateSessionById(sessionId),
    getTasks(),
    getSoftwares(),
  ]);

  if (!session) {
    notFound();
  }

  // Extraire les machines disponibles selon le dossier ou tag
  let availableMachines: any[] = [];
  const siteTagIds = new Set<number>();

  if (session.folder) {
    session.folder.sites.forEach((site) => {
      site.tags.forEach((t) => siteTagIds.add(t.tag.id));
    });
    availableMachines = session.folder.sites.flatMap((site) =>
      site.machines.map((machine) => ({
        ...machine,
        site: {
          id: site.id,
          name: site.name,
        },
      })),
    );
  } else if (session.tag) {
    session.tag.sites.forEach((siteTag) => {
      siteTag.site.tags.forEach((t) => siteTagIds.add(t.tag.id));
    });
    availableMachines = session.tag.sites.flatMap((siteTag) =>
      siteTag.site.machines.map((machine) => ({
        ...machine,
        site: {
          id: siteTag.site.id,
          name: siteTag.site.name,
        },
      })),
    );
  }

  // Filtrer les tâches selon les tags des sites
  const filteredTasks = tasks.filter((task) => {
    if (task.tags.length === 0) return true;
    return task.tags.some((tt) => siteTagIds.has(tt.tag.id));
  });

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
        <h1 className="text-3xl font-bold">{session.name}</h1>
        <p className="text-muted-foreground mt-1">
          Préparez votre session en assignant des tâches aux machines
        </p>
      </div>

      <PrepareSessionView
        session={session}
        availableMachines={availableMachines}
        tasks={filteredTasks}
        softwares={softwares}
      />
    </div>
  );
}
