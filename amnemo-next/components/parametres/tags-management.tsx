'use client';

import { useState, useTransition, useEffect } from 'react';
import { getTags, updateTag, deleteTag } from '@/lib/actions/tags';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Edit02Icon, Delete02Icon, Tick02Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { useError } from '@/components/error-provider';
import { toast } from 'sonner';

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

interface Tag {
  id: number;
  name: string;
  color: string | null;
  _count: { sites: number };
}

export function TagsManagement() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editColor, setEditColor] = useState('');
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
    setEditColor(tag.color || PRESET_COLORS[0]);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
    setEditColor('');
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
        formData.append('color', editColor);
        await updateTag(tagId, formData);

        setTags((prev) =>
          prev.map((t) => (t.id === tagId ? { ...t, name: editValue.trim(), color: editColor } : t))
        );

        setEditingId(null);
        setEditValue('');
        setEditColor('');
        toast.success('Tag modifié avec succès');
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
            <div className="flex items-center gap-3 flex-1">
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
              <div className="flex items-center gap-1">
                {PRESET_COLORS.slice(0, 5).map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-6 h-6 rounded border-2 transition-all ${
                      editColor === color
                        ? 'border-foreground scale-110'
                        : 'border-transparent hover:border-muted-foreground/50'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setEditColor(color)}
                  />
                ))}
                <Input
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="w-6 h-6 p-0 border-0 cursor-pointer"
                />
              </div>
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
              <div className="flex items-center gap-3 flex-1">
                <span
                  className="px-2 py-0.5 rounded-md text-sm font-medium text-white"
                  style={{ backgroundColor: tag.color || '#6B7280' }}
                >
                  {tag.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {tag._count.sites} site(s)
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(tag)}
                  disabled={isPending}
                >
                  <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} data-icon="inline-start" />
                  Modifier
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
