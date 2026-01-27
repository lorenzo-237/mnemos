import { notFound } from "next/navigation";
import { getUpdateSessionById } from "@/lib/actions/update-sessions";
import { getTasks } from "@/lib/actions/tasks";
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

  const [session, tasks] = await Promise.all([
    getUpdateSessionById(sessionId),
    getTasks(),
  ]);

  if (!session) {
    notFound();
  }

  // Extraire les machines disponibles selon le dossier ou tag
  let availableMachines: any[] = [];

  if (session.folder) {
    availableMachines = session.folder.sites.flatMap(site =>
      site.machines.map(machine => ({
        ...machine,
        site: {
          id: site.id,
          name: site.name
        }
      }))
    );
  } else if (session.tag) {
    availableMachines = session.tag.sites.flatMap(siteTag =>
      siteTag.site.machines.map(machine => ({
        ...machine,
        site: {
          id: siteTag.site.id,
          name: siteTag.site.name
        }
      }))
    );
  }

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
        tasks={tasks}
      />
    </div>
  );
}
