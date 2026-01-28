import { getTasks } from "@/lib/actions/tasks";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { DeleteConfirmation } from "@/components/shared/delete-confirmation";
import { EmptyState } from "@/components/shared/empty-state";
import { DynamicIcon } from "@/components/shared/dynamic-icon";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Edit02Icon, Delete02Icon, ServerStackIcon, ComputerIcon } from "@hugeicons/core-free-icons";
import { deleteTask } from "@/lib/actions/tasks";

export default async function TasksPage() {
  const tasks = await getTasks();

  const serverTasks = tasks.filter(t => t.targetType === 'SERVER');
  const clientTasks = tasks.filter(t => t.targetType === 'CLIENT');

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tâches de maintenance</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos tâches réutilisables pour les mises à jour
          </p>
        </div>

        <TaskFormDialog
          trigger={
            <Button>
              <HugeiconsIcon
                icon={PlusSignIcon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Nouvelle tâche
            </Button>
          }
        />
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="Aucune tâche"
          description="Créez votre première tâche de maintenance pour préparer vos mises à jour."
          action={
            <TaskFormDialog
              trigger={
                <Button>
                  <HugeiconsIcon
                    icon={PlusSignIcon}
                    strokeWidth={2}
                    data-icon="inline-start"
                  />
                  Créer une tâche
                </Button>
              }
            />
          }
        />
      ) : (
        <div className="space-y-8">
          {/* Tâches Client */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <HugeiconsIcon icon={ComputerIcon} strokeWidth={2} className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Tâches Client</h2>
              <Badge variant="secondary">{clientTasks.length}</Badge>
            </div>

            {clientTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune tâche client</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientTasks.map((task) => (
                  <Card key={task.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-2 flex-1">
                          <div className="flex items-center gap-2">
                            {task.iconName && (
                              <DynamicIcon iconName={task.iconName} className="w-5 h-5" />
                            )}
                            <CardTitle className="text-base">{task.name}</CardTitle>
                          </div>
                          {task.type === 'SOFTWARE_REPLACEMENT' && (
                            <Badge variant="outline" className="w-fit text-xs">
                              Remplacement logiciel
                            </Badge>
                          )}
                          {task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {task.tags.map(tt => (
                                <Badge key={tt.tag.id} variant="secondary" className="text-xs">{tt.tag.name}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <TaskFormDialog
                            task={task}
                            trigger={
                              <Button variant="ghost" size="sm">
                                <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
                              </Button>
                            }
                          />
                          <DeleteConfirmation
                            title="Supprimer cette tâche ?"
                            description="Cette action est irréversible."
                            onConfirm={async () => {
                              'use server';
                              await deleteTask(task.id);
                            }}
                            trigger={
                              <Button variant="ghost" size="sm">
                                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                              </Button>
                            }
                          />
                        </div>
                      </div>
                      {task.description && (
                        <CardDescription className="line-clamp-2">
                          {task.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Tâches Serveur */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <HugeiconsIcon icon={ServerStackIcon} strokeWidth={2} className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Tâches Serveur</h2>
              <Badge variant="secondary">{serverTasks.length}</Badge>
            </div>

            {serverTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune tâche serveur</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {serverTasks.map((task) => (
                  <Card key={task.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-2 flex-1">
                          <div className="flex items-center gap-2">
                            {task.iconName && (
                              <DynamicIcon iconName={task.iconName} className="w-5 h-5" />
                            )}
                            <CardTitle className="text-base">{task.name}</CardTitle>
                          </div>
                          {task.type === 'SOFTWARE_REPLACEMENT' && (
                            <Badge variant="outline" className="w-fit text-xs">
                              Remplacement logiciel
                            </Badge>
                          )}
                          {task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {task.tags.map(tt => (
                                <Badge key={tt.tag.id} variant="secondary" className="text-xs">{tt.tag.name}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <TaskFormDialog
                            task={task}
                            trigger={
                              <Button variant="ghost" size="sm">
                                <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
                              </Button>
                            }
                          />
                          <DeleteConfirmation
                            title="Supprimer cette tâche ?"
                            description="Cette action est irréversible."
                            onConfirm={async () => {
                              'use server';
                              await deleteTask(task.id);
                            }}
                            trigger={
                              <Button variant="ghost" size="sm">
                                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                              </Button>
                            }
                          />
                        </div>
                      </div>
                      {task.description && (
                        <CardDescription className="line-clamp-2">
                          {task.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
