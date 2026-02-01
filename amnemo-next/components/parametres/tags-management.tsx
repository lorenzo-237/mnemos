'use client';

import { useState, useTransition, useEffect } from 'react';
import { getTags, updateTag, deleteTag } from '@/lib/actions/tags';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Edit02Icon, Delete02Icon, Tick02Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { useError } from '@/components/error-provider';
import { toast } from 'sonner';

interface Tag {
  id: number;
  name: string;
  _count: { sites: number };
}

export function TagsManagement() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isPending, startTransition] = useTransition();
  const { showError } = useError();

  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await getTags();
        setTags(data as Tag[]);
      } catch (error) {
        showError('Erreur lors du chargement des tags');
      }
    });
  }, [showError]);

  const handleEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditValue(tag.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSaveEdit = (tagId: number) => {
    if (!editValue.trim()) {
      showError('Le nom du tag ne peut pas être vide');
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('name', editValue.trim());
        await updateTag(tagId, formData);

        // Update local state
        setTags((prev) =>
          prev.map((t) => (t.id === tagId ? { ...t, name: editValue.trim() } : t))
        );

        setEditingId(null);
        setEditValue('');
        toast.success('Tag renommé avec succès');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur lors de la modification';
        showError(message);
      }
    });
  };

  const handleDelete = (tag: Tag) => {
    if (tag._count.sites > 0) {
      showError(`Ce tag est utilisé par ${tag._count.sites} site(s) et ne peut pas être supprimé`);
      return;
    }

    startTransition(async () => {
      try {
        await deleteTag(tag.id);
        setTags((prev) => prev.filter((t) => t.id !== tag.id));
        toast.success('Tag supprimé avec succès');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur lors de la suppression';
        showError(message);
      }
    });
  };

  if (tags.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun tag à gérer. Les tags sont créés automatiquement lors de l'ajout de sites.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="flex items-center justify-between p-3 border rounded-md"
        >
          {editingId === tag.id ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                disabled={isPending}
                className="max-w-xs"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit(tag.id);
                  if (e.key === 'Escape') handleCancelEdit();
                }}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleSaveEdit(tag.id)}
                disabled={isPending}
              >
                <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelEdit}
                disabled={isPending}
              >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1">
                <p className="font-medium">{tag.name}</p>
                <p className="text-xs text-muted-foreground">
                  {tag._count.sites} site(s)
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(tag)}
                  disabled={isPending}
                >
                  <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} data-icon="inline-start" />
                  Renommer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(tag)}
                  disabled={isPending || tag._count.sites > 0}
                >
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} data-icon="inline-start" />
                  Supprimer
                </Button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
