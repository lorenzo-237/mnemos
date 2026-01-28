'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getTags } from '@/lib/actions/tags';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';

interface TagSelectorProps {
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
  label?: string;
}

export function TagSelector({ selectedTagIds, onChange, label = "Tags" }: TagSelectorProps) {
  const [availableTags, setAvailableTags] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTags().then((tags) => {
      setAvailableTags(tags);
      setLoading(false);
    });
  }, []);

  const toggleTag = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}</label>
        <div className="text-sm text-muted-foreground">Chargement des tags...</div>
      </div>
    );
  }

  if (availableTags.length === 0) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}</label>
        <div className="text-sm text-muted-foreground">Aucun tag disponible</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id);
          return (
            <Badge
              key={tag.id}
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
              {isSelected && (
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="ml-1 w-3 h-3" />
              )}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
