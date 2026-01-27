'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { FolderIcon, Cancel01Icon, FilterIcon } from '@hugeicons/core-free-icons';

interface RemoteAccessFilterProps {
  folders: Array<{ id: number; name: string }>;
  tags: Array<{ id: number; name: string }>;
  selectedFolderId?: number;
  selectedTagId?: number;
}

export function RemoteAccessFilter({
  folders,
  tags,
  selectedFolderId,
  selectedTagId,
}: RemoteAccessFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFolderClick = (folderId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedFolderId === folderId) {
      params.delete('folderId');
    } else {
      params.set('folderId', folderId.toString());
    }
    router.push(`/remote-access?${params.toString()}`);
  };

  const handleTagClick = (tagId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedTagId === tagId) {
      params.delete('tagId');
    } else {
      params.set('tagId', tagId.toString());
    }
    router.push(`/remote-access?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/remote-access');
  };

  const hasActiveFilters = selectedFolderId !== undefined || selectedTagId !== undefined;

  if (folders.length === 0 && tags.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-3">
      {folders.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <HugeiconsIcon icon={FolderIcon} strokeWidth={2} className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Dossiers</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {folders.map((folder) => (
              <Badge
                key={folder.id}
                variant={selectedFolderId === folder.id ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => handleFolderClick(folder.id)}
              >
                {folder.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <HugeiconsIcon icon={FilterIcon} strokeWidth={2} className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant={selectedTagId === tag.id ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => handleTagClick(tag.id)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-sm"
        >
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} data-icon="inline-start" />
          Effacer les filtres
        </Button>
      )}
    </div>
  );
}
