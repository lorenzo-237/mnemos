import { getUpdateSessions } from "@/lib/actions/update-sessions";
import { requireSession } from "@/lib/auth/session";
import { DeleteConfirmation } from "@/components/shared/delete-confirmation";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignIcon,
  Delete02Icon,
  FolderIcon,
  PlayIcon,
  CheckmarkCircleIcon,
  ViewIcon
} from "@hugeicons/core-free-icons";
import { deleteUpdateSession } from "@/lib/actions/update-sessions";
import Link from "next/link";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";

export default async function UpdatesPage() {
  const [sessions, session] = await Promise.all([
    getUpdateSessions(),
    requireSession(),
  ]);
  const canDelete = session.role !== 'UTILISATEUR';

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
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead className="text-center">Tâches</TableHead>
                <TableHead>Créée</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => {
                const isCompleted = !!session.completedAt;
                const isStarted = !!session.startedAt;

                return (
                  <TableRow key={session.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{session.name}</div>
                        {session.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            {session.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {session.folder && (
                          <div className="flex items-center gap-1 text-xs">
                            <HugeiconsIcon icon={FolderIcon} strokeWidth={2} className="w-3 h-3" />
                            <span>{session.folder.name}</span>
                          </div>
                        )}
                        {session.tag && (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium text-white"
                            style={{ backgroundColor: session.tag.color || '#6B7280' }}
                          >
                            {session.tag.name}
                          </span>
                        )}
                        {!session.folder && !session.tag && (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">{session._count.updateTasks}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {formatDistance(new Date(session.createdAt), new Date(), { addSuffix: true, locale: fr })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Link href={isStarted ? `/updates/${session.id}/track` : `/updates/${session.id}/prepare`}>
                          <Button variant="ghost" size="sm" title={isCompleted ? 'Voir le résumé' : isStarted ? 'Continuer le suivi' : 'Préparer la session'}>
                            <HugeiconsIcon icon={ViewIcon} strokeWidth={2} />
                          </Button>
                        </Link>
                        {canDelete && (
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
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
