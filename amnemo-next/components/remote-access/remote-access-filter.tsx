'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { FolderIcon, Cancel01Icon, FilterIcon } from '@hugeicons/core-free-icons';

interface RemoteAccessFilterProps {
  folders: Array<{ id: number; name: string }>;
  tags: Array<{ id: number; name: string; color?: string | null }>;
  selectedFolderIds: number[];
  selectedTagIds: number[];
}

export function RemoteAccessFilter({
  folders,
  tags,
  selectedFolderIds,
  selectedTagIds,
}: RemoteAccessFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFolderClick = (folderId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('folderIds');

    let newFolderIds: number[];
    if (selectedFolderIds.includes(folderId)) {
      // Remove folder if already selected
      newFolderIds = selectedFolderIds.filter(id => id !== folderId);
    } else {
      // Add folder to selection
      newFolderIds = [...selectedFolderIds, folderId];
    }

    // Add all selected folder IDs as separate params
    newFolderIds.forEach(id => params.append('folderIds', id.toString()));

    router.push(`/remote-access?${params.toString()}`);
  };

  const handleTagClick = (tagId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('tagIds');

    let newTagIds: number[];
    if (selectedTagIds.includes(tagId)) {
      // Remove tag if already selected
      newTagIds = selectedTagIds.filter(id => id !== tagId);
    } else {
      // Add tag to selection
      newTagIds = [...selectedTagIds, tagId];
    }

    // Add all selected tag IDs as separate params
    newTagIds.forEach(id => params.append('tagIds', id.toString()));

    router.push(`/remote-access?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/remote-access');
  };

  const hasActiveFilters = selectedFolderIds.length > 0 || selectedTagIds.length > 0;

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
                variant={selectedFolderIds.includes(folder.id) ? 'default' : 'outline'}
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
            {tags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              const bgColor = tag.color || '#6B7280';
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagClick(tag.id)}
                  className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium transition-all cursor-pointer
                    ${isSelected
                      ? 'text-white shadow-sm'
                      : 'bg-transparent border-2 hover:opacity-80'
                    }
                  `}
                  style={isSelected
                    ? { backgroundColor: bgColor }
                    : { borderColor: bgColor, color: bgColor }
                  }
                >
                  {tag.name}
                </button>
              );
            })}
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
