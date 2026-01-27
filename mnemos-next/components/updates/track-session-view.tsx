'use client';

import { useState, useOptimistic, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MachineTypeBadge } from '@/components/machines/machine-type-badge';
import { DynamicIcon } from '@/components/shared/dynamic-icon';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircleIcon,
  Cancel01Icon,
  MinusSignIcon,
  ClockIcon,
  Copy01Icon
} from '@hugeicons/core-free-icons';
import { updateTaskStatus, completeUpdateSession } from '@/lib/actions/update-sessions';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TrackSessionViewProps {
  session: any;
}

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';

export function TrackSessionView({ session }: TrackSessionViewProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Optimistic updates for better UX
  const [optimisticTasks, updateOptimisticTasks] = useOptimistic(
    session.updateTasks,
    (state: any[], { id, status }: { id: number; status: TaskStatus }) =>
      state.map(task =>
        task.id === id ? { ...task, status } : task
      )
  );

  const handleStatusChange = (updateTaskId: number, newStatus: TaskStatus) => {
    const taskNotes = notes[updateTaskId] || '';

    updateOptimisticTasks({ id: updateTaskId, status: newStatus });

    startTransition(async () => {
      await updateTaskStatus(updateTaskId, newStatus, taskNotes);
      setEditingNotes(null);
      router.refresh();
    });
  };

  const handleCompleteSession = () => {
    startTransition(async () => {
      await completeUpdateSession(session.id);
      router.refresh();
    });
  };

  const copyTeamViewerId = async (teamviewerId: string) => {
    try {
      await navigator.clipboard.writeText(teamviewerId);
      setCopiedId(teamviewerId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Grouper les tâches par machine
  const tasksByMachine = optimisticTasks.reduce((acc: any, task: any) => {
    const machineKey = `${task.machine.site.id}-${task.machine.id}`;
    if (!acc[machineKey]) {
      acc[machineKey] = {
        machine: task.machine,
        tasks: []
      };
    }
    acc[machineKey].tasks.push(task);
    return acc;
  }, {});

  // Statistiques
  const totalTasks = optimisticTasks.length;
  const completedTasks = optimisticTasks.filter((t: any) => t.status === 'COMPLETED').length;
  const skippedTasks = optimisticTasks.filter((t: any) => t.status === 'SKIPPED').length;
  const inProgressTasks = optimisticTasks.filter((t: any) => t.status === 'IN_PROGRESS').length;
  const pendingTasks = optimisticTasks.filter((t: any) => t.status === 'PENDING').length;
  const progress = totalTasks > 0 ? Math.round(((completedTasks + skippedTasks) / totalTasks) * 100) : 0;

  const isSessionCompleted = !!session.completedAt;

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500/10 border-green-500/20 text-green-700';
      case 'SKIPPED': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700';
      case 'IN_PROGRESS': return 'bg-blue-500/10 border-blue-500/20 text-blue-700';
      default: return 'bg-muted border-border';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'COMPLETED': return CheckmarkCircleIcon;
      case 'SKIPPED': return MinusSignIcon;
      case 'IN_PROGRESS': return ClockIcon;
      default: return Cancel01Icon;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">{session.name}</h1>
            {session.description && (
              <p className="text-muted-foreground mt-1">{session.description}</p>
            )}
          </div>

          {!isSessionCompleted && (
            <Button onClick={handleCompleteSession} disabled={isPending || progress < 100}>
              <HugeiconsIcon icon={CheckmarkCircleIcon} strokeWidth={2} data-icon="inline-start" />
              Terminer la session
            </Button>
          )}
        </div>

        {/* Statistics */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="text-2xl font-bold">{progress}%</div>
                <div className="text-xs text-muted-foreground">Progression</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                <div className="text-xs text-muted-foreground">Terminées</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{inProgressTasks}</div>
                <div className="text-xs text-muted-foreground">En cours</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{skippedTasks}</div>
                <div className="text-xs text-muted-foreground">Ignorées</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{pendingTasks}</div>
                <div className="text-xs text-muted-foreground">En attente</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            {session.startedAt && (
              <div className="text-xs text-muted-foreground mt-2">
                Démarrée {formatDistance(new Date(session.startedAt), new Date(), { addSuffix: true, locale: fr })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tasks by machine */}
      <div className="space-y-4">
        {Object.values(tasksByMachine).map(({ machine, tasks }: any) => (
          <Card key={`${machine.site.id}-${machine.id}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MachineTypeBadge type={machine.type} />
                  <div>
                    <CardTitle className="text-lg">
                      {machine.site.name} - {machine.name}
                    </CardTitle>
                    {machine.teamviewerId && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground font-mono">
                          TeamViewer: {machine.teamviewerId}
                        </span>
                        <button
                          onClick={() => copyTeamViewerId(machine.teamviewerId)}
                          className="text-xs text-primary hover:underline"
                        >
                          <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <Badge variant="secondary">
                  {tasks.filter((t: any) => t.status === 'COMPLETED' || t.status === 'SKIPPED').length}/{tasks.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tasks.map((task: any) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border transition-all ${getStatusColor(task.status)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        {task.task.iconName && (
                          <DynamicIcon iconName={task.task.iconName} className="w-5 h-5 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{task.task.name}</div>
                          {task.task.description && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {task.task.description}
                            </div>
                          )}
                          {task.notes && (
                            <div className="text-xs mt-1 p-2 bg-background rounded border">
                              Note: {task.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <HugeiconsIcon
                          icon={getStatusIcon(task.status)}
                          strokeWidth={2}
                          className="w-5 h-5"
                        />
                        {!isSessionCompleted && (
                          <div className="flex gap-1">
                            {task.status !== 'COMPLETED' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                                disabled={isPending}
                                title="Marquer comme terminée"
                              >
                                <HugeiconsIcon icon={CheckmarkCircleIcon} strokeWidth={2} className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                            {task.status !== 'SKIPPED' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStatusChange(task.id, 'SKIPPED')}
                                disabled={isPending}
                                title="Ignorer"
                              >
                                <HugeiconsIcon icon={MinusSignIcon} strokeWidth={2} className="w-4 h-4 text-yellow-600" />
                              </Button>
                            )}
                            {task.status !== 'PENDING' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStatusChange(task.id, 'PENDING')}
                                disabled={isPending}
                                title="Réinitialiser"
                              >
                                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes editing */}
                    {editingNotes === task.id && (
                      <div className="mt-2">
                        <Textarea
                          placeholder="Ajouter une note..."
                          value={notes[task.id] || ''}
                          onChange={(e) => setNotes({ ...notes, [task.id]: e.target.value })}
                          rows={2}
                          className="text-xs"
                        />
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              handleStatusChange(task.id, task.status);
                            }}
                          >
                            Enregistrer
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingNotes(null);
                              setNotes({ ...notes, [task.id]: '' });
                            }}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    )}
                    {!isSessionCompleted && editingNotes !== task.id && (
                      <button
                        onClick={() => setEditingNotes(task.id)}
                        className="text-xs text-primary hover:underline mt-1"
                      >
                        Ajouter une note
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
