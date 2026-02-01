'use client';

import { useState, useTransition, useEffect } from 'react';
import { getFolders, updateFolder, deleteFolder } from '@/lib/actions/folders';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Edit02Icon, Delete02Icon, Tick02Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { useError } from '@/components/error-provider';
import { toast } from 'sonner';

interface Folder {
  id: number;
  name: string;
  _count: { sites: number; updateSessions: number };
}

export function FoldersManagement() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isPending, startTransition] = useTransition();
  const { showError } = useError();

  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await getFolders();
        setFolders(data as Folder[]);
      } catch (error) {
        showError('Erreur lors du chargement des dossiers');
      }
    });
  }, [showError]);

  const handleEdit = (folder: Folder) => {
    setEditingId(folder.id);
    setEditValue(folder.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSaveEdit = (folderId: number) => {
    if (!editValue.trim()) {
      showError('Le nom du dossier ne peut pas être vide');
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('name', editValue.trim());
        await updateFolder(folderId, formData);

        // Update local state
        setFolders((prev) =>
          prev.map((f) => (f.id === folderId ? { ...f, name: editValue.trim() } : f))
        );

        setEditingId(null);
        setEditValue('');
        toast.success('Dossier renommé avec succès');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur lors de la modification';
        showError(message);
      }
    });
  };

  const handleDelete = (folder: Folder) => {
    const totalUsage = folder._count.sites + folder._count.updateSessions;
    if (totalUsage > 0) {
      showError(`Ce dossier est utilisé par ${totalUsage} élément(s) et ne peut pas être supprimé`);
      return;
    }

    startTransition(async () => {
      try {
        await deleteFolder(folder.id, true);
        setFolders((prev) => prev.filter((f) => f.id !== folder.id));
        toast.success('Dossier supprimé avec succès');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur lors de la suppression';
        showError(message);
      }
    });
  };

  if (folders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun dossier à gérer. Les dossiers sont créés automatiquement lors de l'ajout de sites.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {folders.map((folder) => (
        <div
          key={folder.id}
          className="flex items-center justify-between p-3 border rounded-md"
        >
          {editingId === folder.id ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                disabled={isPending}
                className="max-w-xs"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit(folder.id);
                  if (e.key === 'Escape') handleCancelEdit();
                }}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleSaveEdit(folder.id)}
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
                <p className="font-medium">{folder.name}</p>
                <p className="text-xs text-muted-foreground">
                  {folder._count.sites} site(s), {folder._count.updateSessions} session(s)
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(folder)}
                  disabled={isPending}
                >
                  <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} data-icon="inline-start" />
                  Renommer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(folder)}
                  disabled={isPending || folder._count.sites + folder._count.updateSessions > 0}
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
