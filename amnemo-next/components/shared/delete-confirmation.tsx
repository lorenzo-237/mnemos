'use client';

import { useState, useTransition, ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useError } from '@/components/error-provider';

interface DeleteConfirmationProps {
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
  trigger: ReactNode;
}

export function DeleteConfirmation({ title, description, onConfirm, trigger }: DeleteConfirmationProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { showError } = useError();

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        await onConfirm();
        setOpen(false);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression';
        showError(message);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
            {isPending ? 'Suppression...' : 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
