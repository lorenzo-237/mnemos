import { getUpdateSessions } from "@/lib/actions/update-sessions";
import { DeleteConfirmation } from "@/components/shared/delete-confirmation";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignIcon,
  Delete02Icon,
  FolderIcon,
  TagIcon,
  PlayIcon,
  CheckmarkCircleIcon
} from "@hugeicons/core-free-icons";
import { deleteUpdateSession } from "@/lib/actions/update-sessions";
import Link from "next/link";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";

export default async function UpdatesPage() {
  const sessions = await getUpdateSessions();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Sessions de mise à jour</h1>
          <p className="text-muted-foreground mt-1">
            Préparez et suivez vos mises à jour de parc
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/remote-access">
            <Button variant="outline">
              <HugeiconsIcon
                icon={PlayIcon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Vue prise en main
            </Button>
          </Link>
          <Link href="/updates/new">
            <Button>
              <HugeiconsIcon
                icon={PlusSignIcon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Nouvelle session
            </Button>
          </Link>
        </div>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          title="Aucune session"
          description="Créez votre première session de mise à jour pour organiser vos tâches de maintenance."
          action={
            <Link href="/updates/new">
              <Button>
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                Créer une session
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => {
            const isCompleted = !!session.completedAt;
            const isStarted = !!session.startedAt;

            return (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{session.name}</CardTitle>
                        {isCompleted ? (
                          <Badge variant="default">
                            <HugeiconsIcon icon={CheckmarkCircleIcon} strokeWidth={2} className="w-3 h-3 mr-1" />
                            Terminée
                          </Badge>
                        ) : isStarted ? (
                          <Badge variant="secondary">En cours</Badge>
                        ) : (
                          <Badge variant="outline">À préparer</Badge>
                        )}
                      </div>

                      {session.description && (
                        <CardDescription className="line-clamp-2 mb-2">
                          {session.description}
                        </CardDescription>
                      )}

                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {session.folder && (
                          <div className="flex items-center gap-1">
                            <HugeiconsIcon icon={FolderIcon} strokeWidth={2} className="w-3 h-3" />
                            <span>{session.folder.name}</span>
                          </div>
                        )}
                        {session.tag && (
                          <div className="flex items-center gap-1">
                            <HugeiconsIcon icon={TagIcon} strokeWidth={2} className="w-3 h-3" />
                            <span>{session.tag.name}</span>
                          </div>
                        )}
                        <span>•</span>
                        <span>{session._count.updateTasks} tâche{session._count.updateTasks > 1 ? 's' : ''}</span>
                      </div>

                      <div className="text-xs text-muted-foreground mt-2">
                        Créée {formatDistance(new Date(session.createdAt), new Date(), { addSuffix: true, locale: fr })}
                      </div>
                    </div>

                    <DeleteConfirmation
                      title="Supprimer cette session ?"
                      description="Cette action supprimera toutes les tâches associées. Cette action est irréversible."
                      onConfirm={async () => {
                        'use server';
                        await deleteUpdateSession(session.id);
                      }}
                      trigger={
                        <Button variant="ghost" size="sm">
                          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                        </Button>
                      }
                    />
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <Link href={isStarted ? `/updates/${session.id}/track` : `/updates/${session.id}/prepare`}>
                    <Button variant="outline" size="sm" className="w-full">
                      {isCompleted ? (
                        <>Voir le résumé</>
                      ) : isStarted ? (
                        <>Continuer le suivi</>
                      ) : (
                        <>Préparer la session</>
                      )}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
