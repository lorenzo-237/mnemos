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
import { addInstallation } from '@/lib/actions/installations';
import { getSoftwares } from '@/lib/actions/softwares';
import { useEffect } from 'react';

interface AddInstallationDialogProps {
  machineId: number;
  trigger: ReactNode;
}

export function AddInstallationDialog({ machineId, trigger }: AddInstallationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [softwares, setSoftwares] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      getSoftwares().then((data) => {
        setSoftwares(data.map(s => s.name));
      });
    }
  }, [open]);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await addInstallation(machineId, formData);
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
            <AlertDialogTitle>Ajouter un logiciel</AlertDialogTitle>
          </AlertDialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="softwareName">Nom du logiciel</FieldLabel>
              <Input
                id="softwareName"
                name="softwareName"
                list="softwares-list"
                placeholder="Saisir ou sélectionner un logiciel"
                autoComplete="off"
                required
              />
              <datalist id="softwares-list">
                {softwares.map((software) => (
                  <option key={software} value={software} />
                ))}
              </datalist>
              <p className="text-xs text-muted-foreground mt-1">
                Commencez à taper pour voir les suggestions
              </p>
            </Field>

            <Field>
              <FieldLabel htmlFor="version">Version</FieldLabel>
              <Input
                id="version"
                name="version"
                placeholder="1.0.0"
                autoComplete="off"
                required
              />
            </Field>
          </FieldGroup>

          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Ajout...' : 'Ajouter'}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
