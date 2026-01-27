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
import { updateSoftwareVersion } from '@/lib/actions/installations';

interface UpdateSoftwareDialogProps {
  machineId: number;
  installationId: number;
  softwareId: number;
  softwareName: string;
  currentVersion: string;
  trigger: ReactNode;
}

export function UpdateSoftwareDialog({
  machineId,
  installationId,
  softwareId,
  softwareName,
  currentVersion,
  trigger
}: UpdateSoftwareDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await updateSoftwareVersion(machineId, formData);
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
            <AlertDialogTitle>Mettre à jour {softwareName}</AlertDialogTitle>
          </AlertDialogHeader>

          <input type="hidden" name="oldInstallationId" value={installationId} />
          <input type="hidden" name="softwareId" value={softwareId} />

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="currentVersion">Version actuelle</FieldLabel>
              <Input
                id="currentVersion"
                value={currentVersion}
                disabled
                className="bg-muted"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="newVersion">Nouvelle version</FieldLabel>
              <Input
                id="newVersion"
                name="newVersion"
                placeholder="2.0.0"
                required
              />
            </Field>
          </FieldGroup>

          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
