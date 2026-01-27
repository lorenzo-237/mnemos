'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createUpdateSession } from '@/lib/actions/update-sessions';

interface UpdateSessionFormProps {
  folders: Array<{ id: number; name: string }>;
  tags: Array<{ id: number; name: string }>;
}

export function UpdateSessionForm({ folders, tags }: UpdateSessionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedFolderId, setSelectedFolderId] = useState<string>('none');
  const [selectedTagId, setSelectedTagId] = useState<string>('none');

  const handleSubmit = async (formData: FormData) => {
    if (selectedFolderId && selectedFolderId !== 'none') {
      formData.set('folderId', selectedFolderId);
    }
    if (selectedTagId && selectedTagId !== 'none') {
      formData.set('tagId', selectedTagId);
    }

    startTransition(async () => {
      try {
        await createUpdateSession(formData);
        toast.success('Session créée avec succès');
      } catch (error) {
        console.error('Form error:', error);
        toast.error('Erreur lors de la création de la session');
      }
    });
  };

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>Informations de la session</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit}>
          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel htmlFor="name">Nom de la session *</FieldLabel>
              <Input
                id="name"
                name="name"
                placeholder="Ex: Mise à jour Mars 2026"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                name="description"
                placeholder="Détails sur cette session de mise à jour..."
                rows={3}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="folderId">Dossier ciblé</FieldLabel>
              <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un dossier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun dossier</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id.toString()}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Les machines de tous les sites de ce dossier seront disponibles
              </p>
            </Field>

            <Field>
              <FieldLabel htmlFor="tagId">Tag ciblé</FieldLabel>
              <Select value={selectedTagId} onValueChange={setSelectedTagId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun tag</SelectItem>
                  {tags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id.toString()}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Les machines de tous les sites avec ce tag seront disponibles
              </p>
            </Field>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Création...' : 'Créer et préparer'}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
