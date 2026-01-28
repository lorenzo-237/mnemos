'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HugeiconsIcon } from '@hugeicons/react';
import { FolderIcon, Cancel01Icon, FilterIcon, Search01Icon } from '@hugeicons/core-free-icons';

interface SitesFilterProps {
  folders: Array<{ id: number; name: string }>;
  tags: Array<{ id: number; name: string }>;
  selectedFolderIds: number[];
  selectedTagIds: number[];
  searchName: string;
}

export function SitesFilter({
  folders,
  tags,
  selectedFolderIds,
  selectedTagIds,
  searchName,
}: SitesFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [nameInput, setNameInput] = useState(searchName);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (nameInput) {
        params.set('name', nameInput);
      } else {
        params.delete('name');
      }
      router.push(`/sites?${params.toString()}`);
    }, 400);
    return () => clearTimeout(timer);
  }, [nameInput]);

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

    router.push(`/sites?${params.toString()}`);
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

    router.push(`/sites?${params.toString()}`);
  };

  const clearFilters = () => {
    setNameInput('');
    router.push('/sites');
  };

  const hasActiveFilters = selectedFolderIds.length > 0 || selectedTagIds.length > 0 || nameInput.length > 0;

  return (
    <div className="mb-6 space-y-3">
      {/* Recherche par nom */}
      <div className="relative max-w-sm">
        <HugeiconsIcon
          icon={Search01Icon}
          strokeWidth={2}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
        />
        <Input
          placeholder="Rechercher un site..."
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Folders */}
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

      {/* Tags */}
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
                variant={selectedTagIds.includes(tag.id) ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => handleTagClick(tag.id)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Clear filters button */}
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
