import { notFound } from "next/navigation";
import { getUpdateSessionById } from "@/lib/actions/update-sessions";
import { TrackSessionView } from "@/components/updates/track-session-view";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

export default async function TrackSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId: sessionIdParam } = await params;
  const sessionId = parseInt(sessionIdParam);

  const session = await getUpdateSessionById(sessionId);

  if (!session) {
    notFound();
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

      <TrackSessionView session={session} />
    </div>
  );
}
