'use client';

import { useState, useTransition, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IconSelector } from '@/components/shared/icon-selector';
import { createTask, updateTask } from '@/lib/actions/tasks';

interface TaskFormDialogProps {
  task?: {
    id: number;
    name: string;
    description?: string | null;
    targetType: 'SERVER' | 'CLIENT';
    iconName?: string | null;
  };
  trigger: ReactNode;
}

export function TaskFormDialog({ task, trigger }: TaskFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [iconName, setIconName] = useState<string | null>(task?.iconName || null);
  const [targetType, setTargetType] = useState<string>(task?.targetType || 'CLIENT');

  const handleSubmit = async (formData: FormData) => {
    if (iconName) {
      formData.set('iconName', iconName);
    }
    formData.set('targetType', targetType);

    startTransition(async () => {
      try {
        if (task) {
          await updateTask(task.id, formData);
        } else {
          await createTask(formData);
        }
        setOpen(false);
        router.refresh();
      } catch (error) {
        console.error('Form error:', error);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <form action={handleSubmit}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
            </AlertDialogTitle>
          </AlertDialogHeader>

          <FieldGroup className="space-y-4 my-4">
            <Field>
              <FieldLabel htmlFor="name">Nom de la tâche *</FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={task?.name}
                placeholder="Ex: Installer les mises à jour Windows"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                name="description"
                defaultValue={task?.description || ''}
                placeholder="Détails sur la tâche à effectuer..."
                rows={3}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="targetType">Type de machine cible *</FieldLabel>
              <Select value={targetType} onValueChange={setTargetType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLIENT">Client</SelectItem>
                  <SelectItem value="SERVER">Serveur</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <IconSelector
              value={iconName}
              onChange={setIconName}
              label="Icône de la tâche"
            />
          </FieldGroup>

          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
