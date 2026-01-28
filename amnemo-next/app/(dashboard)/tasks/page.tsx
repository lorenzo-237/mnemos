import { getTasks, deleteTask } from "@/lib/actions/tasks";
import { getTags } from "@/lib/actions/tags";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { TasksTable } from "@/components/tasks/tasks-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";

export default async function TasksPage() {
  const [tasks, tags] = await Promise.all([getTasks(), getTags()]);

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
        <TasksTable tasks={tasks} tags={tags} onDeleteTask={deleteTask} />
      )}
    </div>
  );
}
