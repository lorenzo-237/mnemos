'use client';

import { useState, useTransition, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
import { IconSelector } from '@/components/shared/icon-selector';
import { MetadataEditor } from '@/components/shared/metadata-editor';
import { createSoftware, updateSoftware } from '@/lib/actions/softwares';
import type { SoftwareFormData } from '@/lib/types';
import { DEFAULT_ICON_NAME } from '../shared/dynamic-icon';

interface SoftwareFormDialogProps {
  software?: SoftwareFormData;
  trigger: ReactNode;
}

export function SoftwareFormDialog({ software, trigger }: SoftwareFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [iconName, setIconName] = useState<string | null>(
    software?.iconName || DEFAULT_ICON_NAME
  );
  const [metadata, setMetadata] = useState<Record<string, { value: string; iconName?: string }> | null>(
    software?.metadata || null
  );

  const handleSubmit = async (formData: FormData) => {
    if (iconName) formData.set('iconName', iconName);
    if (metadata) formData.set('metadata', JSON.stringify(metadata));

    startTransition(async () => {
      try {
        if (software) {
          await updateSoftware(software.id, formData);
          toast.success('Logiciel modifié avec succès');
        } else {
          await createSoftware(formData);
          toast.success('Logiciel créé avec succès');
        }
        setOpen(false);
        router.refresh();
      } catch (error) {
        console.error('Form error:', error);
        toast.error(
          software
            ? 'Erreur lors de la modification du logiciel'
            : 'Erreur lors de la création du logiciel'
        );
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent className="max-h-[90vh] overflow-y-auto" size="large">
        <form action={handleSubmit}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {software ? 'Modifier le logiciel' : 'Nouveau logiciel'}
            </AlertDialogTitle>
          </AlertDialogHeader>

          <FieldGroup className="space-y-4 my-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-4">
                <Field>
                  <FieldLabel htmlFor="name">Nom du logiciel *</FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={software?.name}
                    placeholder="Ex: Visual Studio Code"
                    required
                    disabled={!!software}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={software?.description || ''}
                    placeholder="Description du logiciel..."
                    rows={3}
                  />
                </Field>
              </div>

              <div className="flex flex-col gap-4">
                <IconSelector
                  value={iconName}
                  onChange={setIconName}
                  label="Icône du logiciel"
                />
              </div>

              <div className="col-span-2">
                <MetadataEditor
                  value={metadata}
                  onChange={setMetadata}
                  label="Métadonnées personnalisées"
                />
              </div>
            </div>
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
