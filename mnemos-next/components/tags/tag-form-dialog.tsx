'use client';

import { useState, useTransition, ReactNode } from 'react';
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
import { Button } from '@/components/ui/button';
import { createTag, updateTag } from '@/lib/actions/tags';

interface TagFormDialogProps {
  tag?: {
    id: number;
    name: string;
  };
  trigger: ReactNode;
}

export function TagFormDialog({ tag, trigger }: TagFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        if (tag) {
          await updateTag(tag.id, formData);
        } else {
          await createTag(formData);
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

      <AlertDialogContent>
        <form action={handleSubmit}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {tag ? 'Modifier le tag' : 'Nouveau tag'}
            </AlertDialogTitle>
          </AlertDialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nom du tag</FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={tag?.name}
                placeholder="Urgent"
                required
              />
            </Field>
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
