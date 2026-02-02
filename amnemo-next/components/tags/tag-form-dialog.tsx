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

const PRESET_COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#6366F1', // indigo
  '#84CC16', // lime
];

interface TagFormDialogProps {
  tag?: {
    id: number;
    name: string;
    color?: string | null;
  };
  trigger: ReactNode;
}

export function TagFormDialog({ tag, trigger }: TagFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedColor, setSelectedColor] = useState(tag?.color || PRESET_COLORS[0]);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    formData.set('color', selectedColor);
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

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setSelectedColor(tag?.color || PRESET_COLORS[0]);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-2xl">
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

            <Field>
              <FieldLabel>Couleur</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-md border-2 transition-all ${
                      selectedColor === color
                        ? 'border-foreground scale-110'
                        : 'border-transparent hover:border-muted-foreground/50'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-8 h-8 p-0 border-0 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-24 font-mono text-sm"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Aperçu :</span>
                <span
                  className="px-2 py-0.5 rounded-md text-sm font-medium text-white"
                  style={{ backgroundColor: selectedColor }}
                >
                  {tag?.name || 'Exemple'}
                </span>
              </div>
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
