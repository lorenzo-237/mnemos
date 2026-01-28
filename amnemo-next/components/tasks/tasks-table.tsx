'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DynamicIcon } from '@/components/shared/dynamic-icon';
import { TaskFormDialog } from '@/components/tasks/task-form-dialog';
import { DeleteConfirmation } from '@/components/shared/delete-confirmation';
import { HugeiconsIcon } from '@hugeicons/react';
import { Edit02Icon, Delete02Icon, Search01Icon } from '@hugeicons/core-free-icons';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
interface Task {
  id: number;
  name: string;
  description?: string | null;
  type: 'DEFAULT' | 'SOFTWARE_REPLACEMENT';
  targetType: 'SERVER' | 'CLIENT';
  iconName?: string | null;
  tags: Array<{ tag: { id: number; name: string } }>;
}

interface Tag {
  id: number;
  name: string;
}

interface TasksTableProps {
  tasks: Task[];
  tags: Tag[];
  onDeleteTask: (id: number) => Promise<void>;
}

export function TasksTable({ tasks, tags, onDeleteTask }: TasksTableProps) {
  const [searchName, setSearchName] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesName =
      !searchName || task.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesTags =
      selectedTagIds.length === 0 ||
      task.tags.length === 0 ||
      task.tags.some((tt) => selectedTagIds.includes(tt.tag.id));
    return matchesName && matchesTags;
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <HugeiconsIcon
          icon={Search01Icon}
          strokeWidth={2}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
        />
        <Input
          placeholder="Rechercher une tâche..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="pl-9"
        />
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtrer par tag :</span>
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant={selectedTagIds.includes(tag.id) ? 'default' : 'outline'}
              className="cursor-pointer select-none"
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
            </Badge>
          ))}
          {selectedTagIds.length > 0 && (
            <button
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
              onClick={() => setSelectedTagIds([])}
            >
              Réinitialiser
            </button>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Les tâches sans tag sont <strong>globales</strong> — elles apparaissent dans toutes les
        sessions quelle que soit leur portée.
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Cible</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {task.iconName && (
                    <DynamicIcon iconName={task.iconName} className="w-4 h-4 text-muted-foreground" />
                  )}
                  <div>
                    <span className="font-medium">{task.name}</span>
                    {task.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-xs">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {task.type === 'SOFTWARE_REPLACEMENT' ? (
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    Remplacement logiciel
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">Standard</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {task.targetType === 'CLIENT' ? 'Client' : 'Serveur'}
                </Badge>
              </TableCell>
              <TableCell>
                {task.tags.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic">Globale</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((tt) => (
                      <Badge key={tt.tag.id} variant="secondary" className="text-xs">
                        {tt.tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <TaskFormDialog
                    task={task}
                    trigger={
                      <Button variant="ghost" size="sm">
                        <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} className="w-3.5 h-3.5" />
                      </Button>
                    }
                  />
                  <DeleteConfirmation
                    title="Supprimer cette tâche ?"
                    description="Cette action est irréversible."
                    onConfirm={() => onDeleteTask(task.id)}
                    trigger={
                      <Button variant="ghost" size="sm">
                        <HugeiconsIcon
                          icon={Delete02Icon}
                          strokeWidth={2}
                          className="w-3.5 h-3.5 text-red-500"
                        />
                      </Button>
                    }
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filteredTasks.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                Aucune tâche ne correspond au filtre
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
